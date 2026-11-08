import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, Cell, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import LoadingOverlay from "../components/LoadingOverlay";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 12px",color:"#0f172a",fontSize:12,boxShadow:"0 4px 6px rgba(0,0,0,.05)"}}>
      <div style={{color:"#64748b",marginBottom:4,fontWeight:600}}>{label}</div>
      {payload.map(p => <div key={p.dataKey} style={{color:"#1a6640",fontWeight:700,fontSize:14}}>₹{p.value?.toLocaleString("en-IN")}</div>)}
    </div>
  );
};

export default function Dashboard() {
  const { auth } = useAuth();
  const role = auth?.user?.role;
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (role === "admin" || role === "manager") {
          const { data } = await api.get("/reports/dashboard");
          setStats(data || {});
        } else if (role === "customer") {
          const { data } = await api.get("/orders");
          const list = Array.isArray(data) ? data : [];
          setStats({
            totalOrders: list.length,
            totalSales: list.reduce((s,o) => s + (Number(o?.total_amount) || 0), 0),
            recentOrders: list.slice(0,5)
          });
        }
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
        setStats({
          totalProducts: 0,
          lowStockCount: 0,
          totalOrders: 0,
          totalBills: 0,
          totalSales: 0,
          recentOrders: [],
          topProducts: [],
          lowStockItems: []
        });
      }
    };
    if (role) {
      load();
    }
  }, [role]);

  if (!stats && role !== "employee") return <LoadingOverlay text="Loading dashboard metrics..." />;

  if (role === "employee") return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card card-pad"
      >
        <h3 style={{marginBottom:16}}>Cashier Dashboard</h3>
        <p>Head to the Billing section to process customer orders.</p>
      </motion.div>
    </div>
  );

  const COLORS = ["#1a6640", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6366f1"];
  const topProducts = (stats?.topProducts || []).map(p => ({
    name: p?._id || "Product", 
    revenue: Number(p?.revenue || 0)
  }));

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
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      {/* Stat cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="stat-grid"
      >
        <motion.div variants={itemAnim} className="stat-card" style={{ transition: "all 0.3s ease" }} whileHover={{ translateY: -5, boxShadow: "var(--shadow-lg)" }}>
          <div className="stat-icon" style={{color:"#10b981",background:"#ecfdf5"}}><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/></svg></div>
          <div>
            <div className="stat-value">{stats?.totalProducts || 0}</div>
            <div className="stat-label" style={{marginTop:4,marginBottom:2}}>Total Products</div>
            <div className="stat-sub">Active items in store</div>
          </div>
        </motion.div>
        
        <motion.div variants={itemAnim} className="stat-card" style={{ transition: "all 0.3s ease" }} whileHover={{ translateY: -5, boxShadow: "var(--shadow-lg)" }}>
          <div className="stat-icon" style={{color:"#3b82f6",background:"#eff6ff"}}><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/></svg></div>
          <div>
            <div className="stat-value">{stats?.totalOrders || 0}</div>
            <div className="stat-label" style={{marginTop:4,marginBottom:2}}>Total Orders</div>
            <div className="stat-sub">Orders placed today</div>
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="stat-card" style={{ transition: "all 0.3s ease" }} whileHover={{ translateY: -5, boxShadow: "var(--shadow-lg)" }}>
          <div className="stat-icon" style={{color:"#1a6640",background:"#eaf3ef"}}><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
          <div>
            <div className="stat-value">₹{(Number(stats?.totalSales) || 0).toLocaleString("en-IN")}</div>
            <div className="stat-label" style={{marginTop:4,marginBottom:2}}>Revenue</div>
            <div className="stat-sub">Total earnings today</div>
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="stat-card" style={{ transition: "all 0.3s ease" }} whileHover={{ translateY: -5, boxShadow: "var(--shadow-lg)" }}>
          <div className="stat-icon" style={{color:"#ef4444",background:"#fef2f2"}}><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></div>
          <div>
            <div className="stat-value">{stats?.lowStockCount || 0}</div>
            <div className="stat-label" style={{marginTop:4,marginBottom:2}}>Low Stock Items</div>
            <div className="stat-sub">Items need restock</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts row */}
      {(role === "admin" || role === "manager") && (
        <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:24}}>
          {/* Revenue bar chart */}
          <div className="card card-pad">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
              <div style={{fontWeight:700,fontSize:15}}>Revenue by Product</div>
              <Link to="/reports" style={{fontSize:12,color:"#1a6640",fontWeight:600}}>View all →</Link>
            </div>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topProducts} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                  <XAxis dataKey="name" tick={{fontSize:11,fill:"#64748b"}} axisLine={false} tickLine={false} dy={8}/>
                  <YAxis tick={{fontSize:11,fill:"#64748b"}} axisLine={false} tickLine={false} dx={-8}/>
                  <Tooltip cursor={{fill:"#f8fafc"}} content={<CustomTooltip />}/>
                  <Bar dataKey="revenue" radius={[6,6,0,0]}>
                    {topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{height:200,display:"grid",placeItems:"center",color:"#94a3b8",fontSize:13}}>No revenue data available</div>
            )}
          </div>

          {/* Low stock panel */}
          <div className="card card-pad" style={{display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div style={{fontWeight:700,fontSize:15}}>Stock Alerts</div>
              <Link to="/stock" style={{fontSize:12,color:"#1a6640",fontWeight:600}}>View all →</Link>
            </div>
            
            {(stats?.lowStockCount || 0) > 0 ? (
              <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:16}}>
                {(stats?.lowStockItems || []).slice(0,4).map(item => (
                  <div key={item._id || item.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:12, transition: "all 0.2s" }} className="hover-lift">
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:"var(--danger)"}}></div>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{item.product_name}</div>
                    </div>
                    <span className="badge badge-red" style={{fontSize:11}}>Only {item.stock} left</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,textAlign:"center"}}>
                <div style={{width:64,height:64,borderRadius:"50%",background:"#f0fdf4",display:"grid",placeItems:"center",color:"#16a34a"}}>
                  <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:"#0f172a",marginBottom:4}}>All stock levels are healthy</div>
                  <div style={{fontSize:12,color:"#64748b"}}>Great job! No items need attention.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="card">
        <div style={{padding:"20px 24px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontWeight:700,fontSize:15}}>Recent Orders</div>
          <Link to="/orders" style={{fontSize:12,color:"#1a6640",fontWeight:600}}>View all →</Link>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentOrders || []).length === 0 ? (
                <tr><td colSpan={4} style={{textAlign:"center",padding:"32px 0",color:"var(--text4)"}}>No orders yet</td></tr>
              ) : (stats?.recentOrders || []).slice(0,3).map(o => (
                <tr key={o._id || o.id}>
                  <td style={{fontSize:13,color:"var(--text2)",fontWeight:500}}>
                    {new Date(o.createdAt || o.date || Date.now()).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}
                  </td>
                  <td style={{fontWeight:500,fontSize:13,color:"var(--text)"}}>{o.customer_id?.name || "Walk-in Customer"}</td>
                  <td><span className="badge badge-green">{o.status || "Completed"}</span></td>
                  <td><strong style={{color:"#1a6640",fontSize:14}}>₹{(Number(o.total_amount) || 0).toLocaleString("en-IN")}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
