import { get, post } from "./config";

// Lấy tất cả đánh giá của một sản phẩm
export const getProductReviews = (productId) => 
  get(`/api/feedback/product/${productId}`);

// Gửi đánh giá mới
export const submitReview = (data) => 
  post("/api/feedback", data);


