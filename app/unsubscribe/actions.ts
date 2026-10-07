"use server";

import { redirect } from "next/navigation";
import { unsubscribeByToken } from "@/lib/outreachSuppression";

export async function unsubscribeAction(formData: FormData) {
  const ok = await unsubscribeByToken(String(formData.get("token") ?? ""));
  redirect(ok ? "/unsubscribe?status=done" : "/unsubscribe?status=invalid");
}
