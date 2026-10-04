"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";

import { loginAction, type ActionState } from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/submit-button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: ActionState = { status: "idle" };

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <FieldGroup>
        <Field data-invalid={Boolean(state.fieldErrors?.email) || undefined}>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            autoFocus
            required
            aria-invalid={Boolean(state.fieldErrors?.email) || undefined}
          />
          <FieldError>{state.fieldErrors?.email?.[0]}</FieldError>
        </Field>

        <Field data-invalid={Boolean(state.fieldErrors?.password) || undefined}>
          <FieldLabel htmlFor="password">Heslo</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(state.fieldErrors?.password) || undefined}
          />
          <FieldError>{state.fieldErrors?.password?.[0]}</FieldError>
        </Field>

        {state.status === "error" && state.message ? (
          <p
            role="alert"
            className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
          >
            {state.message}
          </p>
        ) : null}

        <SubmitButton size="lg" className="w-full" pendingLabel="Prihlasujem…">
          <LogIn />
          Prihlásiť sa
        </SubmitButton>
      </FieldGroup>
    </form>
  );
}
