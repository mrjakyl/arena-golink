export const RESERVED_NAMES = new Set([
  "new",
  "edit",
  "api",
  "go",
  "health",
  "setup",
  "login",
  "favicon.ico",
]);

const NAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const DESCRIPTION_MAX = 500;
export const URL_MAX = 4096;

export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Redirect / omnibox: trim, lowercase, first token only. */
export function canonicalizeName(raw: string): string {
  let value = raw.trim().replace(/\+/g, " ");
  try {
    value = decodeURIComponent(value);
  } catch {
    // keep the raw token if it isn't valid percent-encoding
  }
  return value.trim().toLowerCase().split(/\s+/)[0] ?? "";
}

/** Create form: lowercase + trim, but do not silently drop extra tokens. */
export function normalizeSubmittedName(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateName(name: string): string | null {
  if (!name) {
    return "Name is required";
  }
  if (name.length > 64) {
    return "Name must be 1–64 characters";
  }
  if (!NAME_PATTERN.test(name)) {
    return "Use lowercase letters, digits, and hyphens (start and end with a letter or digit)";
  }
  if (RESERVED_NAMES.has(name)) {
    return `"${name}" is reserved. Try a different name.`;
  }
  return null;
}

export function normalizeUrl(raw: string): string {
  return raw.trim();
}

export function validateUrl(url: string): string | null {
  if (!url) {
    return "URL is required";
  }
  if (!/^https?:\/\//i.test(url)) {
    return "URL must start with http:// or https://";
  }
  if ([...url].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) {
    return "URL must not contain control characters";
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "Enter a valid http:// or https:// URL";
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "URL must start with http:// or https://";
  }
  if (parsed.username || parsed.password) {
    return "URLs with credentials are not allowed";
  }
  if (!parsed.hostname) {
    return "Enter a valid http:// or https:// URL";
  }
  if (parsed.href.length > URL_MAX) {
    return `URL must be ${URL_MAX} characters or fewer after encoding`;
  }
  return null;
}

export function normalizeDescription(raw: string | undefined | null): string {
  return (raw ?? "").trim();
}

export function validateDescription(description: string): string | null {
  if (description.length > DESCRIPTION_MAX) {
    return `Description must be ${DESCRIPTION_MAX} characters or fewer`;
  }
  return null;
}

export type LinkInput = {
  name?: unknown;
  url?: unknown;
  description?: unknown;
};

export type ValidatedCreate = {
  name: string;
  url: string;
  description: string;
};

export type ValidatedUpdate = {
  url: string;
  description: string;
};

export function validateCreate(body: LinkInput): {
  value?: ValidatedCreate;
  error?: string;
} {
  if (typeof body.name !== "string" || typeof body.url !== "string") {
    return { error: "Name and URL are required" };
  }
  const name = normalizeSubmittedName(body.name);
  const url = normalizeUrl(body.url);
  const description = normalizeDescription(
    typeof body.description === "string" ? body.description : "",
  );

  const nameError = validateName(name);
  if (nameError) return { error: nameError };
  const urlError = validateUrl(url);
  if (urlError) return { error: urlError };
  const descriptionError = validateDescription(description);
  if (descriptionError) return { error: descriptionError };

  return { value: { name, url: new URL(url).href, description } };
}

export function validateUpdate(body: LinkInput): {
  value?: ValidatedUpdate;
  error?: string;
} {
  if (typeof body.url !== "string") {
    return { error: "URL is required" };
  }
  const url = normalizeUrl(body.url);
  const description = normalizeDescription(
    typeof body.description === "string" ? body.description : "",
  );

  const urlError = validateUrl(url);
  if (urlError) return { error: urlError };
  const descriptionError = validateDescription(description);
  if (descriptionError) return { error: descriptionError };

  return { value: { url: new URL(url).href, description } };
}
