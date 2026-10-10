import { post } from "./config";

export const loginByGoogle = (credential) =>
  post("/api/auth/google", { credential });

export const loginWithAdmin = (email, password) =>
  post("/api/auth/login", { email, password });
