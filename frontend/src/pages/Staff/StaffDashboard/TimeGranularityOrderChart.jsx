import React, { useState, useMemo } from "react";
import { Spinner, Alert, Form, Row, Col } from "react-bootstrap";
import LineChartOrderByDate from "./LineChartOrderByDate";

const TIME_OPTIONS = [
  { label: "Day", value: "day" },
  { label: "Hour", value: "hour" }
];

function groupOrders(orders, granularity) {
  const map = {};
  orders.forEach(order => {
    if (!order.createdAt) return;
    let key = "";
    if (granularity === "day") key = order.createdAt.slice(0, 10);
    else if (granularity === "hour") key = order.createdAt.slice(0, 13) + ":00";
    if (key) map[key] = (map[key] || 0) + 1;
  });
  // Sort key tăng dần
  return Object.entries(map)
    .map(([time, count]) => ({ date: time, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const TimeGranularityOrderChart = ({ recentOrders, loading, error }) => {
  const [granularity, setGranularity] = useState("day");
  const chartData = useMemo(() => groupOrders(recentOrders, granularity), [recentOrders, granularity]);

  return (
    <div>
      <div className="d-flex align-items-center mb-3">
        <h5 className="mb-0 flex-grow-1">Number of Orders Over Time</h5>
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
        <LineChartOrderByDate
          title={`Number of Orders by ${TIME_OPTIONS.find(o => o.value === granularity).label}`}
          data={chartData}
        />
      )}
    </div>
  );
};

export default TimeGranularityOrderChart;
