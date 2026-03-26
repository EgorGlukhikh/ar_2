import { redirect } from "next/navigation";

export default function AdminLettersRedirectPage() {
  redirect("/admin/emails");
}
