import { ApiError, NoAccessError, adminApi } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

const notFound = () => new Response("No encontrado", { status: 404, headers: { "cache-control": "no-store" } });

// BFF: the browser downloads from here; only the server talks to the backend, with the cookie token.
export async function GET() {
  const token = await getSessionToken();
  if (!token) return notFound();
  try {
    const upstream = await adminApi.waitlistCsv(token);
    const headers = new Headers({
      "content-type": upstream.headers.get("content-type") ?? "text/csv; charset=utf-8",
      "content-disposition": upstream.headers.get("content-disposition") ?? 'attachment; filename="waitlist.csv"',
      "cache-control": "no-store",
    });
    return new Response(upstream.body, { status: 200, headers });
  } catch (e) {
    if (e instanceof NoAccessError) return notFound();
    if (e instanceof ApiError) return new Response(e.message, { status: e.status, headers: { "cache-control": "no-store" } });
    throw e;
  }
}
