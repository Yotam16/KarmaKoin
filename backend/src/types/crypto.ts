import crypto from "crypto";
export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
}

export function calculateHash(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}