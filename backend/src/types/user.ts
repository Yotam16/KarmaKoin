export type User = {
  id: string;
  fname: string;
  sname: string;
  password: string;
  role: "admin" | "user";
  createdAt: number; 
};