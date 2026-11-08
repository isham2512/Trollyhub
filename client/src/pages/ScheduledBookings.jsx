import { useEffect, useState } from "react";
import api from "../api";
import LoadingOverlay from "../components/LoadingOverlay";

export default function ScheduledBookings() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      const list = Array.isArray(res?.data) ? res.data : [];
      // Filter only takeaway orders that are pending
      const takeaways = list.filter(o => o?.order_type === "Takeaway" && o?.status === "Pending");
      // Sort by nearest takeaway time
      takeaways.sort((a, b) => new Date(a.takeaway_time || 0) - new Date(b.takeaway_time || 0));
      setOrders(takeaways);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const int = setInterval(fetchOrders, 30000); // refresh every 30s
    return () => clearInterval(int);
  }, []);

  const markCompleted = async (id) => {
    try {
      await api.patch(`/orders/${id}/status`, { status: "Completed" });
      fetchOrders();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <LoadingOverlay text="Loading scheduled pickups..." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Scheduled Bookings</h2>
        <p style={{ color: "var(--text3)", fontSize: 14 }}>Manage customer takeaway orders and scheduled pickups.</p>
      </div>

      {orders.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: "center", padding: "64px 24px", color: "var(--text4)" }}>
          <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ margin: "0 auto 16px" }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>No Pending Takeaways</div>
          <div style={{ fontSize: 14 }}>There are currently no scheduled pickups waiting.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 20 }}>
          {orders.map(order => {
            const pickupDate = new Date(order.takeaway_time);
            const isOverdue = pickupDate < new Date();

            return (
              <div key={order._id} className="card" style={{ display: "flex", flexDirection: "column", border: isOverdue ? "1px solid var(--danger)" : "1px solid var(--border)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: isOverdue ? "var(--danger-tint)" : "var(--surface2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: isOverdue ? "var(--danger)" : "var(--amber)" }} />
                    <strong style={{ fontSize: 14, color: isOverdue ? "var(--danger)" : "var(--text)" }}>
                      {isOverdue ? "Overdue" : "Scheduled"} Pickup
                    </strong>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)" }}>
                    {pickupDate.toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                <div style={{ padding: 20, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text4)", textTransform: "uppercase", fontWeight: 700 }}>Customer</div>
                      <div style={{ fontWeight: 600 }}>{order.customer_id?.name || "Unknown"}</div>
                      <div style={{ fontSize: 13, color: "var(--text3)" }}>{order.customer_id?.mobile}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "var(--text4)", textTransform: "uppercase", fontWeight: 700 }}>Total Due</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "var(--green)" }}>₹{order.total_amount}</div>
                      <div style={{ fontSize: 12, color: "var(--text3)" }}>{order.payment_method}</div>
                    </div>
                  </div>

                  <div style={{ background: "var(--surface2)", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "var(--text3)" }}>Items Ordered:</div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
                      {order.items.map((item, idx) => (
                        <li key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>{item.quantity}x {item.product_name}</span>
                          <span style={{ color: "var(--text3)" }}>₹{item.subtotal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ padding: 20, borderTop: "1px solid var(--border)" }}>
                  <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => markCompleted(order._id)}>
                    Mark as Handed Over
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
