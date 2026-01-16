export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
}