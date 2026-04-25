import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { type ErrorCode, getMessageByErrorCode } from "@/lib/errors";

describe("getMessageByErrorCode", () => {
  test("handles database errors", () => {
    assert.equal(
      getMessageByErrorCode("bad_request:database"),
      "Une erreur est survenue lors de l'exécution d'une requête dans la base de données."
    );
    assert.equal(
      getMessageByErrorCode("not_found:database"),
      "Une erreur est survenue lors de l'exécution d'une requête dans la base de données."
    );
  });

  test("handles api errors", () => {
    assert.equal(
      getMessageByErrorCode("bad_request:api"),
      "La requête n'a pas pu être traitée. Veuillez vérifier votre saisie et réessayer."
    );
  });

  test("handles activate_gateway errors", () => {
    assert.equal(
      getMessageByErrorCode("bad_request:activate_gateway"),
      "AI Gateway nécessite une carte de crédit valide pour traiter les requêtes."
    );
  });

  test("handles auth errors", () => {
    assert.equal(
      getMessageByErrorCode("unauthorized:auth"),
      "Vous devez vous connecter avant de continuer."
    );
    assert.equal(
      getMessageByErrorCode("forbidden:auth"),
      "Votre compte n'a pas accès à cette fonctionnalité."
    );
  });

  test("handles chat errors", () => {
    assert.equal(
      getMessageByErrorCode("rate_limit:chat"),
      "Vous avez atteint la limite de messages. Revenez dans 1 heure pour continuer."
    );
    assert.equal(
      getMessageByErrorCode("not_found:chat"),
      "Le chat demandé est introuvable. Veuillez vérifier l'identifiant du chat et réessayer."
    );
    assert.equal(
      getMessageByErrorCode("forbidden:chat"),
      "Ce chat appartient à un autre utilisateur. Veuillez vérifier l'identifiant du chat et réessayer."
    );
    assert.equal(
      getMessageByErrorCode("unauthorized:chat"),
      "Vous devez vous connecter pour voir ce chat. Veuillez vous connecter et réessayer."
    );
    assert.equal(
      getMessageByErrorCode("offline:chat"),
      "Nous rencontrons des problèmes pour envoyer votre message. Veuillez vérifier votre connexion Internet et réessayer."
    );
  });

  test("handles document errors", () => {
    assert.equal(
      getMessageByErrorCode("not_found:document"),
      "Le document demandé est introuvable. Veuillez vérifier l'identifiant du document et réessayer."
    );
    assert.equal(
      getMessageByErrorCode("forbidden:document"),
      "Ce document appartient à un autre utilisateur. Veuillez vérifier l'identifiant du document et réessayer."
    );
    assert.equal(
      getMessageByErrorCode("unauthorized:document"),
      "Vous devez vous connecter pour voir ce document. Veuillez vous connecter et réessayer."
    );
    assert.equal(
      getMessageByErrorCode("bad_request:document"),
      "La requête pour créer ou mettre à jour le document est invalide. Veuillez vérifier votre saisie et réessayer."
    );
  });

  test("handles fallback/default cases", () => {
    // We cast to ErrorCode to test fallback behavior since these might not be valid enum values but could occur dynamically
    assert.equal(
      getMessageByErrorCode("unknown:api" as ErrorCode),
      "Un problème est survenu. Veuillez réessayer plus tard."
    );
    assert.equal(
      getMessageByErrorCode("rate_limit:document" as ErrorCode),
      "Un problème est survenu. Veuillez réessayer plus tard."
    );
  });
});
