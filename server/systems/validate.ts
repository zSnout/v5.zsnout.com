/** Creates a record consisting of strings and Ts. */
type Dict<T> = Record<string, T>;

/** A list of basic schema types and their TS types. */
interface SchemaMap {
  null: null;
  number: number;
  string: string;
  boolean: boolean;
  "number?": number | null;
  "string?": string | null;
  "boolean?": boolean | null;
}

/** A schema that can be checked with `validate`. */
export type Schema =
  | keyof SchemaMap
  | Schema[]
  | ["tuple", ...Schema[]]
  // cannot use Dict or Record because it throws reference error
  | { [x: string]: Schema };

/** Converts a schema to a TypeScript type. */
export type SchemaToType<T> = Schema extends T
  ? any
  : T extends keyof SchemaMap
  ? SchemaMap[T]
  : T extends ["tuple", ...(infer U & Schema[])]
  ? { [K in keyof U]: SchemaToType<U[K]> }
  : T extends (infer U & Schema)[]
  ? SchemaToType<U>[]
  : T extends Dict<Schema>
  ? {
      [K in keyof T as K extends `${infer U}?` ? U : K]: K extends `${infer U}?`
        ? SchemaToType<T[K]> | undefined
        : SchemaToType<T[K]>;
    }
  : never;

/**
 * Validates a value against a schema.
 * @param value The value to check.
 * @param schema The schema to check against.
 * @returns A boolean indicating whether the object matches the schema.
 */
export default function validate<T extends Schema>(
  value: unknown,
  schema: T
): value is SchemaToType<T> {
  if (
    typeof value == "bigint" ||
    typeof value == "symbol" ||
    typeof value == "function" ||
    typeof value == "undefined"
  )
    return false;

  if (value === null)
    return (
      schema == "number?" ||
      schema == "string?" ||
      schema == "boolean?" ||
      schema == "null"
    );

  if (typeof value == "number")
    return schema == "number" || schema == "number?";
  if (typeof value == "string")
    return schema == "string" || schema == "string?";
  if (typeof value == "boolean")
    return schema == "boolean" || schema == "boolean?";

  if (Array.isArray(schema)) {
    if (!Array.isArray(value)) return false;

    if (hasDirective(schema, "tuple")) {
      let schemae = slice(schema);

      if (schemae.length != value.length) return false;
      return schemae.every((schema, index) => validate(value[index], schema));
    }

    return value.every((val) => schema.some((schema) => validate(val, schema)));
  }

  if (typeof schema == "object") {
    if (!(typeof value == "object")) return false;

    for (let [key, val] of Object.entries(schema)) {
      let isOptional = key.endsWith("?");
      if (isOptional) key = key.slice(0, -1);

      if (typeof (value as any)[key] == "undefined") {
        if (isOptional) continue;
        else return false;
      }

      if (!validate((value as any)[key], val)) return false;
    }

    return true;
  }

  return false;
}

/**
 * Converts a simple schema to a JSON schema.
 * @param schema The schema to convert.
 * @returns A JSON schema.
 */
export function toJSONSchema(schema: Schema): any {
  if (schema == "null") return { type: "null" };
  if (schema == "number") return { type: "number" };
  if (schema == "string") return { type: "string" };
  if (schema == "boolean") return { type: "boolean" };
  if (schema == "number?") return { type: ["number", "null"] };
  if (schema == "string?") return { type: ["string", "null"] };
  if (schema == "boolean?") return { type: ["boolean", "null"] };

  if (Array.isArray(schema)) {
    if (hasDirective(schema, "tuple")) {
      return { type: "array", prefixItems: slice(schema).map(toJSONSchema) };
    }

    if (schema.length == 0) return { type: "array" };
    if (schema.length == 1) return { type: "array", items: toJSONSchema(schema[0]) }; // prettier-ignore
    return { type: "array", items: { anyOf: schema.map(toJSONSchema) } };
  }

  if (typeof schema == "object") {
    let result: any = { type: "object", properties: {}, required: [] };

    for (let [key, val] of Object.entries(schema)) {
      let isOptional = key.endsWith("?");

      if (isOptional) key = key.slice(0, -1);
      else result.required.push(key);

      result.properties[key] = toJSONSchema(val);
    }

    return result;
  }

  return { type: ["number", "string", "boolean", "null", "array", "object"] };
}

/**
 * Checks if the first element of `schema` is `directive`, and returns according types.
 * This is needed because TypeScript throws a bunch of dumb errors when inlining this.
 * @param schema The schema list (with an optional directive) to check.
 * @param directive The directive to look for.
 * @returns A boolean indicating whether `schema` starts with `directive`.
 */
function hasDirective<T extends Extract<Schema, [string, ...Schema[]]>[0]>(
  schema: unknown[],
  directive: T
): schema is [T, ...Schema[]] {
  return schema[0] == directive;
}

/**
 * Cuts the directive from a schema.
 * @param schema The schema to cut.
 * @returns The schema without the first element.
 */
function slice(schema: [string, ...Schema[]]) {
  return schema.slice(1) as Schema[];
}
