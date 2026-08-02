import { redirect } from "next/navigation";

/**
 * This repository contains only the Design System Foundation — there are
 * no application pages. The root route redirects to the internal showcase
 * used to visually verify tokens and primitives.
 */
export default function RootPage() {
  redirect("/design-system");
}
