import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const runtime = "nodejs";
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logoData = await readFile(join(process.cwd(), "public/logo-dark.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (Satori) requires a plain img, not next/image */}
        <img src={logoSrc} width={800} height={190} alt="" />
        <div style={{ marginTop: 36, fontSize: 32, fontWeight: 600, color: "#a1a1aa" }}>
          One course. One new career. A fraction of the cost.
        </div>
      </div>
    ),
    { ...size }
  );
}
