import type { MetadataRoute } from "next";
import { cookies } from "next/headers";
import { APP_LOGO_COOKIE_NAME, DEFAULT_APP_LOGO } from "@/lib/app-logo";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const cookieStore = await cookies();
  const appLogo = cookieStore.get(APP_LOGO_COOKIE_NAME)?.value || DEFAULT_APP_LOGO;

  return {
    name: "mAI",
    short_name: "mAI",
    description: "Plateforme IA complète et collaborative",
    start_url: "/",
    display: "standalone",
    background_color: "#0f1117",
    theme_color: "#0f1117",
    lang: "fr",
    icons: [
      {
        src: appLogo,
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
  };
}
