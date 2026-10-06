"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  addToList,
  addToNewTag,
  createPhoto,
  createTag,
  deletePhotos,
  deleteTag,
  removeFromList,
  renameTag,
  reorderList,
  reorderTags,
  updatePhoto,
} from "@/lib/admin/gallery";
import {
  ADMIN_HOME_PATH,
  ADMIN_LOGIN_PATH,
  createSessionToken,
  isAdminConfigured,
  verifyCredentials,
} from "@/lib/auth";
import { clearSessionCookie, requireSession, setSessionCookie } from "@/lib/auth-server";
import { UserFacingError } from "@/lib/errors";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { deleteGalleryImage, uploadGalleryImage } from "@/lib/storage";
import { PLACEMENTS, type OrderedList } from "@/lib/types";
import {
  isAcceptedImage,
  loginSchema,
  MAX_IMAGE_BYTES,
  photoSchema,
  tagNameSchema,
  type PhotoInput,
} from "@/lib/validations";

/**
 * Server Actions behind the admin area.
 *
 * Middleware already blocks unauthenticated navigation, but Server Actions are
 * POSTs to the page itself and must re-check the session themselves - every
 * mutating action starts with `requireSession()`.
 */

export type ActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

/** Outcome of a mutation called directly from a client component. */
export type MutationResult = { ok: true } | { ok: false; message: string };

/** Pages whose cached output depends on gallery content. */
function revalidateGallery() {
  revalidatePath("/");
  revalidatePath("/galeria");
  revalidatePath("/admin", "layout");
}

/* -------------------------------------------------------------------------- */
/*  Authentication                                                             */
/* -------------------------------------------------------------------------- */

const LOGIN_ATTEMPT_LIMIT = 8;
const LOGIN_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isAdminConfigured()) {
    return {
      status: "error",
      message:
        "Prihlásenie nie je nastavené - v prostredí chýbajú premenné ADMIN_EMAIL, ADMIN_PASSWORD alebo AUTH_SECRET.",
    };
  }

  const headerList = await headers();
  const clientIp =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";

  const limit = rateLimit(`login:${clientIp}`, LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_MS);

  if (!limit.allowed) {
    return {
      status: "error",
      message: `Príliš veľa pokusov o prihlásenie. Skúste to znova o ${Math.ceil(limit.retryAfterSeconds / 60)} min.`,
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Skontrolujte zadané údaje.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }

  const isValid = await verifyCredentials(parsed.data.email, parsed.data.password);

  if (!isValid) {
    return { status: "error", message: "Nesprávny e-mail alebo heslo." };
  }

  resetRateLimit(`login:${clientIp}`);
  await setSessionCookie(await createSessionToken(parsed.data.email.trim().toLowerCase()));

  const next = formData.get("next");
  const target = typeof next === "string" && next.startsWith("/admin") ? next : ADMIN_HOME_PATH;
  redirect(target);
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect(ADMIN_LOGIN_PATH);
}

/* -------------------------------------------------------------------------- */
/*  Gallery                                                                    */
/* -------------------------------------------------------------------------- */

/** Shared parsing of the photo form (upload and edit post the same fields). */
function parsePhotoForm(
  formData: FormData,
): { success: true; data: PhotoInput } | { success: false; state: ActionState } {
  const parsed = photoSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    imageAlt: formData.get("imageAlt") ?? "",
    tagIds: formData.getAll("tagIds").map(String),
    newTags: formData.getAll("newTags").map(String),
    placements: formData.getAll("placements").map(String),
  });

  if (!parsed.success) {
    return {
      success: false,
      state: {
        status: "error",
        message: "Skontrolujte vyplnené polia.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
      },
    };
  }

  return { success: true, data: parsed.data };
}

/** Validates the uploaded photo; returns null when no file was chosen. */
function readImageFile(formData: FormData): { file: File | null; error?: string } {
  const value = formData.get("image");

  if (!(value instanceof File) || value.size === 0) {
    return { file: null };
  }

  if (value.size > MAX_IMAGE_BYTES) {
    return { file: null, error: "Fotka je príliš veľká - skúste ju zmenšiť alebo vybrať inú." };
  }

  if (!isAcceptedImage(value)) {
    return { file: null, error: "Podporované sú len fotky vo formáte JPG, PNG alebo WEBP." };
  }

  return { file: value };
}

/** One photo from the bulk uploader (the client sends files one by one). */
export async function uploadPhotoAction(formData: FormData): Promise<MutationResult> {
  await requireSession();

  const parsed = parsePhotoForm(formData);
  const image = readImageFile(formData);

  if (image.error) {
    return { ok: false, message: image.error };
  }

  if (!parsed.success) {
    const firstFieldError = Object.values(parsed.state.fieldErrors ?? {})[0]?.[0];
    return { ok: false, message: firstFieldError ?? parsed.state.message ?? "Neplatné údaje." };
  }

  if (!image.file) {
    return { ok: false, message: "Chýba súbor s fotkou." };
  }

  let imagePath: string | null = null;

  try {
    imagePath = await uploadGalleryImage(image.file);
    await createPhoto(parsed.data, imagePath);
  } catch (error) {
    console.error("uploadPhotoAction failed", error);
    if (imagePath) {
      await deleteGalleryImage(imagePath);
    }
    return { ok: false, message: toUserMessage(error) };
  }

  revalidateGallery();
  return { ok: true };
}

export async function updatePhotoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    return { status: "error", message: "Chýba identifikátor fotky." };
  }

  const parsed = parsePhotoForm(formData);
  const image = readImageFile(formData);

  if (image.error) {
    return { status: "error", message: image.error, fieldErrors: { image: [image.error] } };
  }

  if (!parsed.success) {
    return parsed.state;
  }

  let uploadedPath: string | null = null;

  try {
    uploadedPath = image.file ? await uploadGalleryImage(image.file) : null;
    const { replacedImagePath } = await updatePhoto(id, parsed.data, uploadedPath ?? undefined);

    if (replacedImagePath) {
      await deleteGalleryImage(replacedImagePath);
    }
  } catch (error) {
    console.error("updatePhotoAction failed", error);
    if (uploadedPath) {
      await deleteGalleryImage(uploadedPath);
    }
    return { status: "error", message: toUserMessage(error) };
  }

  revalidateGallery();
  redirect(`${ADMIN_HOME_PATH}?stav=upravene`);
}

/* -------------------------------------------------------------------------- */
/*  Gallery - direct calls from client components                              */
/* -------------------------------------------------------------------------- */

const idsSchema = z.array(z.string().min(1).max(100)).min(1).max(500);

const listSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("placement"), placement: z.enum(PLACEMENTS) }),
  z.object({ kind: z.literal("tag"), tagId: z.string().min(1).max(100) }),
]);

/** Runs a validated, session-checked gallery mutation and revalidates pages. */
async function mutate(run: () => Promise<void>): Promise<MutationResult> {
  await requireSession();

  try {
    await run();
  } catch (error) {
    console.error("gallery mutation failed", error);
    return { ok: false, message: toUserMessage(error) };
  }

  revalidateGallery();
  return { ok: true };
}

function invalid(error: z.ZodError): MutationResult {
  return { ok: false, message: error.issues[0]?.message ?? "Neplatné údaje." };
}

export async function deletePhotosAction(ids: string[]): Promise<MutationResult> {
  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success) return invalid(parsed.error);

  return mutate(async () => {
    const imagePaths = await deletePhotos(parsed.data);
    await Promise.all(imagePaths.map(deleteGalleryImage));
  });
}

export async function addToListAction(
  list: OrderedList,
  photoIds: string[],
): Promise<MutationResult> {
  const parsedList = listSchema.safeParse(list);
  const parsedIds = idsSchema.safeParse(photoIds);
  if (!parsedList.success) return invalid(parsedList.error);
  if (!parsedIds.success) return invalid(parsedIds.error);

  return mutate(() => addToList(parsedList.data, parsedIds.data));
}

export async function addToNewTagAction(name: string, photoIds: string[]): Promise<MutationResult> {
  const parsedName = tagNameSchema.safeParse(name);
  const parsedIds = idsSchema.safeParse(photoIds);
  if (!parsedName.success) return invalid(parsedName.error);
  if (!parsedIds.success) return invalid(parsedIds.error);

  return mutate(() => addToNewTag(parsedName.data, parsedIds.data));
}

export async function removeFromListAction(
  list: OrderedList,
  photoIds: string[],
): Promise<MutationResult> {
  const parsedList = listSchema.safeParse(list);
  const parsedIds = idsSchema.safeParse(photoIds);
  if (!parsedList.success) return invalid(parsedList.error);
  if (!parsedIds.success) return invalid(parsedIds.error);

  return mutate(() => removeFromList(parsedList.data, parsedIds.data));
}

export async function reorderListAction(list: OrderedList, ids: string[]): Promise<MutationResult> {
  const parsedList = listSchema.safeParse(list);
  const parsedIds = idsSchema.safeParse(ids);
  if (!parsedList.success) return invalid(parsedList.error);
  if (!parsedIds.success) return invalid(parsedIds.error);

  return mutate(() => reorderList(parsedList.data, parsedIds.data));
}

/* -------------------------------------------------------------------------- */
/*  Tags                                                                       */
/* -------------------------------------------------------------------------- */

export async function createTagAction(name: string): Promise<MutationResult> {
  const parsed = tagNameSchema.safeParse(name);
  if (!parsed.success) return invalid(parsed.error);

  return mutate(async () => {
    await createTag(parsed.data);
  });
}

export async function renameTagAction(id: string, name: string): Promise<MutationResult> {
  const parsed = tagNameSchema.safeParse(name);
  if (!parsed.success) return invalid(parsed.error);

  return mutate(() => renameTag(id, parsed.data));
}

export async function deleteTagAction(id: string): Promise<MutationResult> {
  return mutate(() => deleteTag(id));
}

export async function reorderTagsAction(ids: string[]): Promise<MutationResult> {
  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success) return invalid(parsed.error);

  return mutate(() => reorderTags(parsed.data));
}

/** Our own layers throw Slovak messages; anything else gets a generic one. */
function toUserMessage(error: unknown): string {
  return error instanceof UserFacingError
    ? error.message
    : "Zmenu sa nepodarilo uložiť. Skúste to prosím znova.";
}
