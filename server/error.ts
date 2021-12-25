import server from ".";

process.on("uncaughtException", (err) => {
  try {
    log.failure("error", err);

    if (process.env.FATAL_ERROR_EMAIL)
      server.mail({
        subject: "Fatal Error!",
        body: `A fatal error has occurred: ${err?.message || err}\n\n${
          err.stack || "no stack available"
        }`,
        to: process.env.FATAL_ERROR_EMAIL,
      });
  } catch (e) {
    log.failure("error", "Failed to send fatal error email");
  }
});

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** If present, possible fatal errors will be sent to this address. */
      FATAL_ERROR_EMAIL?: string;
    }
  }
}
