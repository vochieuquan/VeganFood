import React, { useState, useMemo } from "react";
import { Spinner, Alert, Form } from "react-bootstrap";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const TIME_OPTIONS = [
  { label: "Day", value: "day" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" }
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

function groupOrdersByStatus(orders, granularity) {
  const map = {};
  orders.forEach(order => {
    if (!order.createdAt || !order.status) return;
    let dateKey = "";
    if (granularity === "day") dateKey = order.createdAt.slice(0, 10);
    else if (granularity === "month") dateKey = order.createdAt.slice(0, 7);
    else if (granularity === "year") dateKey = order.createdAt.slice(0, 4);
    
    if (!map[dateKey]) map[dateKey] = {};
    map[dateKey][order.status] = (map[dateKey][order.status] || 0) + 1;
  });
  return map;
}

const OrderStatusPieChart = ({ recentOrders, loading, error }) => {
  const [granularity, setGranularity] = useState("day");
  
  const statusData = useMemo(() => {
    const grouped = groupOrdersByStatus(recentOrders, granularity);
    const latestDate = Object.keys(grouped).sort().pop();
    const statusCounts = latestDate ? grouped[latestDate] : {};
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));
  }, [recentOrders, granularity]);

  const totalOrders = statusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div>
      <div className="d-flex align-items-center mb-3">
        <h5 className="mb-0 flex-grow-1">Order Status Ratio</h5>
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
        <div>
          <p className="text-muted mb-3">
            Total Orders: <strong>{totalOrders}</strong>
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default OrderStatusPieChart;
