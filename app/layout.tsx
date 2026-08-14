import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AddCourseFab from "@/components/AddCourseFab";
import "./globals.css";

// Body copy: a clean, neutral interface sans, kept highly readable at
// small sizes.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Headlines: a heavy, high-contrast grotesk — the brand needs to sound like
// it's telling you a hard truth, not like a generic SaaS template, and a
// timid font undercuts that no matter what the copy says. Applied globally
// to every heading via the --font-headline token in globals.css, not
// per-component, so it can't drift out of sync page to page.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
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
    <html
      lang="en"
      className={`${inter.variable} ${archivo.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
        <SiteFooter />
        <AddCourseFab />
      </body>
    </html>
  );
}
