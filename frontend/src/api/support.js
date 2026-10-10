import { get, post, put, del } from "./config";

export const getTickets = () => get("/api/tickets");
export const replyTicket = (ticketId, replyMessage) => put(`/api/tickets/${ticketId}/reply?replyMessage=${replyMessage}`);
export const updateTicketStatus = (ticketId, status) => put(`/api/tickets/${ticketId}/status?status=${status}`);
