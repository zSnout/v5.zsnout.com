import { compare, hash } from "bcrypt";
import { randomUUID } from "crypto";
import { ObjectId } from "mongodb";
import server from "..";

/** The database collection for the accounts table. */
let accounts = server.database("accounts");

/** A regular expression matching usernames. */
let usernameRegex = /^[A-Za-z_][0-9A-Za-z_]{4,15}$/;

/**
 * Checks if a username is valid.
 * @param username The username to check.
 * @returns A boolean indicating whether the selected username is valid.
 */
export function isUsernameValid(username: string): boolean {
  return !!username.match(usernameRegex);
}

/**
 * Checks if a username is valid and available.
 * @param username The username to look for.
 * @returns A promise resolving with a boolean indicating whether the selected username is available.
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  if (!isUsernameValid(username)) return false;

  let users = await accounts.find({ username });
  if (users.length == 0) return true;

  return false;
}

/** A regular expression matching email addresses. */
let emailRegex =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

/**
 * Checks if an email address is valid.
 * @param email The email address to check.
 * @returns A boolean indicating whether the selected email is valid.
 */
export function isEmailValid(email: string): boolean {
  return !!email.match(emailRegex);
}

/**
 * Checks if an email address is valid and available.
 * @param email The email address to look for.
 * @returns A promise resolving with a boolean indicating whether the selected address is available.
 */
export async function isEmailAvailable(email: string): Promise<boolean> {
  if (!isEmailValid(email)) return false;

  let users = await accounts.find({ email: email });
  if (users.length == 0) return true;

  return false;
}

/**
 * Hashes a password using bcrypt.
 * @param password The password to hash.
 * @returns A promise resolving to the hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

/**
 * Checks if a plaintext password matches a hashed one.
 * @param plaintext The plaintext password to check.
 * @param hashed The hashed password to compare against.
 * @returns A promise resolving with a boolean indicating whether the passwords match.
 */
export async function checkPassword(
  plaintext: string,
  hashed: string
): Promise<boolean> {
  return await compare(plaintext, hashed);
}

/**
 * Sends an email to a pending user.
 * @param email The account's email address.
 * @param username The account's username.
 * @param session The account's session ID.
 * @returns A promise resolving with a boolean indicating whether the email was sent.
 */
export async function sendEmailToPendingUser(
  email: AccountTable["email"],
  username: AccountTable["username"],
  session: AccountTable["session"]
): Promise<boolean> {
  return await server.mail({
    to: email,
    subject: `Verify your zSnout account, @${username}!`,
    body: `Hi @${username}! Recently you created an account on zSnout that is pending verification. To verify, go to ${process.env.BASE_URL}/account/verify/?session=${session}. If you don't claim your account in ~10 minutes, we'll give it up for anybody else to use.`,
  });
}

/** The status of something related to users. */
export enum UserStatus {
  /** Returned when the user has been created and is OK and verified. */
  Success,

  /** Returned when a user's username is invalid. */
  InvalidUsername,

  /** Returned when a user's email is invalid. */
  InvalidEmail,

  /** Returned when a user's username is taken. */
  UsernameIsTaken,

  /** Returned when a user's email is taken. */
  EmailIsTaken,

  /** Returned when sending the verification email failed. */
  VerificationFailure,
}

/**
 * Creates a pending user and sends the email to verify.
 * @param email The account's email address.
 * @param username The account's username.
 * @param password The account's unhashed password.
 * @returns A promise resolving to a boolean indicating whether the user was created.
 */
export async function createPendingUser(
  email: AccountTable["email"],
  username: AccountTable["username"],
  password: AccountTable["password"]
) {
  if (!isUsernameValid(username)) return UserStatus.InvalidUsername;
  if (!isEmailValid(email)) return UserStatus.InvalidEmail;
  if (!(await isUsernameAvailable(username))) return UserStatus.UsernameIsTaken;
  if (!(await isEmailAvailable(email))) return UserStatus.EmailIsTaken;

  password = await hashPassword(password);
  let session = randomUUID();
  let _id = new ObjectId();
  let creation = Date.now();

  await accounts.insert({
    _id,
    creation,
    username,
    password,
    session,
    email,
    verified: false,
    verifyCode: randomUUID(),
    bookmarks: [],
    notes: [],
    chats: [],
  });

  if (await sendEmailToPendingUser(email, username, session)) return session;

  await accounts.delete({ _id });
  return UserStatus.VerificationFailure;
}

/**
 * Verifies a pending user and resets their session ID.
 * @param session The session ID to check.
 * @returns `null` if the operation failed, or the new session ID if the operation succeeded.
 */
export async function verifyPendingUser(session: AccountTable["session"]) {
  if (!(await accounts.find({ session })).length) return null;

  let newSession = randomUUID();
  await accounts.update(
    { session },
    { $set: { session: newSession, verified: true } }
  );

  return newSession;
}

/** Reasons a login failure might have occurred. */
export enum LoginFailureReasons {
  /** Returned when no user was found matching the criteria. */
  NoUserFound,

  /** Returned when a user was found but the password is incorrect. */
  IncorrectPassword,
}

/**
 * Attempts a login using a username and password.
 * @param username The username to look for.
 * @param passwd The password to check.
 * @returns A promise resolving to either the user's session ID or a `LoginFailureReason`.
 */
export async function attemptLogin(username: string, passwd: string) {
  let users = await accounts.find({ username });
  if (!users.length) return LoginFailureReasons.NoUserFound;

  users = users.filter(({ password }) => checkPassword(passwd, password));
  if (!users.length) return LoginFailureReasons.IncorrectPassword;

  return users[0].session;
}

/**
 * Gets the username of an account based on session ID.
 * @param session The session ID to check under.
 * @returns A promise resolving to the username or `null` if no user was found.
 */
export async function getUsername(session: string) {
  return (await accounts.find({ session }))[0]?.username || null;
}

setInterval(async () => {
  await accounts.delete({
    verified: false,
    creation: { $lt: Date.now() - 600 * 1000 },
  });
}, 1000);

/** The database table representing accounts. */
export interface AccountTable {
  creation: number;
  username: string;
  /** Passwords will be hashed using bcrypt before putting them into the database. */
  password: string;
  session: string;
  email: string;
  verified: boolean;
  verifyCode: string;
  bookmarks: unknown[];
  notes: ObjectId[];
  chats: ObjectId[];
}

declare global {
  interface DBTables {
    /** The database table representing accounts. */
    accounts: AccountTable;
  }
}
