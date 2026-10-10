import { get, post, put, del } from "./config";

export const getCustomers = () => get("/api/users/role/customers");
export const getEmployees = () => get("/api/users/role/staff-managers");
export const createEmployee = (data) => post("/api/users/create-staff-manager", data);
export const deleteUser = (id) => del(`/api/users/${id}`);