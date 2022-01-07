import { isElement } from "../xml/parseXml"
import { Namespaces } from "./namespaces"

/**
 * https://xmpp.org/rfcs/rfc3920.html#stanzas-error
 * <"bad-request"/> -- the sender has sent XML that is malformed or that cannot be processed (e.g., an IQ stanza that includes an unrecognized value of the 'type' attribute); the associated error type SHOULD be "modify".
 * <"conflict"/> -- access cannot be granted because an existing resource or session exists with the same name or address; the associated error type SHOULD be "cancel".
 * <"feature-not-implemented"/> -- the feature requested is not implemented by the recipient or server and therefore cannot be processed; the associated error type SHOULD be "cancel".
 * <"forbidden"/> -- the requesting entity does not possess the required permissions to perform the action; the associated error type SHOULD be "auth".
 * <"gone"/> -- the recipient or server can no longer be contacted at this address (the error stanza MAY contain a new address in the XML character data of the   * <gone/> element); the associated error type SHOULD be "modify".
 * <"internal-server-error"/> -- the server could not process the stanza because of a misconfiguration or an otherwise-undefined internal server error; the associated error type SHOULD be "wait".
 * <"item-not-found"/> -- the addressed JID or item requested cannot be found; the associated error type SHOULD be "cancel".
 * <"jid-malformed"/> -- the sending entity has provided or communicated an XMPP address (e.g., a value of the 'to' attribute) or aspect thereof (e.g., a resource identifier) that does not adhere to the syntax defined in Addressing Scheme; the associated error type SHOULD be "modify".
 * <"not-acceptable"/> -- the recipient or server understands the request but is refusing to process it because it does not meet criteria defined by the recipient or server (e.g., a local policy regarding acceptable words in messages); the associated error type SHOULD be "modify".
 * <"not-allowed"/> -- the recipient or server does not allow any entity to perform the action; the associated error type SHOULD be "cancel".
 * <"not-authorized"/> -- the sender must provide proper credentials before being allowed to perform the action, or has provided improper credentials; the associated error type SHOULD be "auth".
 * <"payment-required"/> -- the requesting entity is not authorized to access the requested service because payment is required; the associated error type SHOULD be "auth".
 * <"recipient-unavailable"/> -- the intended recipient is temporarily unavailable; the associated error type SHOULD be "wait" (note: an application MUST NOT return this error if doing so would provide information about the intended recipient's network availability to an entity that is not authorized to know such information).
 * <"redirect"/> -- the recipient or server is redirecting requests for this information to another entity, usually temporarily (the error stanza SHOULD contain the alternate address, which MUST be a valid JID, in the XML character data of the   * <redirect/> element); the associated error type SHOULD be "modify".
 * <"registration-required"/> -- the requesting entity is not authorized to access the requested service because registration is required; the associated error type SHOULD be "auth".
 * <"remote-server-not-found"/> -- a remote server or service specified as part or all of the JID of the intended recipient does not exist; the associated error type SHOULD be "cancel".
 * <"remote-server-timeout"/> -- a remote server or service specified as part or all of the JID of the intended recipient (or required to fulfill a request) could not be contacted within a reasonable amount of time; the associated error type SHOULD be "wait".
 * <"resource-constraint"/> -- the server or recipient lacks the system resources necessary to service the request; the associated error type SHOULD be "wait".
 * <"service-unavailable"/> -- the server or recipient does not currently provide the requested service; the associated error type SHOULD be "cancel".
 * <"subscription-required"/> -- the requesting entity is not authorized to access the requested service because a subscription is required; the associated error type SHOULD be "auth".
 * <"undefined-condition"/> -- the error condition is not one of those defined by the other conditions in this list; any error type may be associated with this condition, and it SHOULD be used only in conjunction with an application-specific condition.
 * <"unexpected-request"/> -- the recipient or server understood the request but was not expecting it at this time (e.g., the request was out of order); the associated error type SHOULD be "wait".
 *
 *
 */
export type DefinedConditions =
  | "bad-request"
  | "conflict"
  | "feature-not-implemented"
  | "forbidden"
  | "gone"
  | "internal-server-error"
  | "item-not-found"
  | "jid-malformed"
  | "not-acceptable"
  | "not-allowed"
  | "not-authorized"
  | "payment-required"
  | "recipient-unavailable"
  | "redirect"
  | "registration-required"
  | "remote-server-not-found"
  | "remote-server-timeout"
  | "resource-constraint"
  | "service-unavailable"
  | "subscription-required"
  | "undefined-condition"
  | "unexpected-request"

export type ErrorType = "cancel" | "continue" | "modify" | "auth" | "wait"

export class StanzaError extends Error {
  name = "StanzaError"

  constructor(public errorType: ErrorType, public definedCondition: DefinedConditions) {
    super(`${errorType} caused by ${definedCondition}`)
  }
}

export class SASLError extends Error {
  name = "SASLError"

  constructor() {
    super("SASLError")
  }
}

export class BindError extends Error {
  name = "BindError"

  constructor(public bindError: "conflict") {
    super(`BindError: ${bindError}`)
  }
}

export function detectErrors(element: Element) {
  const errorElement = Array.from(element.getElementsByTagName("error"))?.[0]
  if (errorElement) {
    const errorCondition = Array.from(errorElement.childNodes).find(
      (x): x is Element => isElement(x) && x.getAttribute("xmlns") === Namespaces.STANZAS && x.tagName != "text"
    )?.tagName as DefinedConditions
    throw new StanzaError(errorElement.getAttribute("type") as ErrorType, errorCondition)
  }
}
