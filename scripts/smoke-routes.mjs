const baseUrl = (process.env.SMOKE_BASE_URL ?? process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");

const routes = [
  { path: "/api/health", expectedStatuses: [200] },
  { path: "/", expectedStatuses: [200] },
  { path: "/catalog", expectedStatuses: [200] },
  { path: "/sign-in", expectedStatuses: [200] },
  { path: "/admin", expectedStatuses: [200, 302, 303, 307, 308] },
  { path: "/learning", expectedStatuses: [200, 302, 303, 307, 308] },
];

for (const route of routes) {
  const response = await fetch(`${baseUrl}${route.path}`, {
    redirect: "manual",
  });

  if (!route.expectedStatuses.includes(response.status)) {
    throw new Error(
      `[smoke] ${route.path} returned ${response.status}, expected one of ${route.expectedStatuses.join(", ")}`,
    );
  }

  console.log(`[smoke] ${route.path} -> ${response.status}`);
}

console.log(`[smoke] OK against ${baseUrl}`);
