"use client";

import { api } from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";
import { useApiMutation } from "@/hooks/use-api-mutation";

// Contract: POST /auth/register { email, password } → 201
// { id, email, createdAt }; 409 CONFLICT when the email is already
// registered. The 201 body isn't documented in the live Swagger — typed per
// docs/API_CONTRACT.md and parsed defensively.

export interface RegisterResponse {
  id: string;
  email: string;
  createdAt: string;
}

export async function registerAccount(input: {
  email: string;
  password: string;
}): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>(
    endpoints.auth.register,
    input,
  );
  return response.data;
}

export function useRegister() {
  return useApiMutation({
    mutationFn: registerAccount,
    successMessage: "Account created — sign in to continue",
    errorMessage: "Could not create your account",
    logError: "Failed to register",
  });
}
