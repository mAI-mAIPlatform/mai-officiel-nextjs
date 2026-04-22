"use client";

export const LANGUAGE_STORAGE_KEY = "mai.language.v1";

export const SUPPORTED_LANGUAGES = ["fr", "en", "es"] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const fallbackLanguage: AppLanguage = "fr";

export const dictionary = {
  en: {
    notifications: "Notifications",
    noNotifications: "No notifications.",
    showNotifications: "Show notifications",
    ghostMode: "Ghost mode",
    ghostModeActive: "Ghost mode active",
    voiceMode: "mAI Voice",
    voiceModeLabel: "Pure voice mode (Experimental)",
    voiceListening: "Listening...",
    voiceStart: "Start voice mode",
    voiceStop: "Stop",
    voiceTranscript: "Transcript",
    voiceSend: "Send to chat",
    voiceCaptions: "Subtitles",
    "errors.database": "An error occurred while executing a database query.",
    "errors.badRequestApi": "The request couldn't be processed. Please check your input and try again.",
    "errors.authRequired": "You need to sign in before continuing.",
    "errors.authForbidden": "Your account does not have access to this feature.",
    "errors.chatRateLimit": "You've reached the message limit. Come back in 1 hour to continue chatting.",
    "errors.chatNotFound": "The requested chat was not found. Please check the chat ID and try again.",
    "errors.chatForbidden": "This chat belongs to another user. Please check the chat ID and try again.",
    "errors.chatUnauthorized": "You need to sign in to view this chat. Please sign in and try again.",
    "errors.chatOffline": "We're having trouble sending your message. Please check your internet connection and try again.",
    "errors.documentNotFound": "The requested document was not found. Please check the document ID and try again.",
    "errors.documentForbidden": "This document belongs to another user. Please check the document ID and try again.",
    "errors.documentUnauthorized": "You need to sign in to view this document. Please sign in and try again.",
    "errors.documentBadRequest": "The request to create or update the document was invalid. Please check your input and try again.",
    "errors.unknown": "Something went wrong. Please try again later.",
  },
  es: {
    notifications: "Notificaciones",
    noNotifications: "Sin notificaciones.",
    showNotifications: "Mostrar notificaciones",
    ghostMode: "Modo Fantasma",
    ghostModeActive: "Modo Fantasma activo",
    voiceMode: "mAI Voice",
    voiceModeLabel: "Modo voz pura (Experimental)",
    voiceListening: "Escuchando...",
    voiceStart: "Iniciar modo voz",
    voiceStop: "Detener",
    voiceTranscript: "Transcripción",
    voiceSend: "Enviar al chat",
    voiceCaptions: "Subtítulos",
    "errors.database": "Ocurrió un error al ejecutar una consulta en la base de datos.",
    "errors.badRequestApi": "No se pudo procesar la solicitud. Por favor revise su entrada y vuelva a intentarlo.",
    "errors.authRequired": "Debe iniciar sesión antes de continuar.",
    "errors.authForbidden": "Su cuenta no tiene acceso a esta función.",
    "errors.chatRateLimit": "Has alcanzado el límite de mensajes. Vuelve en 1 hora para seguir chateando.",
    "errors.chatNotFound": "No se encontró el chat solicitado. Por favor revise el ID del chat y vuelva a intentarlo.",
    "errors.chatForbidden": "Este chat pertenece a otro usuario. Por favor revise el ID del chat y vuelva a intentarlo.",
    "errors.chatUnauthorized": "Debe iniciar sesión para ver este chat. Por favor inicie sesión y vuelva a intentarlo.",
    "errors.chatOffline": "Tenemos problemas para enviar tu mensaje. Por favor revise su conexión a internet y vuelva a intentarlo.",
    "errors.documentNotFound": "No se encontró el documento solicitado. Por favor revise el ID del documento y vuelva a intentarlo.",
    "errors.documentForbidden": "Este documento pertenece a otro usuario. Por favor revise el ID del documento y vuelva a intentarlo.",
    "errors.documentUnauthorized": "Debe iniciar sesión para ver este documento. Por favor inicie sesión y vuelva a intentarlo.",
    "errors.documentBadRequest": "La solicitud para crear o actualizar el documento no era válida. Por favor revise su entrada y vuelva a intentarlo.",
    "errors.unknown": "Algo salió mal. Por favor vuelva a intentarlo más tarde.",
  },
  fr: {
    notifications: "Notifications",
    noNotifications: "Aucune notification.",
    showNotifications: "Afficher les notifications",
    ghostMode: "Mode Fantôme",
    ghostModeActive: "Mode Fantôme actif",
    voiceMode: "mAI Voice",
    voiceModeLabel: "Mode vocal pur (Expérimental)",
    voiceListening: "Écoute en cours…",
    voiceStart: "Lancer le mode vocal",
    voiceStop: "Arrêter",
    voiceTranscript: "Transcription",
    voiceSend: "Envoyer au chat",
    voiceCaptions: "Sous-titres",
    "errors.database": "Une erreur s'est produite lors de l'exécution d'une requête dans la base de données.",
    "errors.badRequestApi": "La requête n'a pas pu être traitée. Veuillez vérifier votre saisie et réessayer.",
    "errors.authRequired": "Vous devez vous connecter avant de continuer.",
    "errors.authForbidden": "Votre compte n'a pas accès à cette fonctionnalité.",
    "errors.chatRateLimit": "Vous avez atteint la limite de messages. Revenez dans 1 heure pour continuer à discuter.",
    "errors.chatNotFound": "Le chat demandé est introuvable. Veuillez vérifier l'ID du chat et réessayer.",
    "errors.chatForbidden": "Ce chat appartient à un autre utilisateur. Veuillez vérifier l'ID du chat et réessayer.",
    "errors.chatUnauthorized": "Vous devez vous connecter pour voir ce chat. Veuillez vous connecter et réessayer.",
    "errors.chatOffline": "Nous rencontrons des difficultés pour envoyer votre message. Veuillez vérifier votre connexion Internet et réessayer.",
    "errors.documentNotFound": "Le document demandé est introuvable. Veuillez vérifier l'ID du document et réessayer.",
    "errors.documentForbidden": "Ce document appartient à un autre utilisateur. Veuillez vérifier l'ID du document et réessayer.",
    "errors.documentUnauthorized": "Vous devez vous connecter pour voir ce document. Veuillez vous connecter et réessayer.",
    "errors.documentBadRequest": "La demande de création ou de mise à jour du document n'est pas valide. Veuillez vérifier votre saisie et réessayer.",
    "errors.unknown": "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.",
  },
} as const;

export type TranslationKey = keyof (typeof dictionary)["fr"];

export function resolveLanguage(value: string | null | undefined): AppLanguage {
  if (!value) {
    return fallbackLanguage;
  }

  return SUPPORTED_LANGUAGES.includes(value as AppLanguage)
    ? (value as AppLanguage)
    : fallbackLanguage;
}

export function getLanguageFromStorage(): AppLanguage {
  if (typeof window === "undefined") {
    return fallbackLanguage;
  }

  return resolveLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
}

export function setLanguageInStorage(language: AppLanguage) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  window.dispatchEvent(
    new CustomEvent("mai:language-updated", { detail: { language } })
  );
}

export function t(key: TranslationKey, language: AppLanguage): string {
  return dictionary[language][key] ?? dictionary.fr[key];
}
