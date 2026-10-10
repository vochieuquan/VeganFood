import { get, post, put } from "./config";

export const getOrder = () => get("/api/order/");
export const updateOrderStatus = (orderId, status) => put(`/api/order/update-status/${orderId}`, status);
export const cancelOrder = (orderId) => post(`/api/order/${orderId}/cancel`, {});
export const checkoutOrder = (orderData) => post("/api/order/checkout", orderData);
export const getPayOS = (orderId) => get(`/api/payment/create/${orderId}`);
export const getBill = (orderId) => get(`/api/order/list/${orderId}`);

// Get list of orders
export const getOrderList = () => get("/api/order/list");

// Get suggested products based on order history
export const getPreviouslyOrderedProducts = () => get("/api/order/suggested-products");
