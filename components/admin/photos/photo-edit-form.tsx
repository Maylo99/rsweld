"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, ImageUp, Loader2, Trash2 } from "lucide-react";

import { deletePhotosAction, updatePhotoAction, type ActionState } from "@/app/admin/actions";
import { PlacementPicker } from "@/components/admin/placement-picker";
import { TagPicker } from "@/components/admin/tag-picker";
import { compressImage, ImageDecodeError } from "@/components/admin/upload/compress-image";
import { useMutation } from "@/components/admin/use-mutation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { placementConfig } from "@/lib/placements";
import type { PhotoItem, PlacementKey, TagItem } from "@/lib/types";

const initialState: ActionState = { status: "idle" };

type PhotoEditFormProps = {
  photo: PhotoItem;
  tags: TagItem[];
  /** How many *other* photos each section holds. */
  occupied: Record<PlacementKey, number>;
  /** 1-based position of this photo in each list it belongs to. */
  positions: { label: string; position: number; total: number; href: string }[];
  readOnly: boolean;
};

export function PhotoEditForm({ photo, tags, occupied, positions, readOnly }: PhotoEditFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updatePhotoAction, initialState);
  const { pending: deleting, run } = useMutation();

  const [tagIds, setTagIds] = useState(photo.tagIds);
  const [newTags, setNewTags] = useState<string[]>([]);
  const [placements, setPlacements] = useState<PlacementKey[]>(photo.placements);
  const [replacement, setReplacement] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const chooseFile = async (file: File | undefined) => {
    setImageError(null);
    if (!file) return;
    setPreparing(true);
    try {
      const compressed = await compressImage(file);
      setReplacement(compressed);
      setPreview(URL.createObjectURL(compressed));
    } catch (error) {
      setImageError(
        error instanceof ImageDecodeError ? error.message : "Fotku sa nepodarilo načítať.",
      );
    } finally {
      setPreparing(false);
    }
  };

  const busy = isPending || preparing || deleting;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        formData.delete("image");
        if (replacement) formData.set("image", replacement);
        startTransition(() => formAction(formData));
      }}
      className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
    >
      <input type="hidden" name="id" value={photo.id} />

      {/* Photo + where it is shown */}
      <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
        <div className="border-border bg-muted relative aspect-[4/3] overflow-hidden rounded-xl border">
          <Image
            src={preview ?? photo.imagePath}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
            unoptimized={Boolean(preview)}
            priority
          />
          {preparing ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => chooseFile(event.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            disabled={busy || readOnly}
            onClick={() => fileInput.current?.click()}
          >
            <ImageUp />
            {replacement ? "Vybrať inú fotku" : "Nahradiť fotku"}
          </Button>
          {replacement ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setReplacement(null);
                setPreview(null);
                if (fileInput.current) fileInput.current.value = "";
              }}
            >
              Ponechať pôvodnú
            </Button>
          ) : null}
        </div>
        {replacement ? (
          <p className="text-muted-foreground text-xs">
            Nová fotka sa uloží po kliknutí na „Uložiť zmeny“. Texty, tagy aj poradie zostanú.
          </p>
        ) : null}
        {imageError ? (
          <p role="alert" className="text-destructive text-sm">
            {imageError}
          </p>
        ) : null}

        {positions.length > 0 ? (
          <div className="border-border bg-card rounded-xl border p-4">
            <h2 className="text-sm font-medium">Poradie na webe</h2>
            <ul className="mt-2 space-y-1.5">
              {positions.map((item) => (
                <li key={item.href} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <Link
                    href={item.href}
                    className="text-primary-soft inline-flex items-center gap-0.5 font-medium whitespace-nowrap hover:underline"
                  >
                    {item.position}. z {item.total}
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* Fields */}
      <FieldGroup>
        <Field data-invalid={Boolean(state.fieldErrors?.title) || undefined}>
          <FieldLabel htmlFor="title">Názov</FieldLabel>
          <Input
            id="title"
            name="title"
            defaultValue={photo.title}
            maxLength={120}
            required
            disabled={readOnly}
            aria-invalid={Boolean(state.fieldErrors?.title) || undefined}
          />
          <FieldError>{state.fieldErrors?.title?.[0]}</FieldError>
        </Field>

        <Field data-invalid={Boolean(state.fieldErrors?.description) || undefined}>
          <FieldLabel htmlFor="description">Popis</FieldLabel>
          <Textarea
            id="description"
            name="description"
            rows={3}
            maxLength={1000}
            defaultValue={photo.description ?? ""}
            disabled={readOnly}
            aria-invalid={Boolean(state.fieldErrors?.description) || undefined}
          />
          <FieldDescription>
            Krátky text pod fotkou — z akého materiálu, pre koho, čo bolo špecifické.
          </FieldDescription>
          <FieldError>{state.fieldErrors?.description?.[0]}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="new-tag">Tagy</FieldLabel>
          <FieldDescription>
            Podľa tagov si návštevník filtruje galériu. Fotka môže mať viac tagov.
          </FieldDescription>
          <TagPicker
            id="new-tag"
            tags={tags}
            selectedIds={tagIds}
            newTags={newTags}
            onChange={(ids, names) => {
              setTagIds(ids);
              setNewTags(names);
            }}
            withHiddenInputs
            disabled={readOnly}
          />
        </Field>

        <Field>
          <FieldTitle>Kde sa fotka zobrazuje</FieldTitle>
          <PlacementPicker
            value={placements}
            onChange={setPlacements}
            occupied={occupied}
            withHiddenInputs
            disabled={readOnly}
          />
          {placements.length === 0 ? (
            <FieldDescription>
              Fotka sa na webe nezobrazí nikde — zostane len tu v administrácii.
            </FieldDescription>
          ) : null}
        </Field>

        <Field data-invalid={Boolean(state.fieldErrors?.imageAlt) || undefined}>
          <FieldLabel htmlFor="imageAlt">
            Popis fotky pre nevidiacich a Google (nepovinné)
          </FieldLabel>
          <Input
            id="imageAlt"
            name="imageAlt"
            defaultValue={photo.imageAlt === photo.title ? "" : photo.imageAlt}
            maxLength={200}
            placeholder={`Ak nevyplníte, použije sa názov: „${photo.title}“`}
            disabled={readOnly}
            aria-invalid={Boolean(state.fieldErrors?.imageAlt) || undefined}
          />
          <FieldDescription>
            Čo je na fotke, napr. „Nerezové zábradlie s lankovou výplňou na interiérovom schodisku“.
          </FieldDescription>
          <FieldError>{state.fieldErrors?.imageAlt?.[0]}</FieldError>
        </Field>

        {state.status === "error" && state.message ? (
          <p
            role="alert"
            className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
          >
            {state.message}
          </p>
        ) : null}

        <div className="border-border flex flex-wrap items-center gap-2 border-t pt-6">
          <Button type="submit" size="lg" disabled={busy || readOnly}>
            {isPending ? <Loader2 className="animate-spin" /> : <Check />}
            {isPending ? "Ukladám…" : "Uložiť zmeny"}
          </Button>
          <Button variant="ghost" size="lg" nativeButton={false} render={<Link href="/admin" />}>
            Zrušiť
          </Button>

          <Dialog>
            <DialogTrigger
              disabled={busy || readOnly}
              render={<Button type="button" variant="destructive" size="lg" className="ml-auto" />}
            >
              <Trash2 />
              Zmazať
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Zmazať fotku?</DialogTitle>
                <DialogDescription>
                  „{photo.title}“ sa odstráni z webu aj z úložiska
                  {photo.placements.length > 0
                    ? ` (teraz je v: ${photo.placements.map((placement) => placementConfig[placement].shortLabel).join(", ")})`
                    : ""}
                  . Túto akciu sa nedá vrátiť späť.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Zrušiť</DialogClose>
                <Button
                  variant="destructive"
                  disabled={deleting}
                  onClick={() =>
                    run(() => deletePhotosAction([photo.id]), {
                      onSuccess: () => router.push("/admin?stav=zmazane"),
                    })
                  }
                >
                  {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                  Zmazať natrvalo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </FieldGroup>
    </form>
  );
}
