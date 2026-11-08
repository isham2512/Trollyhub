import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

const NAV_ICONS = {
  Dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  Products:  "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
  Stock:     "M3 3v18h18 M18 9l-5 5-3-3-5 5",
  Reports:   "M18 20V10M12 20V4M6 20v-6",
  Orders:    "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2",
  Bills:     "M9 17H5a2 2 0 0 0-2 2 M9 3H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4 M21 3h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M21 17h-4a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2z",
  Shop:      "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
  Bookings:  "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  Users:     "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0",
  Settings:  "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  Billing:   "M9 17H5a2 2 0 0 0-2 2 M9 3H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4 M21 3h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M21 17h-4a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2z",
};

const SvgIcon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
export default function Layout({ children }) {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const role = auth?.user?.role;
  const name = auth?.user?.name || "User";
  const initials = (name || "User")
    .split(" ")
    .filter(Boolean)
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const navItems = [
    { to: role === "admin" ? "/admin/dashboard" : role === "manager" ? "/manager/dashboard" : role === "employee" ? "/employee/billing" : "/customer/dashboard", label: "Dashboard" },
    ...(role === "customer" ? [{ to: "/customer/shop", label: "Shop" }] : []),
    ...(role !== "customer" && role !== "employee" ? [{ to: "/products", label: "Products" }] : []),
    ...(["admin","manager","employee"].includes(role) ? [{ to: "/employee/billing", label: "Billing" }] : []),
    ...(["admin","manager"].includes(role) ? [{ to: "/stock", label: "Stock" }, { to: "/reports", label: "Reports" }] : []),
    ...(["admin","manager","employee","customer"].includes(role) ? [{ to: "/orders", label: "Orders" }, { to: "/bills", label: "Bills" }] : []),
    ...(["admin","manager","employee"].includes(role) ? [{ to: "/bookings", label: "Bookings" }] : []),
    ...(role === "admin" ? [{ to: "/users", label: "Users" }] : []),
  ];

  const onLogout = () => { logout(); navigate("/login"); };

  const { notifications, markAsRead, clearAll } = useNotifications();
  const [showNoti, setShowNoti] = useState(false);
  const notiRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notiRef.current && !notiRef.current.contains(e.target)) setShowNoti(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-inner">
          <Link to="/" className="sidebar-brand" style={{textDecoration:"none"}}>
            <div className="sidebar-brand-icon">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div>
              <div className="sidebar-brand-name">Trolly Hub</div>
              <div className="sidebar-brand-sub">Smart POS System</div>
            </div>
          </Link>

          <nav className="sidebar-nav">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
              >
                <SvgIcon d={NAV_ICONS[item.label] || NAV_ICONS.Dashboard} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div style={{ padding: "16px 14px", marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Access Level</div>
            <div style={{ 
              display: "inline-block", 
              padding: "4px 10px", 
              borderRadius: 6, 
              fontSize: 11, 
              fontWeight: 700, 
              background: role === "admin" ? "#dcfce7" : role === "manager" ? "#eff6ff" : "rgba(255,255,255,0.1)", 
              color: role === "admin" ? "#166534" : role === "manager" ? "#1e40af" : "#fff" 
            }}>
              {role?.toUpperCase()}
            </div>
          </div>

          <div className="sidebar-footer">
            <button className="sidebar-logout" onClick={onLogout}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Log Out
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text3)", marginBottom: 2 }}>{greeting}, {(name || "User").split(" ")[0] || "User"}</div>
            <div className="topbar-name" style={{ fontSize: 26, letterSpacing: "-0.02em" }}>Dashboard</div>
          </div>
          <div className="topbar-right">
            {/* Notification Bell */}
            {role !== "customer" && (
              <div style={{ position: "relative" }} ref={notiRef}>
                <button 
                  onClick={() => setShowNoti(!showNoti)}
                  style={{ 
                    background: "var(--surface)", 
                    border: "1px solid var(--border)", 
                    borderRadius: 12, 
                    width: 40, height: 40, 
                    display: "grid", placeItems: "center", 
                    cursor: "pointer", 
                    position: "relative",
                    color: "var(--text2)"
                  }}
                >
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  {unreadCount > 0 && (
                    <span style={{ 
                      position: "absolute", top: -4, right: -4, 
                      background: "var(--danger)", color: "#fff", 
                      fontSize: 10, fontWeight: 800, 
                      width: 18, height: 18, 
                      borderRadius: "50%", 
                      display: "grid", placeItems: "center",
                      border: "2px solid #fff"
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNoti && (
                  <div style={{ 
                    position: "absolute", top: "calc(100% + 12px)", right: 0, 
                    width: 320, background: "#fff", 
                    borderRadius: 16, boxShadow: "var(--shadow-lg)", 
                    border: "1px solid var(--border)", zIndex: 100,
                    overflow: "hidden"
                  }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
                      {notifications.length > 0 && <button onClick={clearAll} style={{ background: "none", border: "none", color: "var(--green)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Clear All</button>}
                    </div>
                    <div style={{ maxHeight: 360, overflowY: "auto" }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: 40, textAlign: "center", color: "var(--text4)", fontSize: 13 }}>No new notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => markAsRead(n.id)}
                            style={{ 
                              padding: "16px 20px", 
                              borderBottom: "1px solid var(--border)", 
                              background: n.read ? "transparent" : "var(--green-tint)",
                              cursor: "pointer",
                              transition: "background 0.2s"
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: "var(--text)" }}>{n.title}</div>
                            <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.4 }}>{n.message}</div>
                            <div style={{ fontSize: 10, color: "var(--text4)", marginTop: 8, fontWeight: 600 }}>{new Date(n.time).toLocaleTimeString()}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="topbar-date" style={{ background: "var(--surface)", padding: "8px 16px", borderRadius: 12, border: "1px solid var(--border)" }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--green)" }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {new Date().toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}
            </div>
            <div className="topbar-avatar" style={{ border: "2px solid #fff", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>{initials}</div>
          </div>
        </header>

        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
