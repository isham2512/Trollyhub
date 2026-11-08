import React, { useEffect, useState, useMemo } from "react";
import api from "../api";

const statusColor = s => {
  const norm = (s || "").toLowerCase();
  return norm === "completed" ? "badge-green" : norm === "pending" ? "badge-yellow" : "badge-red";
};

export default function OrdersPage() {
  const [orders, setOrders]     = useState([]);
  const [search, setSearch]     = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { 
    api.get("/orders")
      .then(r => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(err => {
        console.error("Failed to fetch orders:", err);
        setOrders([]);
      });
  }, []);

  const safeOrders = useMemo(() => Array.isArray(orders) ? orders : [], [orders]);

  const filtered = useMemo(() =>
    safeOrders.filter(o => {
      if (!o) return false;
      const cName = (o.customer_id?.name || "").toLowerCase();
      const eName = (o.employee_id?.name || "").toLowerCase();
      const idStr = (o._id || o.id || "").toString().toLowerCase();
      const q = (search || "").toLowerCase();
      return cName.includes(q) || eName.includes(q) || idStr.slice(-6).includes(q);
    }), [safeOrders, search]);

  const total = useMemo(() => 
    safeOrders.reduce((s, o) => s + (Number(o?.total_amount) || 0), 0),
    [safeOrders]
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {[
          {label:"Total Orders",value:safeOrders.length,color:"var(--text)"},
          {label:"Revenue",value:`₹${total.toLocaleString("en-IN")}`,color:"var(--green)"},
          {label:"Avg. Order",value:safeOrders.length ? `₹${(total/safeOrders.length).toFixed(0)}` : "—",color:"var(--text)"},
        ].map(s => (
          <div key={s.label} className="card card-pad">
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:"var(--text4)",marginBottom:6}}>{s.label}</div>
            <div style={{fontSize:26,fontWeight:800,color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:"var(--surface)",border:"1.5px solid var(--border)",borderRadius:"var(--r-md)",padding:"9px 14px"}}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--text4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
          <input 
            placeholder="Search by customer, employee or order ID…" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            style={{border:"none",outline:"none",background:"transparent",fontSize:13.5,color:"var(--text)",width:"100%"}} 
          />
        </div>
        <div style={{fontSize:12,color:"var(--text4)",fontWeight:600,whiteSpace:"nowrap"}}>{filtered.length} orders</div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Employee</th>
                <th>Status</th>
                <th>Total</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{textAlign:"center",padding:"48px 0",color:"var(--text4)"}}>
                    <div style={{fontSize:32,marginBottom:8}}>📋</div>No orders found
                  </td>
                </tr>
              ) : filtered.map(o => {
                const orderId = o._id || o.id || Math.random().toString();
                const shortId = orderId.slice(-6).toUpperCase();
                const totalAmt = Number(o.total_amount || 0);
                const isExpanded = expanded === orderId;
                const statusStr = o.status || "Completed";

                return (
                  <React.Fragment key={orderId}>
                    <tr style={{cursor:"pointer"}} onClick={() => setExpanded(isExpanded ? null : orderId)}>
                      <td>
                        <span style={{fontFamily:"monospace",fontSize:12,background:"var(--surface2)",border:"1px solid var(--border)",padding:"2px 7px",borderRadius:6,color:"var(--text3)"}}>
                          #{shortId}
                        </span>
                      </td>
                      <td style={{fontSize:12,color:"var(--text3)"}}>
                        {o.createdAt || o.date ? new Date(o.createdAt || o.date).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—"}
                      </td>
                      <td>
                        <div style={{fontWeight:600,color:"var(--text)"}}>{o.customer_id?.name || "Walk-in"}</div>
                        {o.customer_id?.mobile && <div style={{fontSize:11,color:"var(--text4)"}}>{o.customer_id.mobile}</div>}
                      </td>
                      <td style={{color:"var(--text3)",fontSize:13}}>{o.employee_id?.name || "—"}</td>
                      <td>
                        <span className={`badge ${statusColor(statusStr)}`}>
                          {statusStr}
                        </span>
                      </td>
                      <td><strong style={{color:"var(--green)",fontSize:14}}>₹{totalAmt.toLocaleString("en-IN")}</strong></td>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span className="badge badge-gray">{o.items?.length || 0} items</span>
                          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="var(--text4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                            style={{transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition:"transform .2s"}}>
                            <path d="M6 9l6 6 6-6"/>
                          </svg>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} style={{background:"var(--surface2)",padding:"12px 20px"}}>
                          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                            {(o.items || []).map((item, i) => (
                              <div key={i} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"var(--r-md)",padding:"6px 12px",fontSize:12.5}}>
                                <strong style={{color:"var(--text)"}}>{item.product_name}</strong>
                                <span style={{color:"var(--text4)",marginLeft:6}}>×{item.quantity}</span>
                                <span style={{color:"var(--green)",marginLeft:8,fontWeight:700}}>
                                  ₹{Number(item.price || 0) * Number(item.quantity || 1)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
