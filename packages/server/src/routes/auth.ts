import dotenv from "dotenv";
import express, {
  NextFunction,
  Request,
  Response
} from "express";
import jwt from "jsonwebtoken";

import credentials from "../services/credential-svc";

dotenv.config();

const router = express.Router();

const TOKEN_SECRET: string =
  process.env.TOKEN_SECRET || "NOT_A_SECRET";

// ---------- helper: generate JWT token ----------

function generateAccessToken(
  username: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { username },
      TOKEN_SECRET,
      { expiresIn: "1d" },
      (error, token) => {
        if (error || !token) reject(error);
        else resolve(token as string);
      }
    );
  });
}

// ---------- POST /auth/register ----------
// body: { username, password }
router.post("/register", (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (typeof username !== "string" || typeof password !== "string") {
    res.status(400).send("Bad request: Invalid input data.");
  } else {
    credentials
      .create(username, password)
      .then((creds) => generateAccessToken(creds.username))
      .then((token) => {
        res.status(201).send({ token });
      })
      .catch((err) => {
        // Our service throws strings, not Error objects
        const message =
          typeof err === "string" ? err : (err as Error).message;
        res.status(409).send({ error: message });
      });
  }
});

// ---------- POST /auth/login ----------
// body: { username, password }
router.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (typeof username !== "string" || typeof password !== "string") {
    res.status(400).send("Bad request: Invalid input data.");
  } else {
    credentials
      .verify(username, password)
      .then((goodUser: string) => generateAccessToken(goodUser))
      .then((token) => res.status(200).send({ token }))
      .catch((_error) => res.status(401).send("Unauthorized"));
  }
});

// ---------- auth middleware: authenticateUser ----------

export function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  // Expect "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).end();
  } else {
    jwt.verify(token, TOKEN_SECRET, (error, decoded) => {
      if (decoded && !error) {
        (req as any).user = decoded;
        next();
      }
      else res.status(401).end();
    });
  }
}

// default export is the router (for /auth)
export default router;
