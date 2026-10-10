import { post } from "./config";

export const askChatbot = (message, products) =>
  post("/api/ai/chatbot", { message, products });

export const requestFoodSuggestions = (payload) =>
  post("/api/ai/food-suggestions", payload);
