import { unsubscribeByToken } from "@/lib/outreachSuppression";

// RFC 8058 one-click unsubscribe. Mail clients POST here, with no page and no
// confirmation, when the person uses the "Unsubscribe" control next to the
// sender (the List-Unsubscribe-Post header points at this URL). Only POST
// acts: a GET, such as a link scanner opening the URL, does nothing.
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("t") ?? "";
  const ok = await unsubscribeByToken(token);
  return new Response(ok ? "Unsubscribed" : "Unrecognized link", {
    status: ok ? 200 : 400,
    headers: { "Content-Type": "text/plain" },
  });
}
