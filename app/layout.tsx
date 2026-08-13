import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AddCourseFab from "@/components/AddCourseFab";
import "./globals.css";

// A clean, neutral interface sans — the closest freely-licensed match to
// Claude's own UI typography (Anthropic's actual product font isn't
// redistributable), used for both the wordmark and all body text.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Verified reviews from real, paying learners — no pay-to-rank, no fabricated stats. Find out which online courses actually deliver before you spend your money or your time.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full scroll-smooth antialiased`}>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
        <SiteFooter />
        <AddCourseFab />
      </body>
    </html>
  );
}
