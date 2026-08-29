import { redirect } from "next/navigation";

export default function IdeesPage() {
  redirect("/annonces?tab=idees");
}
