import { get } from "./config";

export const getUser = () => get("/api/users");

