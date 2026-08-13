"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ownerAuth } from "@/owner-auth";
import { updateOwnerPublicName } from "@/lib/ownerAccount";

export async function updateOwnerPublicNameAction(formData: FormData) {
  const session = await ownerAuth();
  if (!session?.user?.id) {
    redirect("/owner/signin");
  }

  const name = String(formData.get("name") ?? "").trim();

  await updateOwnerPublicName(session.user.id, name);

  revalidatePath("/owner/profile");
  redirect("/owner/profile?updated=1");
}
