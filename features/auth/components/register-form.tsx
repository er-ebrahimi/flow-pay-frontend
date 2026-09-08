"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { getErrorMessage } from "@/lib/logger";
import { showApiErrorToast } from "@/lib/toast";
import { useRegister } from "../api/use-register";

/**
 * POST /auth/register via the shared mock mutation. Password rules are
 * client-side UX only — the server re-validates (contract: min 8 chars).
 */
export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const register = useRegister();

  const mismatch = confirm.length > 0 && password !== confirm;
  const tooShort = password.length > 0 && password.length < 8;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (tooShort || mismatch) return;

    register.mutate(
      { email, password },
      {
        onSuccess: () => router.push("/login"),
        onError: (err) => {
          const message = getErrorMessage(
            err,
            "Could not create your account.",
          );
          setError(message);
          showApiErrorToast(message);
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Field>
        <FieldLabel htmlFor="register-email">Email</FieldLabel>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(error) || undefined}
        />
        {error ? (
          <FieldError>{error}</FieldError>
        ) : (
          <FieldDescription>We never share your email.</FieldDescription>
        )}
      </Field>

      <Field>
        <FieldLabel htmlFor="register-password">Password</FieldLabel>
        <PasswordInput
          id="register-password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={(tooShort || mismatch) || undefined}
        />
        <FieldDescription>At least 8 characters.</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="register-confirm">Confirm password</FieldLabel>
        <PasswordInput
          id="register-confirm"
          autoComplete="new-password"
          required
          maxLength={72}
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          aria-invalid={mismatch || undefined}
        />
        {mismatch ? <FieldError>Passwords don&apos;t match.</FieldError> : null}
      </Field>

      <Button
        type="submit"
        loading={register.isPending}
        disabled={tooShort || mismatch}
      >
        Create account
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
