import { setClientPreferenceCookie } from "./client-preferences";

export const APP_LOGO_STORAGE_KEY = "mai.app.logo.v1";
export const APP_LOGO_COOKIE_NAME = "mai.app.logo";

export const DEFAULT_APP_LOGO = "/images/logo.png";

export type AppLogoOption = {
  id: string;
  src: string;
  label: string;
  isMaxOnly?: boolean;
};

export const appLogoOptions: AppLogoOption[] = [
  { id: "default", src: "/images/logo.png", label: "Classique" },
  { id: "noir", src: "/images/logo-noir.png", label: "Noir" },
  { id: "noir-blanc", src: "/images/logo-noir-blanc.png", label: "Noir & Blanc" },
  { id: "red-noir", src: "/images/logo-red-noir.png", label: "Rouge & Noir" },
  { id: "red-blanc", src: "/images/logo-red-blanc.png", label: "Rouge & Blanc" },
  { id: "red-degrade-noir", src: "/images/logo-reddégradé-noir.png", label: "Rouge Dégradé & Noir" },
  { id: "red-degrade-blanc", src: "/images/logo-reddégradé-blanc.png", label: "Rouge Dégradé & Blanc" },
  { id: "vert-noir", src: "/images/logo-vert-noir.png", label: "Vert & Noir" },
  { id: "vert-blanc", src: "/images/logo-vert-blanc.png", label: "Vert & Blanc" },
  { id: "violet-noir", src: "/images/logo-violet-noir.png", label: "Violet & Noir" },
  { id: "violet-blanc", src: "/images/logo-violet-blanc.png", label: "Violet & Blanc" },
  { id: "bleu-noir", src: "/images/logo-bleu-noir.png", label: "Bleu & Noir", isMaxOnly: true },
  { id: "bleu-blanc", src: "/images/logo-bleu-blanc.png", label: "Bleu & Blanc", isMaxOnly: true },
  { id: "bleu-degrade-noir", src: "/images/logo-bleudégradé-noir.png", label: "Bleu Dégradé & Noir", isMaxOnly: true },
  { id: "bleu-degrade-blanc", src: "/images/logo-bleudégradé-blanc.png", label: "Bleu Dégradé & Blanc", isMaxOnly: true },
  { id: "ai-star-black", src: "/images/ai-star-black.png", label: "Étoile Noire" },
  { id: "symbole-etoile", src: "/images/Symbole étoile.PNG", label: "Symbole Étoile" },
  { id: "logo-transparent", src: "/images/logo-transparent-lg26.PNG", label: "Transparent LG26" },
];

export function getAppLogoFromStorage(): string {
  if (typeof window === "undefined") {
    return DEFAULT_APP_LOGO;
  }
  return window.localStorage.getItem(APP_LOGO_STORAGE_KEY) || DEFAULT_APP_LOGO;
}

export function setAppLogoInStorage(src: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(APP_LOGO_STORAGE_KEY, src);
    setClientPreferenceCookie(APP_LOGO_COOKIE_NAME, src);
    // Dispatch a custom event so other components can react
    window.dispatchEvent(
      new CustomEvent("mai-app-logo-changed", { detail: src })
    );
  }
}
