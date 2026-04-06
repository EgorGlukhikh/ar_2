import { signOut } from "@academy/auth";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  className?: string;
};

export function LogoutButton({
  size = "sm",
  variant = "outline",
  className,
}: LogoutButtonProps = {}) {
  async function handleLogout() {
    "use server";

    await signOut({ redirectTo: "/" });
  }

  return (
    <form action={handleLogout}>
      <Button type="submit" variant={variant} size={size} className={cn(className)}>
        Выйти
      </Button>
    </form>
  );
}
