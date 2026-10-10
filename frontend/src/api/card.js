import { get, post, del, putWithParams, delWithParams } from "./config";

// Lấy giỏ hàng
export const getCart = () => get("/api/cart");

// Lấy danh sách item trong giỏ hàng
export const getCartItems = () => get("/api/cart/items");

// Thêm sản phẩm vào giỏ hàng
export const addCartItem = (data) => post("/api/cart/items/add", data);

// ✅ Cập nhật số lượng sản phẩm qua query string
export const updateCartItem = ({ productId, quantity }) =>
  putWithParams("/api/cart/items/update", { productId, quantity });

// Xóa một sản phẩm khỏi giỏ hàng
export const removeCartItem = ({ productId }) =>
  delWithParams("/api/cart/items/remove", { productId });

// Xóa toàn bộ giỏ hàng
export const clearCart = () => del("/api/cart/items/clear");
