import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "../register-form";
import { api } from "@/lib/axios";
import { apiError } from "@/lib/api-error";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/toast";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    back: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Boundary mock (TEST.md §5): the form test never touches the network —
// axios is stubbed and the transport's real behavior is pinned in
// lib/__tests__/axios.test.ts.
vi.mock("@/lib/axios", () => ({
  api: { post: vi.fn() },
}));

vi.mock("@/lib/logger", () => ({
  getErrorMessage: (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback,
  logger: { error: vi.fn() },
}));

vi.mock("@/lib/toast", () => ({
  showApiErrorToast: vi.fn(),
  showApiSuccessToast: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

async function fillForm(email: string, password: string, confirm: string) {
  await userEvent.type(screen.getByLabelText("Email"), email);
  await userEvent.type(screen.getByLabelText(/^Password$/), password);
  await userEvent.type(screen.getByLabelText("Confirm password"), confirm);
}

describe("RegisterForm", () => {
  it("disables submit while the passwords don't match", async () => {
    render(<RegisterForm />, { wrapper: createWrapper() });

    await fillForm("alex@example.com", "password123", "different");
    expect(screen.getByText("Passwords don't match.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeDisabled();
  });

  it("surfaces the 409 conflict for a taken email", async () => {
    vi.mocked(api.post).mockRejectedValueOnce(
      apiError(409, "CONFLICT", "This email is already registered."),
    );
    render(<RegisterForm />, { wrapper: createWrapper() });

    await fillForm("taken@example.com", "password123", "password123");
    await userEvent.click(
      screen.getByRole("button", { name: "Create account" }),
    );

    await waitFor(() => {
      expect(showApiErrorToast).toHaveBeenCalledWith(
        "This email is already registered.",
      );
    });
    expect(
      await screen.findByText("This email is already registered."),
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
    expect(api.post).toHaveBeenCalledWith("/auth/register", {
      email: "taken@example.com",
      password: "password123",
    });
  });

  it("redirects to /login after a successful registration", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        id: "u1",
        email: "new@example.com",
        createdAt: "2026-09-08T12:00:00Z",
      },
    });
    render(<RegisterForm />, { wrapper: createWrapper() });

    await fillForm("new@example.com", "password123", "password123");
    await userEvent.click(
      screen.getByRole("button", { name: "Create account" }),
    );

    await waitFor(() => {
      expect(showApiSuccessToast).toHaveBeenCalledWith(
        "Account created — sign in to continue",
      );
    });
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/login"));
    expect(showApiErrorToast).not.toHaveBeenCalled();
  });
});
