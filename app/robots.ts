import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/account",
        "/owner",
        "/api",
        "/go/",
        "/verify-email",
        "/reset-password",
        "/forgot-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
