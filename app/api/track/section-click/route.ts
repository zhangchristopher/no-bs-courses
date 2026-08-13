import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { auth } from "@/auth";
import { readVisitorId, visitorIdCookie } from "@/lib/visitorId";

export async function POST(request: NextRequest) {
  let body: { courseId?: string; sectionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const courseId = String(body.courseId ?? "");
  const sectionId = String(body.sectionId ?? "");
  if (!courseId || !sectionId) {
    return NextResponse.json({ error: "Missing courseId or sectionId" }, { status: 400 });
  }

  const [section] = await sql<{ section_type: string }[]>`
    SELECT section_type FROM course_sections WHERE id = ${sectionId} AND course_id = ${courseId}
  `;

  const response = NextResponse.json({ ok: true });

  if (section) {
    const session = await auth();
    const existingVisitorId = readVisitorId(request);
    const visitorId = existingVisitorId ?? crypto.randomUUID();

    await sql`
      INSERT INTO course_section_clicks (course_id, section_id, section_type, user_id, visitor_id)
      VALUES (${courseId}, ${sectionId}, ${section.section_type}, ${session?.user?.id ?? null}, ${visitorId})
    `;

    if (!existingVisitorId) {
      response.headers.append("Set-Cookie", visitorIdCookie(visitorId));
    }
  }

  return response;
}
