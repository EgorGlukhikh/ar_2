export function getAppBaseUrl() {
  return (
    process.env.APP_BASE_URL ||
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

export function buildWorkspaceInviteUrl(token: string) {
  return `${getAppBaseUrl()}/invite/${token}`;
}
