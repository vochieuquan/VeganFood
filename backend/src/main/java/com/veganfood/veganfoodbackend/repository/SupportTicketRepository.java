package com.veganfood.veganfoodbackend.repository;

import com.veganfood.veganfoodbackend.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Integer> {
    // ✅ Khách hàng: xem danh sách ticket của chính mình
    List<SupportTicket> findByUser_UserId(Integer userId);

    // ✅ Admin: lọc theo trạng thái
    List<SupportTicket> findByStatus(SupportTicket.Status status);

    // ✅ Admin: lọc các ticket chưa có người trả lời
    List<SupportTicket> findByResponderIsNull();

    // ✅ Admin: lọc các ticket đã được assigned
    List<SupportTicket> findByAssignedToIsNotNull();
}
