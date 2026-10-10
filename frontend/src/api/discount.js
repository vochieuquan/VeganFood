import { get } from "./config";

export const getDiscountByCode = (code) =>
  get(`/api/discounts/code/${encodeURIComponent(code)}`);
