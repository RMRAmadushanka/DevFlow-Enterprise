import { Mail } from "lucide-react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { TextInput } from "./text-input";

describe("TextInput", () => {
  it("renders a labeled textbox and reports typed values", async () => {
    const onChange = vi.fn();
    render(<TextInput label="Email" onChange={onChange} />);
    const user = userEvent.setup();

    const input = screen.getByLabelText("Email");
    await user.type(input, "hi");

    expect(onChange).toHaveBeenCalledWith("h");
    expect(onChange).toHaveBeenCalledWith("hi");
  });

  it("supports uncontrolled usage via defaultValue", () => {
    render(<TextInput label="Name" defaultValue="Ada" />);
    expect(screen.getByLabelText("Name")).toHaveValue("Ada");
  });

  it("renders an icon, prefix, and suffix", () => {
    render(<TextInput label="Website" icon={<Mail data-testid="icon" />} prefix="https://" suffix=".com" />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("https://")).toBeInTheDocument();
    expect(screen.getByText(".com")).toBeInTheDocument();
  });

  it("shows and clears via the clear button once there's a value", async () => {
    render(<TextInput label="Search term" defaultValue="query" clearButton />);
    const user = userEvent.setup();

    const clearButton = screen.getByRole("button", { name: "Clear" });
    await user.click(clearButton);

    expect(screen.getByLabelText("Search term")).toHaveValue("");
  });

  it("does not render a clear button when there is no value", () => {
    render(<TextInput label="Search term" clearButton />);
    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
  });

  it("marks the field as required and disabled appropriately", () => {
    render(<TextInput label="Full name" required disabled />);
    const input = screen.getByLabelText(/Full name/);
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
  });

  it("surfaces an error message wired via aria-describedby", () => {
    render(<TextInput label="Email" error="Email is invalid" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Email is invalid")).toBeInTheDocument();
    expect(input.getAttribute("aria-describedby")).toContain(
      screen.getByText("Email is invalid").closest("[id]")?.id
    );
  });

  it("disables the input while loading", () => {
    render(<TextInput label="Email" loading />);
    expect(screen.getByLabelText("Email")).toBeDisabled();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <TextInput label="Email" helperText="We'll never share this" required />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});
