package com.veganfood.veganfoodbackend.service;

import com.veganfood.veganfoodbackend.dto.request.CreateTicketRequest;
import com.veganfood.veganfoodbackend.model.SupportTicket;
import com.veganfood.veganfoodbackend.model.User;
import com.veganfood.veganfoodbackend.repository.SupportTicketRepository;
import com.veganfood.veganfoodbackend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SupportTicketService {

    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;

    public SupportTicketService(SupportTicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    // ✅ Customer gửi ticket
    public SupportTicket createTicket(CreateTicketRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SupportTicket ticket = new SupportTicket();
        ticket.setUser(user);
        ticket.setSubject(request.getSubject());
        ticket.setDescription(request.getDescription());
        ticket.setStatus(SupportTicket.Status.pending);
        ticket.setCreatedAt(java.time.LocalDateTime.now());

        return ticketRepository.save(ticket);
    }


    // ✅ Admin/staff xem tất cả tickets
    public List<SupportTicket> getAll() {
        return ticketRepository.findAll();
    }

    // ✅ Customer xem ticket của chính mình
    public List<SupportTicket> getMyTickets(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ticketRepository.findByUser_UserId(user.getUserId());
    }

    // ✅ Cập nhật trạng thái (open, pending, closed)
    public SupportTicket updateStatus(Integer id, SupportTicket.Status status) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus(status);
        return ticketRepository.save(ticket);
    }

    // ✅ Gán người xử lý (assignedTo)
    public SupportTicket assignTo(Integer id, Integer staffId) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        ticket.setAssignedTo(staff);
        return ticketRepository.save(ticket);
    }

    // ✅ Phản hồi ticket (responder trả lời)
    public SupportTicket replyToTicket(Integer ticketId, String replyMessage, String adminEmail) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User responder = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Responder not found"));

        ticket.setResponder(responder);
        ticket.setReplyMessage(replyMessage);
        ticket.setRepliedAt(LocalDateTime.now());
        ticket.setStatus(SupportTicket.Status.pending); // Hoặc closed tuỳ workflow

        return ticketRepository.save(ticket);
    }
}
