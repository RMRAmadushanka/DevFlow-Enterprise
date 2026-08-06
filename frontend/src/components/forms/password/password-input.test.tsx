import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { PasswordInput } from "./password-input";

describe("PasswordInput", () => {
  it("masks the value by default and reveals it via the show/hide toggle", async () => {
    render(<PasswordInput label="Password" defaultValue="hunter2" />);
    const user = userEvent.setup();

    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("reports typed values via onChange", async () => {
    const onChange = vi.fn();
    render(<PasswordInput label="Password" onChange={onChange} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Password"), "abc");

    expect(onChange).toHaveBeenLastCalledWith("abc");
  });

  it("shows a strength indicator that reacts to the current value", async () => {
    render(<PasswordInput label="Password" showStrengthIndicator />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Password"), "Str0ng!Pass");

    expect(screen.getByText("One uppercase letter")).toBeInTheDocument();
    expect(screen.getByText("Very strong")).toBeInTheDocument();
  });

  it("fills the field with a generated password when the generate button is clicked", async () => {
    render(<PasswordInput label="Password" showGenerateButton />);
    const user = userEvent.setup();

    const input = screen.getByLabelText("Password") as HTMLInputElement;
    expect(input.value).toBe("");

    await user.click(screen.getByRole("button", { name: "Generate a strong password" }));

    expect(input.value.length).toBeGreaterThan(0);
  });

  it("copies the current password to the clipboard when the copy button is clicked", async () => {
    render(<PasswordInput label="Password" defaultValue="hunter2" showCopyButton />);
    const user = userEvent.setup();

    // jsdom re-vends its own (non-mockable-in-`beforeEach`) `navigator.clipboard`
    // the moment Testing Library sets up its environment, so the stub has to
    // be installed here — after `render`/`userEvent.setup()` — to stick.
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    await user.click(screen.getByRole("button", { name: "Copy password" }));

    expect(writeText).toHaveBeenCalledWith("hunter2");
  });

  it("surfaces an error message", () => {
    render(<PasswordInput label="Password" error="Password is too weak" />);
    expect(screen.getByText("Password is too weak")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute("aria-invalid", "true");
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <PasswordInput label="Password" helperText="Use at least 8 characters" showStrengthIndicator required />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});
