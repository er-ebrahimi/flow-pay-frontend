"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
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

interface LoginFormProps {
  /** Verified by the page: same-origin relative path or undefined. */
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl: callbackUrlProp }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only same-origin relative paths are safe as redirect targets.
  const callbackUrl =
    callbackUrlProp && callbackUrlProp.startsWith("/") && !callbackUrlProp.startsWith("//")
      ? callbackUrlProp
      : "/";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setError(null);

    try {
      // Errors from authorize() surface as opaque next-auth error names on
      // the client; getErrorMessage maps them to the fallback below.
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        showApiErrorToast("Invalid email or password.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      const message = getErrorMessage(err, "Sign in failed.");
      setError(message);
      showApiErrorToast(message);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(error)}
        />
        {error ? <FieldError>{error}</FieldError> : <FieldDescription>We never share your email.</FieldDescription>}
      </Field>
      <Field>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          required
          maxLength={72}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={Boolean(error)}
        />
      </Field>
      <Button type="submit" loading={isBusy}>
        Sign in
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Register
        </Link>
      </p>
    </form>
  );
}
