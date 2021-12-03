import {
  FastifySchema,
  FastifyReply,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  RouteHandlerMethod,
  RawServerBase,
  ContextConfigDefault,
} from "fastify";
import { RouteOptions } from "fastify/types/route";
import { RouteGenericInterface } from "fastify/types/route";
import server from "..";
import { Schema, SchemaToType, toJSONSchema } from "../systems/validate";

/** The schema for a route defined using `server.capture()`. */
interface RouteSchema<
  Body extends Schema,
  Params extends Schema,
  Querystring extends Schema,
  Reply extends Schema
> {
  body?: Body;
  params?: Params;
  query?: Querystring;
  reply?: Reply;
}

/**
 * Captures a route on the server.
 * @param route The route to capture.
 * @param method The method to use.
 * @param schema The schema to match data against.
 * @param handler A handler called each time the route is served.
 * @returns The main Fastify instance.
 */
function capture<
  Body extends Schema,
  Params extends Schema,
  Querystring extends Schema,
  Reply extends Schema
>(
  route: string,
  method: "GET" | "POST",
  schema: RouteSchema<Body, Params, Querystring, Reply>,
  handler: RouteHandlerMethod<
    RawServerDefault,
    RawRequestDefaultExpression,
    RawReplyDefaultExpression,
    {
      Body: SchemaToType<Body>;
      Headers: SchemaToType<{ "x-auth?": "string" }>;
      Params: SchemaToType<Params>;
      Querystring: SchemaToType<Querystring>;
      Reply: SchemaToType<Reply>;
    }
  >,
  options: Omit<
    RouteOptions<
      RawServerDefault,
      RawRequestDefaultExpression,
      RawReplyDefaultExpression,
      {
        Body: SchemaToType<Body>;
        Headers: SchemaToType<{ "x-auth?": "string" }>;
        Params: SchemaToType<Params>;
        Querystring: SchemaToType<Querystring>;
        Reply: SchemaToType<Reply>;
      },
      ContextConfigDefault,
      FastifySchema
    >,
    "handler" | "method" | "url" | "schema"
  > = {}
) {
  let fschema: FastifySchema = {};
  if (schema.body) fschema.body = toJSONSchema(schema.body);
  if (schema.params) fschema.params = toJSONSchema(schema.params);
  if (schema.query) fschema.querystring = toJSONSchema(schema.query);

  server.route({
    ...options,
    handler,
    method,
    url: route,
    schema: fschema,
  });

  if (route.endsWith("/"))
    server.route({
      handler,
      method,
      url: route.slice(0, -1),
      schema: fschema,
    });

  return server;
}

/**
 * Sends an error message to the client.
 * @param status The status code to send.
 * @param message The error message to send.
 * @returns The Fastify reply instance.
 */
function error(this: FastifyReply, message: string) {
  return this.send(message);
}

server.decorate("capture", capture);
server.decorateReply("error", error);

declare module "fastify" {
  interface FastifyInstance {
    capture: typeof capture;
  }

  interface FastifyReply<
    RawServer extends RawServerBase = RawServerDefault,
    RawRequest extends RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<RawServer>,
    RawReply extends RawReplyDefaultExpression<RawServer> = RawReplyDefaultExpression<RawServer>,
    RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
    ContextConfig = ContextConfigDefault
  > {
    error: RouteGeneric["Reply"] extends { error: boolean }
      ? typeof error
      : never;
  }
}
