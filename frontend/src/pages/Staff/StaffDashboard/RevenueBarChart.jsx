import React, { useState, useMemo } from "react";
import { Spinner, Alert, Form } from "react-bootstrap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const TIME_OPTIONS = [
  { label: "Day", value: "day" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" }
];

function groupRevenue(orders, granularity) {
  const map = {};
  orders.forEach(order => {
    if (!order.createdAt || typeof order.totalAmount !== "number") return;
    let key = "";
    if (granularity === "day") key = order.createdAt.slice(0, 10);
    else if (granularity === "month") key = order.createdAt.slice(0, 7);
    else if (granularity === "year") key = order.createdAt.slice(0, 4);
    if (key) map[key] = (map[key] || 0) + order.totalAmount;
  });
  // Sort key tăng dần
  return Object.entries(map)
    .map(([time, revenue]) => ({ date: time, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const RevenueBarChart = ({ recentOrders, loading, error }) => {
  const [granularity, setGranularity] = useState("day");
  const chartData = useMemo(() => groupRevenue(recentOrders, granularity), [recentOrders, granularity]);

  return (
    <div>
      <div className="d-flex align-items-center mb-3">
        <h5 className="mb-0 flex-grow-1">Revenue Bar Chart</h5>
        <Form.Select
          style={{ width: 160, marginLeft: 16 }}
          value={granularity}
          onChange={e => setGranularity(e.target.value)}
        >
          {TIME_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Form.Select>
      </div>
      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} tickFormatter={v => v.toLocaleString()} />
            <Tooltip formatter={v => v.toLocaleString("vi-VN") + "₫"} />
            <Legend />
            <Bar dataKey="revenue" fill="#82ca9d" name="Revenue (₫)" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RevenueBarChart;
