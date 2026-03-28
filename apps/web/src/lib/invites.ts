export function getAppBaseUrl() {
  return (
    process.env.APP_BASE_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

export function buildWorkspaceInviteUrl(token: string) {
  return `${getAppBaseUrl()}/invite/${token}`;
}
