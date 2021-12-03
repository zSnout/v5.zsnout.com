import server, { HTTPCode } from "../server";
import {
  attemptLogin,
  createPendingUser,
  LoginFailureReasons,
  UserStatus,
  verifyPendingUser,
} from "../server/systems/account";

server.capture(
  "/account/create/",
  "POST",
  {
    body: {
      username: "string",
      password: "string",
      email: "string",
    },
    reply: {
      error: "boolean",
      message: "string",
      "session?": "string",
    },
  },
  async (req, res) => {
    let { username, password, email } = req.body;
    let status = await createPendingUser(email, username, password);

    switch (status) {
      case UserStatus.InvalidUsername:
        res
          .status(HTTPCode.BadRequest)
          .error("Username is formatted incorrectly.");
        break;

      case UserStatus.InvalidEmail:
        res
          .status(HTTPCode.BadRequest)
          .error("Email address is formatted incorrectly.");
        break;

      case UserStatus.UsernameIsTaken:
        res
          .status(HTTPCode.Conflict)
          .error("This username is already in use. Please choose another.");
        break;

      case UserStatus.EmailIsTaken:
        res
          .status(HTTPCode.Conflict)
          .error("This email address is already in use. Please use another.");
        break;

      case UserStatus.VerificationFailure:
        res
          .status(HTTPCode.InternalServerError)
          .error("The verification email failed to send. Try again later.");
        break;

      default:
        res.status(HTTPCode.Created).send({
          error: false,
          session: status,
          message:
            "The account was successfully created! Check your email for a link to verify your account.",
        });
        break;
    }
  }
);

server.capture(
  "/account/verify/",
  "POST",
  {
    body: { session: "string" },
    reply: { error: "boolean", message: "string" },
  },
  async (req, res) => {
    let verified = await verifyPendingUser(req.body.session);

    if (!verified)
      res
        .status(HTTPCode.NotFound)
        .error(
          "Check that you haven't already verified the account. You can try logging in to it at #LOGINURL#."
        );
    else
      res.send({
        error: false,
        message:
          "Your account was verified! Head to #LOGINURL# to log in to your new account!",
      });
  }
);

server.capture(
  "/account/login/",
  "POST",
  {
    body: { username: "string", password: "string" },
    reply: { error: "boolean", message: "string", "session?": "string" },
  },
  async (req, res) => {
    let login = await attemptLogin(req.body.username, req.body.password);

    switch (login) {
      case LoginFailureReasons.NoUserFound:
        res
          .status(HTTPCode.NotFound)
          .error(
            "We don't have a user with that username. Make sure you spelled the name correctly, or #FINDYOURUSERNAME#."
          );
        break;

      case LoginFailureReasons.IncorrectPassword:
        res
          .status(HTTPCode.Forbidden)
          .error("The password provided is incorrect. Please try again.");
        break;

      default:
        res.send({
          error: false,
          message: "You were successfully logged in!",
          session: login,
        });
    }
  }
);
