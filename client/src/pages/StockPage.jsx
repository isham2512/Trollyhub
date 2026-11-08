import { useEffect, useState } from "react";
import api from "../api";

const EMOJI = {Grocery:"🛒",Beverages:"🥤",Dairy:"🧀",Snacks:"🍪",Bakery:"🥐",Produce:"🥦",Meat:"🥩",Frozen:"🧊",Personal:"🧴",Household:"🏠",Electronics:"📱",default:"📦"};
const catEmoji = c => EMOJI[c] || EMOJI.default;

function StockRow({ product, onSave }) {
  const [stock, setStock] = useState(product?.stock ?? 0);
  const [price, setPrice] = useState(product?.price ?? 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const changed = stock !== (product?.stock ?? 0) || price !== (product?.price ?? 0);

  const prodId = product?._id || product?.id;

  const handleSave = async () => {
    if (!prodId) return;
    setSaving(true);
    await onSave(prodId, stock, price);
    setSaving(false); 
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const numStock = Number(stock || 0);
  const stockLevel = numStock <= 0 ? "out" : numStock <= 5 ? "low" : "ok";

  return (
    <tr>
      <td>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:9,display:"grid",placeItems:"center",fontSize:18,flexShrink:0}}>
            {catEmoji(product?.category)}
          </div>
          <div>
            <div style={{fontWeight:600,fontSize:13.5,color:"var(--text)"}}>{product?.product_name || "Unnamed"}</div>
            <div style={{fontSize:11,color:"var(--text4)"}}>{product?.category || "—"}</div>
          </div>
        </div>
      </td>
      <td>
        <span className={`badge ${stockLevel==="out" ? "badge-red" : stockLevel==="low" ? "badge-yellow" : "badge-green"}`}>
          {stockLevel==="out" ? "Out of stock" : stockLevel==="low" ? "Low stock" : "In stock"}
        </span>
      </td>
      <td>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button 
            type="button"
            style={{width:26,height:26,borderRadius:7,border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--text3)",fontWeight:700,fontSize:14,cursor:"pointer",display:"grid",placeItems:"center"}}
            onClick={() => setStock(s => Math.max(0, Number(s || 0) - 1))}
          >
            −
          </button>
          <input 
            type="number" 
            min="0" 
            value={stock} 
            onChange={e => setStock(e.target.value)}
            style={{width:64,textAlign:"center",padding:"5px 8px",border:"1.5px solid var(--border)",borderRadius:"var(--r-md)",fontSize:14,fontWeight:700,outline:"none",background:"var(--surface)",color:"var(--text)"}}
            onFocus={e => e.target.style.borderColor="#16a34a"} 
            onBlur={e => e.target.style.borderColor="var(--border)"} 
          />
          <button 
            type="button"
            style={{width:26,height:26,borderRadius:7,border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--text3)",fontWeight:700,fontSize:14,cursor:"pointer",display:"grid",placeItems:"center"}}
            onClick={() => setStock(s => Number(s || 0) + 1)}
          >
            +
          </button>
        </div>
      </td>
      <td>
        <div style={{position:"relative",display:"inline-flex",alignItems:"center"}}>
          <span style={{position:"absolute",left:10,fontSize:13,color:"var(--text4)",fontWeight:600}}>₹</span>
          <input 
            type="number" 
            min="0" 
            value={price} 
            onChange={e => setPrice(e.target.value)}
            style={{paddingLeft:22,width:90,padding:"5px 10px 5px 26px",border:"1.5px solid var(--border)",borderRadius:"var(--r-md)",fontSize:13.5,fontWeight:600,outline:"none",background:"var(--surface)",color:"var(--text)"}}
            onFocus={e => e.target.style.borderColor="#16a34a"} 
            onBlur={e => e.target.style.borderColor="var(--border)"} 
          />
        </div>
      </td>
      <td>
        <button 
          type="button"
          onClick={handleSave} 
          disabled={!changed || saving}
          className={`btn btn-sm ${saved ? "btn-ghost" : "btn-primary"}`}
          style={{minWidth:70}}
        >
          {saving ? "…" : saved ? "✓ Saved" : "Update"}
        </button>
      </td>
    </tr>
  );
}

export default function StockPage() {
  const [products, setProducts] = useState([]);
  const [logs, setLogs]         = useState([]);
  const [search, setSearch]     = useState("");
  const [tab, setTab]           = useState("stock");

  const load = async () => {
    try {
      const [pr, lr] = await Promise.all([api.get("/products"), api.get("/stock/logs")]);
      setProducts(Array.isArray(pr?.data) ? pr.data : []); 
      setLogs(Array.isArray(lr?.data) ? lr.data : []);
    } catch (err) {
      console.error("Failed to load stock data:", err);
      setProducts([]);
      setLogs([]);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  const update = async (id, stock, price) => {
    try {
      await api.patch(`/stock/${id}`, { stock: Number(stock), price: Number(price) });
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update stock");
    }
  };

  const safeProducts = Array.isArray(products) ? products : [];
  const safeLogs = Array.isArray(logs) ? logs : [];

  const filtered = safeProducts.filter(p => {
    if (!p) return false;
    const nameMatch = (p.product_name || "").toLowerCase().includes((search || "").toLowerCase());
    const catMatch = (p.category || "").toLowerCase().includes((search || "").toLowerCase());
    return nameMatch || catMatch;
  });

  const outCount = safeProducts.filter(p => Number(p?.stock || 0) <= 0).length;
  const lowCount = safeProducts.filter(p => Number(p?.stock || 0) > 0 && Number(p?.stock || 0) <= 5).length;
  const okCount  = safeProducts.filter(p => Number(p?.stock || 0) > 5).length;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {[
          {label:"Total Products",value:safeProducts.length,c:"var(--text)",bg:"var(--surface2)",bc:"var(--border)"},
          {label:"Low Stock",value:lowCount,c:"#92400e",bg:"#fffbeb",bc:"#fde68a"},
          {label:"Out of Stock",value:outCount,c:"var(--danger)",bg:"var(--danger-tint)",bc:"#fecaca"},
        ].map(s => (
          <div key={s.label} style={{background:s.bg,border:`1.5px solid ${s.bc}`,borderRadius:"var(--r-xl)",padding:"16px 20px"}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:s.c,opacity:.7,marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:28,fontWeight:800,color:s.c}}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",alignItems:"center",gap:4,background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",padding:4,width:"fit-content"}}>
        {["stock","logs"].map(t => (
          <button 
            key={t} 
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding:"7px 18px",
              borderRadius:"var(--r-md)",
              border:"none",
              fontWeight:600,
              fontSize:13,
              cursor:"pointer",
              transition:"all .18s",
              background: tab===t ? "var(--surface)" : "transparent",
              color: tab===t ? "var(--green)" : "var(--text3)",
              boxShadow: tab===t ? "var(--shadow-sm)" : "none"
            }}
          >
            {t === "stock" ? "📦 Stock Management" : "📋 Change Logs"}
          </button>
        ))}
      </div>

      {tab === "stock" && (
        <div className="card">
          {/* Search */}
          <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)",display:"flex",gap:10,alignItems:"center"}}>
            <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:"var(--surface2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-md)",padding:"8px 12px"}}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--text4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
              <input 
                placeholder="Search products…" 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                style={{border:"none",background:"transparent",outline:"none",fontSize:13.5,color:"var(--text)",width:"100%"}} 
              />
            </div>
            <div style={{fontSize:12,color:"var(--text4)",fontWeight:600,whiteSpace:"nowrap"}}>{filtered.length} items</div>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Product</th><th>Status</th><th>Stock Qty</th><th>Price</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{textAlign:"center",padding:"40px 0",color:"var(--text4)"}}>No products found</td></tr>
                ) : filtered.map(p => {
                  const id = p._id || p.id;
                  return <StockRow key={id} product={p} onSave={update} />;
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "logs" && (
        <div className="card">
          <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)"}}>
            <div style={{fontWeight:800,fontSize:15,color:"var(--text)"}}>Stock Change History</div>
            <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{safeLogs.length} change records</div>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Product</th><th>Before</th><th>After</th><th>Change</th><th>Type</th><th>Updated By</th></tr></thead>
              <tbody>
                {safeLogs.length === 0 ? (
                  <tr><td colSpan={6} style={{textAlign:"center",padding:"40px 0",color:"var(--text4)"}}>No logs yet</td></tr>
                ) : safeLogs.map((l, idx) => {
                  const diff = Number(l.new_stock || 0) - Number(l.old_stock || 0);
                  const logId = l._id || l.id || idx;
                  return (
                    <tr key={logId}>
                      <td><div style={{fontWeight:600,color:"var(--text)"}}>{l.product_id?.product_name || "—"}</div></td>
                      <td><span style={{fontWeight:600,color:"var(--text3)"}}>{l.old_stock ?? 0}</span></td>
                      <td><span style={{fontWeight:700,color:"var(--text)"}}>{l.new_stock ?? 0}</span></td>
                      <td>
                        <span className={`badge ${diff > 0 ? "badge-green" : diff < 0 ? "badge-red" : "badge-gray"}`}>
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      </td>
                      <td><span className="badge badge-gray">{l.change_type || "manual"}</span></td>
                      <td style={{fontSize:12,color:"var(--text3)"}}>{l.updated_by?.name || "System"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
