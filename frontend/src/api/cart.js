import { post, get, put, del } from "./config";

export const addToCart = (productId, quantity) => 
  post(`/api/cart/items/add?productId=${productId}&quantity=${quantity}`, {});

export const getCart = () => get("/api/cart");

export const updateCartItem = (itemId, quantity) => 
  put(`/api/cart/items/${itemId}?quantity=${quantity}`, {});

export const removeFromCart = (itemId) => 
  del(`/api/cart/items/${itemId}`);

export const clearCart = () => del("/api/cart/clear");
