import { get, post, put, del } from "./config";

export const getProfile = () => get("/api/users/viewprofile");
export const updateProfile = (data) => post("/api/users/viewprofile/update", data);
