import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { auth } from "@/auth";
import { logAffiliateClick } from "@/lib/affiliateClicks";
import { readVisitorId, visitorIdCookie } from "@/lib/visitorId";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const [course] = await sql<
    { id: string; platform_url: string; affiliate_url: string | null; affiliate_link_status: string }[]
  >`
    SELECT id, platform_url, affiliate_url, affiliate_link_status FROM courses WHERE slug = ${slug} LIMIT 1
  `;

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const session = await auth();
  const existingVisitorId = readVisitorId(request);
  const visitorId = existingVisitorId ?? crypto.randomUUID();

  await logAffiliateClick({
    courseId: course.id,
    userId: session?.user?.id ?? null,
    visitorId,
    referrer: request.headers.get("referer"),
  });

  // Only redirect through the affiliate link once admin-verified — an
  // unapproved submission must never receive live traffic.
  const target =
    course.affiliate_link_status === "verified" && course.affiliate_url
      ? course.affiliate_url
      : course.platform_url;

  const response = NextResponse.redirect(target, { status: 302 });
  if (!existingVisitorId) {
    response.headers.append("Set-Cookie", visitorIdCookie(visitorId));
  }
  return response;
}
