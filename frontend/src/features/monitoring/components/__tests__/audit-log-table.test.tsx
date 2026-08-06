import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuditLogTable } from "../audit-log-table";
import { sampleAudit } from "./fixtures";

describe("AuditLogTable", () => {
  it("renders audit log rows", () => {
    render(<AuditLogTable entries={[sampleAudit]} />);

    expect(screen.getByText("Ava Chen")).toBeInTheDocument();
    expect(screen.getByText("repository.settings.update")).toBeInTheDocument();
    expect(screen.getByText(/repository:\s*acme\/api-gateway/)).toBeInTheDocument();
  });
});
