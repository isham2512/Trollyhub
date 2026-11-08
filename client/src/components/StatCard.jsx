const ICONS = {
  products: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
  orders:   "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2",
  revenue:  "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  stock:    "M5 8h14M5 8a2 2 0 0 1 0-4h14a2 2 0 0 1 0 4M5 8l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12",
  users:    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0",
  default:  "M13 2L3 14h9l-1 8 10-12h-9l1-8",
};
const ACCENTS = {
  green: { bg:"#f0fdf4", icon:"#16a34a", border:"#bbf7d0", bar:"#16a34a" },
  blue:  { bg:"#eff6ff", icon:"#2563eb", border:"#bfdbfe", bar:"#2563eb" },
  amber: { bg:"#fffbeb", icon:"#d97706", border:"#fde68a", bar:"#d97706" },
  rose:  { bg:"#fff1f2", icon:"#e11d48", border:"#fecdd3", bar:"#e11d48" },
};

export default function StatCard({ title, value, subtitle, icon, accent = "green", trend }) {
  const a = ACCENTS[accent] || ACCENTS.green;
  const d = ICONS[icon] || ICONS.default;

  return (
    <div className="stat-card">
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div className="stat-icon" style={{background:a.bg, border:`1.5px solid ${a.border}`}}>
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={a.icon} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d={d} />
          </svg>
        </div>
        {trend !== undefined && (
          <div style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:50,background:trend>=0?"#f0fdf4":"#fff1f2",color:trend>=0?"#16a34a":"#e11d48",border:`1px solid ${trend>=0?"#bbf7d0":"#fecdd3"}`}}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-sub">{subtitle}</div>}
      </div>
      <div style={{height:3,borderRadius:2,background:a.bg,overflow:"hidden",marginTop:4}}>
        <div style={{height:"100%",width:"65%",background:a.bar,borderRadius:2,opacity:.5}}/>
      </div>
    </div>
  );
}
