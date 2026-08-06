import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    promise: vi.fn(),
  }),
}));

import { toast as sonnerToast } from "sonner";
import { toast } from "./toast";

describe("toast helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("routes success/error/warning/info to sonner", () => {
    toast.success("Saved");
    toast.error("Failed", { description: "Try again" });
    toast.warning("Careful");
    toast.info("Note");

    expect(sonnerToast.success).toHaveBeenCalledWith("Saved", expect.any(Object));
    expect(sonnerToast.error).toHaveBeenCalledWith(
      "Failed",
      expect.objectContaining({ description: "Try again" })
    );
    expect(sonnerToast.warning).toHaveBeenCalledWith("Careful", expect.any(Object));
    expect(sonnerToast.info).toHaveBeenCalledWith("Note", expect.any(Object));
  });

  it("supports an action button payload", () => {
    const onClick = vi.fn();
    toast.error("Deployment failed", {
      action: { label: "View Logs", onClick },
    });
    expect(sonnerToast.error).toHaveBeenCalledWith(
      "Deployment failed",
      expect.objectContaining({
        action: expect.objectContaining({ label: "View Logs" }),
      })
    );
  });
});
