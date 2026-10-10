"use client"

import { useEffect, useState } from "react"
import { getOrder } from "../../../api/order"
import { getBestsellerProducts } from "../../../api/product"
import ManagerSidebar from "../ManagerSidebar/ManagerSidebar"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts"

import "./ManagerDashboard.css"

const ManagerDashboard = () => {
  const [revenueData, setRevenueData] = useState([])
  const [topUsers, setTopUsers] = useState([])
  const [topProducts, setTopProducts] = useState([])
  

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getOrder()
        const data = Array.isArray(res) ? res : res.data
        console.log("✅ Dữ liệu đơn hàng từ API:", data)

        if (!Array.isArray(data)) {
          console.error("❌ Dữ liệu không hợp lệ:", data)
          return
        }

        // Doanh thu theo tháng (YYYY-MM) - GIỮ NGUYÊN LOGIC CỦA BẠN
        const monthlyStats = {}
        data.forEach((order) => {
          const date = new Date(order.created_at || order.createdAt)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

          if (!monthlyStats[monthKey]) {
            monthlyStats[monthKey] = {
              month: monthKey,
              totalRevenue: 0,
              orderCount: 0,
            }
          }

          const amount = order.total_amount ?? order.totalAmount ?? order.amount ?? 0
monthlyStats[monthKey].totalRevenue += typeof amount === "number" ? amount : parseFloat(amount) || 0
monthlyStats[monthKey].orderCount += 1

        })

        const monthlyChartData = Object.values(monthlyStats).sort((a, b) => a.month.localeCompare(b.month))

        setRevenueData(monthlyChartData)

        // Top người tiêu dùng - GIỮ NGUYÊN LOGIC CỦA BẠN
        // Top người tiêu dùng (bao gồm tổng chi và số lần mua)
const userStats = {}

data.forEach((order) => {
  const userId = order.customer?.id || order.user_id || order.userId || "unknown"
  const name = order.customer?.name || order.name || "Không rõ"
  const amount = order.total_amount ?? order.totalAmount ?? order.amount ?? 0
  const parsedAmount = typeof amount === "number" ? amount : parseFloat(amount) || 0

  if (!userStats[userId]) {
    userStats[userId] = {
      userId,
      user: name,
      total: 0,
      orderCount: 0,
    }
  }

  userStats[userId].total += parsedAmount
  userStats[userId].orderCount += 1
})

const topConsumers = Object.values(userStats)
  .sort((a, b) => b.total - a.total)
  .slice(0, 5)

setTopUsers(topConsumers)

      } catch (err) {
        console.error("❌ Lỗi khi lấy đơn hàng:", err)
      }
    }

    const fetchTopProducts = async () => {
      try {
        const res = await getBestsellerProducts()
        const data = Array.isArray(res) ? res : res.data
        console.log("✅ Top sản phẩm:", data)
        setTopProducts(data || [])
      } catch (err) {
        console.error("❌ Lỗi khi lấy top sản phẩm:", err)
      }
    }

    fetchOrders()
    fetchTopProducts()
  }, [])

  // Custom Tooltip với theme xanh lá
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-item" style={{ color: entry.color }}>
              <span className="tooltip-dot" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="dashboard-container">
      <ManagerSidebar />
      <div className="dashboard-main">
        {/* Header */}
        {/* <div className="dashboard-header">
          <h2 className="dashboard-title">Vegan Food Analytics</h2>
          <p className="dashboard-subtitle">Tổng quan về doanh thu và hiệu suất bán hàng thực phẩm chay</p>
        </div> */}

        {/* Doanh thu theo tháng */}
        <div className="chart-card revenue-card">
          <div className="card-accent revenue-accent"></div>
          <h3 className="chart-title">
            <span className="title-dot revenue-dot"></span>
            Doanh thu theo tháng
          </h3>
          <div className="chart-container revenue-container">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#4a5568", fontWeight: "500" }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#4a5568", fontWeight: "500" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "14px", fontWeight: "500" }} />
                <Bar dataKey="totalRevenue" fill="url(#revenueGradient)" name="Doanh thu (VNĐ)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="orderCount" fill="url(#orderGradient)" name="Số đơn" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#48bb78" />
                    <stop offset="100%" stopColor="#38a169" />
                  </linearGradient>
                  <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#68d391" />
                    <stop offset="100%" stopColor="#48bb78" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>


        {/* Top sản phẩm được đặt nhiều nhất */}
        <div className="chart-card products-card">
          <div className="card-accent products-accent"></div>
          <h3 className="chart-title">
            <span className="title-dot products-dot"></span>
            Top 5 món chay bán chạy nhất
          </h3>
          <div className="chart-container products-container">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart layout="vertical" data={topProducts} margin={{ top: 20, right: 30, left: 80, bottom: 5 }}>
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#4a5568", fontWeight: "500" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#4a5568", fontWeight: "500" }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalOrdered" fill="url(#productGradient)" name="Số lượng đã bán" radius={[0, 8, 8, 0]} />
                <defs>
                  <linearGradient id="productGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38a169" />
                    <stop offset="100%" stopColor="#2f855a" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard
