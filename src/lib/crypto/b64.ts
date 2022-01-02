export function toB64(source: string) {
  return typeof btoa === "undefined" ? Buffer.from(source).toString("base64") : btoa(source)
}

export function fromB64(source: string) {
  return typeof atob === "undefined" ? Buffer.from(source, "base64").toString() : atob(source)
}
