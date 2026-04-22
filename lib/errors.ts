export type ErrorType =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limit"
  | "offline";

export type Surface =
  | "chat"
  | "auth"
  | "api"
  | "stream"
  | "database"
  | "history"
  | "vote"
  | "document"
  | "suggestions"
  | "activate_gateway";

export type ErrorCode = `${ErrorType}:${Surface}`;

export type ErrorVisibility = "response" | "log" | "none";

export const visibilityBySurface: Record<Surface, ErrorVisibility> = {
  database: "log",
  chat: "response",
  auth: "response",
  stream: "response",
  api: "response",
  history: "response",
  vote: "response",
  document: "response",
  suggestions: "response",
  activate_gateway: "response",
};

export class ChatbotError extends Error {
  type: ErrorType;
  surface: Surface;
  statusCode: number;

  constructor(errorCode: ErrorCode, cause?: string) {
    super();

    const [type, surface] = errorCode.split(":");

    this.type = type as ErrorType;
    this.cause = cause;
    this.surface = surface as Surface;
    this.message = getMessageByErrorCode(errorCode);
    this.statusCode = getStatusCodeByType(this.type);
  }

  toResponse() {
    const code: ErrorCode = `${this.type}:${this.surface}`;
    const visibility = visibilityBySurface[this.surface];

    const { message, cause, statusCode } = this;

    if (visibility === "log") {
      console.error({
        code,
        message,
        cause,
      });

      return Response.json(
        { code: "", message: "Something went wrong. Please try again later." },
        { status: statusCode }
      );
    }

    return Response.json({ code, message, cause }, { status: statusCode });
  }
}

import { t, getLanguageFromStorage } from "./i18n";

export function getMessageByErrorCode(errorCode: ErrorCode): string {
  const language = typeof window !== "undefined" ? getLanguageFromStorage() : "fr";

  if (errorCode.includes("database")) {
    return t("errors.database", language);
  }

  switch (errorCode) {
    case "bad_request:api":
      return t("errors.badRequestApi", language);

    case "bad_request:activate_gateway":
      return "AI Gateway requires a valid credit card on file to service requests. Please visit https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card to add a card and unlock your free credits.";

    case "unauthorized:auth":
      return t("errors.authRequired", language);
    case "forbidden:auth":
      return t("errors.authForbidden", language);

    case "rate_limit:chat":
      return t("errors.chatRateLimit", language);
    case "not_found:chat":
      return t("errors.chatNotFound", language);
    case "forbidden:chat":
      return t("errors.chatForbidden", language);
    case "unauthorized:chat":
      return t("errors.chatUnauthorized", language);
    case "offline:chat":
      return t("errors.chatOffline", language);

    case "not_found:document":
      return t("errors.documentNotFound", language);
    case "forbidden:document":
      return t("errors.documentForbidden", language);
    case "unauthorized:document":
      return t("errors.documentUnauthorized", language);
    case "bad_request:document":
      return t("errors.documentBadRequest", language);

    default:
      return t("errors.unknown", language);
  }
}

function getStatusCodeByType(type: ErrorType) {
  switch (type) {
    case "bad_request":
      return 400;
    case "unauthorized":
      return 401;
    case "forbidden":
      return 403;
    case "not_found":
      return 404;
    case "rate_limit":
      return 429;
    case "offline":
      return 503;
    default:
      return 500;
  }
}
