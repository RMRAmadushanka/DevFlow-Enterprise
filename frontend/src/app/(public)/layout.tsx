import * as React from "react";

/**
 * Public marketing / unauthenticated route group.
 * Keep layouts free of product shell chrome. Feature landing pages mount here later.
 */
export default function PublicGroupLayout({ children }: { children: React.ReactNode }) {
  return <div data-slot="public-layout">{children}</div>;
}
