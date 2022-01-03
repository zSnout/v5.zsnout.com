import "./log";
import Fastify from "fastify";

console.clear();
log("server", "starting up...");
process.env.BASE_URL = process.env.BASE_URL || "http://localhost:3000";

/** The main Fastify instance. */
let server = Fastify();
export default server;

// JSDoc comments are from https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
/** A list of semantic HTTP codes. */
export enum HTTPCode {
  /**
   * The request succeeded. The result meaning of "success" depends on the HTTP method:
   * - `GET`: The resource has been fetched and transmitted in the message body.
   * - `POST`: The resource describing the result of the action is transmitted in the message body.
   */
  OK = 200,

  /** The request succeeded, and a new resource was created as a result. This is typically the response sent after `POST` requests, or some `PUT` requests. */
  Created = 201,

  /** The request has been received but not yet acted upon. It is noncommittal, since there is no way in HTTP to later send an asynchronous response indicating the outcome of the request. It is intended for cases where another process or server handles the request, or for batch processing. */
  Accepted = 202,

  /** The server could not understand the request due to invalid syntax. */
  BadRequest = 400,

  /** Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested responses. */
  Unauthorized = 401,

  /** The client does not have access rights to the content; that is, it is unauthorized, so the server is refusing to give the requested resource. Unlike `401 Unauthorized`, the client's identity is known to the server. */
  Forbidden = 403,

  /** The server can not find the requested resource. In the browser, this means the URL is not recognized. In an API, this can also mean that the endpoint is valid but the resource itself does not exist. Servers may also send this response instead of `403 Forbidden` to hide the existence of a resource from an unauthorized client. This response code is probably the most well known due to its frequent occurrence on the web. */
  NotFound = 404,

  /** This response is sent when a request conflicts with the current state of the server. */
  Conflict = 409,

  InternalServerError = 500,
  ServiceUnavailable = 503,
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** The base URL of this site. May be changed during development and production. */
      BASE_URL: string;
    }
  }
}
