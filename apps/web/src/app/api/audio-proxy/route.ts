import { NextRequest, NextResponse } from "next/server";

/**
 * Resolves Yandex Disk public share links to direct download URLs.
 * Yandex Disk share pages (disk.yandex.ru/i/...) are HTML pages, not audio files.
 * The Yandex Disk public API returns the actual downloadable file URL.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Resolve Yandex Disk public share links
  if (url.includes("disk.yandex.ru") || url.includes("yadi.sk")) {
    try {
      const apiEndpoint = `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(url)}`;
      const res = await fetch(apiEndpoint, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = (await res.json()) as { href?: string };
        if (data.href) {
          // Redirect browser to the real file URL — audio element follows and plays
          return NextResponse.redirect(data.href, { status: 307 });
        }
      }
    } catch {
      // fall through to direct redirect
    }
  }

  // Non-Yandex URLs: redirect as-is
  return NextResponse.redirect(url, { status: 307 });
}
