import fs from "fs";
import path from "path";
import type { User } from "../types/user";

/*
  File-backed user repository for KarmaKoin.

  Responsibilities:
  - Load users from mock JSON database
  - Persist changes atomically
  - Provide safe lookup and mutation helpers
  - No business logic, no HTTP, no CoinApp knowledge
*/

const USERS_FILE_PATH = path.join(__dirname, "../../../data/mock-users.json");

/* ---------------------------------------------
   Internal helpers
---------------------------------------------- */

function readFile(): User[] {
  if (!fs.existsSync(USERS_FILE_PATH)) {
    return [];
  }
  const raw = fs.readFileSync(USERS_FILE_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeFile(users: User[]): void {
  fs.writeFileSync(
    USERS_FILE_PATH,
    JSON.stringify(users, null, 2),
    "utf-8"
  );
}

/* ---------------------------------------------
   Public API
---------------------------------------------- */

export function getAllUsers(): User[] {
  return readFile();
}

export function getUserById(userId: string): User | undefined {
  return readFile().find(u => u.id === userId);
}

export function userExists(userId: string): boolean {
  return !!getUserById(userId);
}

export function createUser(id: string, name?: string): User {
  const users = readFile();

  if (users.some(u => u.id === id)) {
    throw new Error(`User already exists: ${id}`);
  }

  const user: User = {
    id,
    name: name ?? id,
    createdAt: Date.now(),
  };

  users.push(user);
  writeFile(users);
  return user;
}

export function assertUserExists(userId: string): void {
  if (!getUserById(userId)) {
    throw new Error(`User does not exist: ${userId}`);
  }
}

export function saveUsers(users: User[]): void {
  writeFile(users);
}
