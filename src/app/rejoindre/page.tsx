import { redirect } from "next/navigation";

// Direct vanity redirect to active member adhesion link
const ACTIVE_MEMBER_TOKEN = "af525c194be3d952dc75d3d761104879f8b40434110069b7b4377983f714021c";

export default function RejoindrePage() {
  redirect(`/invitation/${ACTIVE_MEMBER_TOKEN}`);
}
