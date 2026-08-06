import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

/** Legacy landing path — redirect to the main dashboard. */
export default function HomePage() {
  redirect(routes.app.dashboard);
}
