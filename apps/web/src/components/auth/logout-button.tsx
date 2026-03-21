import { signOut } from "@academy/auth";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  async function handleLogout() {
    "use server";

    await signOut({ redirectTo: "/" });
  }

  return (
    <form action={handleLogout}>
      <Button type="submit" variant="outline">
        Выйти
      </Button>
    </form>
  );
}
