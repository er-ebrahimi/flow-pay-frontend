import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PasswordInput } from "../password-input";

describe("PasswordInput", () => {
  it("renders as a password field by default", () => {
    render(<PasswordInput aria-label="Password" />);
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("toggles between hidden and visible", async () => {
    render(<PasswordInput aria-label="Password" />);
    const input = screen.getByLabelText("Password");

    await userEvent.click(
      screen.getByRole("button", { name: "Show password" }),
    );
    expect(input).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "Hide password" }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Hide password" }),
    );
    expect(input).toHaveAttribute("type", "password");
  });

  it("forwards the value and change handler", async () => {
    render(<PasswordInput aria-label="Password" />);
    const input = screen.getByLabelText("Password");

    await userEvent.type(input, "s3cret!");
    expect(input).toHaveValue("s3cret!");
  });
});
