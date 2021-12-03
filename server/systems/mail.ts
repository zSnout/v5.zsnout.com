import { createTransport, Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import server from "..";

let offline = process.env.NODEMAIL_OFFLINE == "true" ? true : false;
let host = process.env.NODEMAIL_HOST;
let port = +(process.env.NODEMAIL_PORT || NaN);
let user = process.env.NODEMAIL_USER;
let pass = process.env.NODEMAIL_PASS;
let from = process.env.NODEMAIL_FROM;
let secure =
  process.env.NODEMAIL_SECURE == "false" ||
  process.env.NODEMAIL_SECURE == undefined
    ? false
    : true;

/** The mail transporter, or `null` if no transporter is available. */
let transport: Transporter<SMTPTransport.SentMessageInfo> | null = null;

if (offline) {
  log("mailer", "using offline mail system");
} else if (host && !Number.isNaN(port)) {
  try {
    transport = createTransport({ host, port, secure, auth: { user, pass } });
  } catch (err: any) {
    transport = null;
    log("mailer", `no mailer available due to ${err?.message || err}`);
  }
} else {
  log("mailer", "no mailer available due to invalid credentials");
}

/** Options that an email must contain. */
interface MailOptions {
  /** The address(es) to send the email to. */
  to: string | string[];

  /** The subject of the email. */
  subject: string;

  /** The body text of the email. */
  body: string;
}

server.decorate(
  "mail",
  async ({ to, subject, body }: MailOptions): Promise<boolean> => {
    if (offline) {
      log("mailer:msg", `${to} - ${subject} - ${body}`);
      return true;
    } else {
      try {
        await transport?.sendMail({
          from,
          to,
          subject,
          text: body,
        });

        return true;
      } catch (err: any) {
        log("mailer", "message failed to send");
        log("mailer", err);

        return false;
      }
    }
  }
);

declare module "fastify" {
  interface FastifyInstance {
    /**
     *
     * @param options Options that allow for email customization.
     * @returns A promise resolving with a boolean indicating whether the operation was successful.
     */
    mail(options: MailOptions): Promise<boolean>;
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** The host address of the mail system. */
      NODEMAIL_HOST?: string;

      /** The port to use when connecting to the mail system. */
      NODEMAIL_PORT?: string;

      /** The username to use when connecting to the mail system. */
      NODEMAIL_USER?: string;

      /** The password to use when connecting to the mail system. */
      NODEMAIL_PASS?: string;

      /** The address to send from. */
      NODEMAIL_FROM?: string;

      /** Whether the mail system should use a secure connection. */
      NODEMAIL_SECURE?: string;

      /**
       * Whether the mail system should log messages in the server console.
       * Enabling this feature disable other mail systems.
       */
      NODEMAIL_OFFLINE?: string;
    }
  }
}
