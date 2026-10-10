package com.veganfood.veganfoodbackend.controller;

import com.veganfood.veganfoodbackend.dto.request.CreateTicketRequest;
import com.veganfood.veganfoodbackend.model.SupportTicket;
import com.veganfood.veganfoodbackend.service.SupportTicketService;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class SupportTicketController {

    private final SupportTicketService ticketService;

    public SupportTicketController(SupportTicketService ticketService) {
        this.ticketService = ticketService;
    }

    // ✅ Customer gửi ticket
    @PostMapping
    public SupportTicket createTicket(@RequestBody CreateTicketRequest request, Authentication authentication) {
        return ticketService.createTicket(request, authentication.getName());
    }


    // ✅ Admin/staff xem toàn bộ ticket
    @GetMapping
    @PreAuthorize("hasAnyRole('owner', 'manager', 'staff')")
    public List<SupportTicket> getAllTickets() {
        return ticketService.getAll();
    }

    // ✅ Customer xem ticket của mình
    @GetMapping("/me")
    public List<SupportTicket> getMyTickets(Authentication authentication) {
        return ticketService.getMyTickets(authentication.getName());
    }

    // ✅ Cập nhật trạng thái (open, pending, closed)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('owner', 'manager', 'staff')")
    public SupportTicket updateStatus(@PathVariable Integer id, @RequestParam SupportTicket.Status status) {
        return ticketService.updateStatus(id, status);
    }

    // ✅ Gán nhân viên xử lý ticket
    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('owner', 'manager')")
    public SupportTicket assignTo(@PathVariable Integer id, @RequestParam Integer staffId) {
        return ticketService.assignTo(id, staffId);
    }

    // ✅ Admin/staff phản hồi ticket
    @PutMapping("/{id}/reply")
    @PreAuthorize("hasAnyRole('owner', 'manager', 'staff')")
    public SupportTicket replyToTicket(@PathVariable Integer id,
                                       @RequestParam String replyMessage,
                                       Authentication authentication) {
        return ticketService.replyToTicket(id, replyMessage, authentication.getName());
    }
}
