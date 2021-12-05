import {
  Collection,
  Filter,
  MongoClient,
  OptionalId,
  UpdateFilter,
  WithId,
} from "mongodb";
import server from "..";

/** The URL to connect to. */
let clientURL = process.env.NODEMONGO_URL || "mongodb://127.0.0.1:27017/zsnout";

/** The database name to use. */
let clientDB = process.env.NODEMONGO_DB || "zsnout";

/** The main MongoDB client. */
let client = new MongoClient(clientURL);

/** A promise resolving once the client is connected. */
let connect = client.connect();

/** The main MongoDB database. */
let mongo = client.db(clientDB);

/**
 * Creates a new DBCollection instance.
 * @param collection The name of the collection to get.
 * @returns The created DBCollection instance.
 */
function database<T extends keyof Database>(collection: T) {
  return new DBCollection<Database[T]>(mongo.collection(collection));
}

server.decorate("database", database);

/** A database collection. Internally uses MongoDB. */
class DBCollection<T extends {}> {
  constructor(private collection: Collection<T>) {}

  /**
   * Finds documents in the collection.
   * @param query A filter to match documents against.
   * @returns A promise resolving to an array of documents.
   */
  async find(query: Filter<T>) {
    await connect;
    return this.collection.find(query).toArray();
  }

  /**
   * Inserts documents into the collection.
   * @param documents The documents to insert.
   * @returns A promise resolving once the documents have been inserted.
   */
  async insert(...documents: OptionalId<T>[]): Promise<void> {
    await connect;
    await this.collection.insertMany(documents);
  }

  /**
   * Updates documents in the collection.
   * @param query A filter to match documents against.
   * @param data The data to update the documents with.
   * @returns A promise resolving once the documents have been updated.
   */
  async update(query: Filter<T>, data: UpdateFilter<T>): Promise<void> {
    await connect;
    await this.collection.updateMany(query, data);
  }

  /**
   * Deletes documents from the collection.
   * @param query A filter to match documents against.
   * @returns A promise resolving once the documents have been deleted.
   */
  async delete(query: Filter<T>): Promise<void> {
    await connect;
    await this.collection.deleteMany(query);
  }
}

declare module "fastify" {
  interface FastifyInstance {
    /**
     * Creates a new DBCollection instance.
     * @param collection The name of the collection to get.
     * @returns The created DBCollection instance.
     */
    database: typeof database;
  }
}

/** The base interface all tables must implement. */
export interface Table {
  /** The entry's UUID. */
  id: string;

  /** The timestamp of the entry's creation. */
  creation: number;
}

/** The possibilities that DBTables can have. */
type BaseDatabase = { [x: string]: Table };

declare global {
  /** A list of possible database tables. */
  interface DBTables extends BaseDatabase {}

  /** A list of possible database tables. */
  type Database = {
    [K in keyof DBTables as string extends K
      ? never
      : K extends number
      ? never
      : K]: DBTables[K];
  };

  namespace NodeJS {
    interface ProcessEnv {
      /** The URL to connect to. */
      NODEMONGO_URL?: string;

      /** The database name to use. */
      NODEMONGO_DB?: string;
    }
  }
}
