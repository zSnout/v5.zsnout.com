import validate, { Schema, SchemaToType } from "./validate.js";

/** The result of a fetch operation. */
type FetchResult<T extends Schema | undefined> =
  | (T extends undefined ? { ok: true } : { ok: true; data: SchemaToType<T> })
  | { ok: false; error: string };

/**
 * Fetches some resources from the server.
 * @param route The route to fetch.
 * @param method The method to use.
 * @returns A promise resolving to data returned by the server. If an error occurs, `null` is returned.
 */
export default async function fetch(
  route: string,
  method: "GET" | "POST"
): Promise<FetchResult<undefined>>;

/**
 * Fetches some resources from the server.
 * @param route The route to fetch.
 * @param method The method to use.
 * @param schema The schema to match data against. If none is provided, no data is returned.
 * @param body The body to send to the server. May be a JSON object.
 * @returns A promise resolving to data returned by the server. If an error occurs, `null` is returned.
 */
export default async function fetch<T extends Schema>(
  route: string,
  method: "GET" | "POST",
  schema: T,
  body?: unknown
): Promise<FetchResult<T>>;

export default async function fetch<T extends Schema | undefined>(
  route: string,
  method: "GET" | "POST",
  schema?: T,
  body?: unknown
): Promise<FetchResult<T>> {
  try {
    let request: any = {
      method,
      headers: {
        "x-auth": localStorage.auth ?? "",
      } as Record<string, string>,
    };

    if (body) {
      let json = JSON.stringify(body);

      request.headers["content-type"] = "application/json";
      request.headers["content-length"] = String(json.length);
      request.body = json;
    }

    let response = await window.fetch(route, request);

    let respBody: unknown;
    try {
      try {
        respBody = await response.clone().json();
      } catch {
        respBody = await response.clone().text();
      }
    } catch {
      respBody = null;
    }

    // throws after getting body so that we can use fastify's json message if possible
    if (!response.ok)
      throw new Error(`${(respBody as any).message ?? respBody}`); // prettier-ignore

    if (!schema) return { ok: true } as FetchResult<T>;
    if (validate(respBody, schema))
      return { ok: true, data: respBody } as FetchResult<T>;

    throw new Error("Response doesn't match schema");
  } catch (err: any) {
    return { ok: false, error: String(err?.message || err) };
  }
}

declare global {
  interface Storage {
    /** The user's authetication token. */
    auth?: string;
  }
}
