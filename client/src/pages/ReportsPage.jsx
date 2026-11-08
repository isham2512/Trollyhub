import { useEffect, useState, useMemo } from "react";
import api from "../api";
import { 
  ResponsiveContainer, AreaChart, Area, LineChart, Line, CartesianGrid, 
  XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell 
} from "recharts";
import { motion } from "framer-motion";
import LoadingOverlay from "../components/LoadingOverlay";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", 
      border: "1px solid #e2e8f0", 
      borderRadius: 12, 
      padding: "12px 16px", 
      color: "#0f172a", 
      fontSize: 12, 
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"
    }}>
      <div style={{ color: "#64748b", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }}></div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>
            {p.name === "orders" ? p.value + " orders" : `₹${p.value?.toLocaleString("en-IN")}`}
          </div>
        </div>
      ))}
    </div>
  );
};

const COLORS = ['#1a6640', '#258a58', '#4ade80', '#86efac', '#dcfce7'];

export default function ReportsPage() {
  const [report, setReport] = useState(null);

  useEffect(() => { 
    api.get("/reports/sales")
      .then(r => setReport(r.data || { salesByDay: [], topProducts: [], lowStock: [] }))
      .catch(err => {
        console.error("Failed to load reports:", err);
        setReport({ salesByDay: [], topProducts: [], lowStock: [] });
      }); 
  }, []);

  const chartData = useMemo(() =>
    (report?.salesByDay || []).map(r => {
      const day = r._id?.day ?? 1;
      const month = r._id?.month ?? 1;
      return {
        date: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`,
        revenue: Number(r.revenue || 0),
        orders: Number(r.orders || 0),
      };
    }), [report]);

  const topProducts = useMemo(() =>
    (report?.topProducts || []).map(p => ({ 
      name: p?._id || "Product", 
      revenue: Number(p?.revenue || 0), 
      sold: Number(p?.count || 0) 
    })), [report]);

  const totalRevenue = chartData.reduce((s,d) => s + d.revenue, 0);
  const totalOrders  = chartData.reduce((s,d) => s + d.orders, 0);

  if (!report) return <LoadingOverlay text="Compiling analytics..." />;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 40 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)" }}>Analytics Report</h1>
        <p style={{ color: "var(--text3)", fontSize: 14 }}>Overview of sales performance and stock status</p>
      </motion.div>

      {/* Summary stats */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}
      >
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, sub: "Period sales", icon: "💰", c: "var(--green)" },
          { label: "Total Orders", value: totalOrders, sub: `${chartData.length} active days`, icon: "📦", c: "var(--text)" },
          { label: "Avg Ticket", value: totalOrders ? `₹${(totalRevenue / totalOrders).toFixed(0)}` : "—", sub: "Per order", icon: "🎟️", c: "var(--text)" },
          { label: "Avg Daily Sales", value: chartData.length ? `₹${(totalRevenue / chartData.length).toFixed(0)}` : "—", sub: "Per day", icon: "📈", c: "var(--text)" },
        ].map(s => (
          <motion.div variants={itemAnim} key={s.label} className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 8, transition: "all 0.3s ease" }} whileHover={{ translateY: -5, boxShadow: "var(--shadow-lg)" }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text4)", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.c, margin: "2px 0" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--text4)" }}>{s.sub}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24 }}>
        {/* Line chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card card-pad">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Revenue Performance</div>
              <div style={{ fontSize: 13, color: "var(--text3)" }}>Timeline of daily earnings</div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text3)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" }}></div> Revenue
              </div>
            </div>
          </div>
          {chartData.length === 0 ? (
            <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text4)", fontSize: 14 }}>No historical data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text3)" }} axisLine={false} tickLine={false} dy={10}/>
                <YAxis tick={{ fontSize: 11, fill: "var(--text3)" }} axisLine={false} tickLine={false} dx={-10}/>
                <Tooltip content={<CustomTooltip />}/>
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 3 }}
                  activeDot={{ r: 8, fill: "#3b82f6", stroke: "#fff", strokeWidth: 3 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Top products horizontal bar chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card card-pad" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Best Selling Items</div>
            <div style={{ fontSize: 13, color: "var(--text3)" }}>Top contributors to revenue</div>
          </div>
          {topProducts.length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text4)", fontSize: 14 }}>No sales recorded</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topProducts.slice(0, 5)} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "var(--text)" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />}/>
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={20}>
                    {topProducts.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {topProducts.slice(0, 4).map((p, i) => (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--surface2)", borderRadius: 12, border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length] }}></div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{p.name}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>₹{p.revenue.toLocaleString("en-IN")}</div>
                      <div style={{ fontSize: 10, color: "var(--text4)" }}>{p.sold} units</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Distribution & Low Stock */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 24 }}>
        {/* Order volume bar chart */}
        <div className="card card-pad">
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Order Volume</div>
            <div style={{ fontSize: 13, color: "var(--text3)" }}>Frequency of customer orders</div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text3)" }} axisLine={false} tickLine={false} dy={10}/>
              <YAxis tick={{ fontSize: 11, fill: "var(--text3)" }} axisLine={false} tickLine={false} dx={-10}/>
              <Tooltip content={<CustomTooltip />}/>
              <Bar dataKey="orders" fill="var(--text2)" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock alerts */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg)", borderTopLeftRadius: "var(--r-xl)", borderTopRightRadius: "var(--r-xl)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff1f2", color: "#e11d48", display: "grid", placeItems: "center" }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Stock Inventory Status</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>{ (report?.lowStock||[]).length } items requiring attention</div>
              </div>
            </div>
            <a href="/stock" className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}>Manage Inventory</a>
          </div>
          <div className="tbl-wrap" style={{ flex: 1 }}>
            <table className="tbl">
              <thead><tr><th>Product Name</th><th>Category</th><th>Current Stock</th><th>Status</th></tr></thead>
              <tbody>
                {(report?.lowStock||[]).length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: "40px 0", color: "var(--text4)" }}>All stock levels are optimal</td></tr>
                ) : report.lowStock.slice(0, 5).map(p => (
                  <tr key={p._id}>
                    <td><div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.product_name}</div></td>
                    <td><span className="badge" style={{ background: "var(--surface2)", color: "var(--text2)" }}>{p.category}</span></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 40, height: 6, background: "var(--border)", borderRadius: 10, overflow: "hidden" }}>
                          <div style={{ width: `${Math.min((p.stock/10)*100, 100)}%`, height: "100%", background: p.stock === 0 ? "#ef4444" : "#f59e0b" }}></div>
                        </div>
                        <strong style={{ fontSize: 13, color: p.stock === 0 ? "#ef4444" : "#b45309" }}>{p.stock}</strong>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.stock === 0 ? "badge-red" : "badge-yellow"}`} style={{ fontSize: 11 }}>
                        {p.stock === 0 ? "Empty" : "Low"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
