import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const CATS = ["Grocery","Beverages","Dairy","Snacks","Bakery","Produce","Meat","Frozen","Personal","Household","Electronics"];
const EMOJI = {Grocery:"🛒",Beverages:"🥤",Dairy:"🧀",Snacks:"🍪",Bakery:"🥐",Produce:"🥦",Meat:"🥩",Frozen:"🧊",Personal:"🧴",Household:"🏠",Electronics:"📱",default:"📦"};
const catEmoji = c => EMOJI[c] || EMOJI.default;
const blank = { product_name:"", category:"", price:"", stock:"", barcode:"" };

export default function ProductsPage() {
  const { auth } = useAuth();
  const userRole = auth?.user?.role || "";
  const canEdit = ["admin","manager"].includes(userRole);
  const isAdmin = userRole === "admin";

  const [products, setProducts] = useState([]);
  const [form, setForm]         = useState(blank);
  const [search, setSearch]     = useState("");
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCat] = useState("All");

  const load = async () => {
    try {
      const { data } = await api.get(`/products?search=${encodeURIComponent(search || "")}`);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts([]);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  const save = async (e) => {
    e.preventDefault(); 
    setSaving(true);
    try { 
      await api.post("/products", {
        ...form, 
        price: Number(form.price), 
        stock: Number(form.stock)
      }); 
      setForm(blank); 
      setShowForm(false); 
      await load(); 
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save product");
    } finally { 
      setSaving(false); 
    }
  };

  const remove = async (id) => { 
    if (!confirm("Delete this product?")) return; 
    try {
      await api.delete(`/products/${id}`); 
      await load(); 
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  const safeProducts = Array.isArray(products) ? products : [];
  const categories = ["All", ...new Set(safeProducts.map(p => p?.category).filter(Boolean))];
  const filtered = safeProducts.filter(p => {
    if (!p) return false;
    const nameMatch = (p.product_name || "").toLowerCase().includes((search || "").toLowerCase());
    const barcodeMatch = (p.barcode || "").toString().toLowerCase().includes((search || "").toLowerCase());
    const ms = nameMatch || barcodeMatch;
    const mc = activeCategory === "All" || p.category === activeCategory;
    return ms && mc;
  });

  return (
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {/* Toolbar */}
      <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:"var(--surface)",border:"1.5px solid var(--border)",borderRadius:"var(--r-md)",padding:"9px 14px",minWidth:200}}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--text4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
          <input 
            placeholder="Search by name or barcode…" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            onKeyDown={e => e.key === "Enter" && load()}
            style={{border:"none",outline:"none",background:"transparent",fontSize:13.5,color:"var(--text)",width:"100%"}} 
          />
          <button onClick={load} className="btn btn-primary btn-sm">Search</button>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => setShowForm(p => !p)}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            {showForm ? "Cancel" : "Add Product"}
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && canEdit && (
        <div className="card card-pad" style={{border:"1.5px solid var(--green)",boxShadow:"0 0 0 3px rgba(22,163,74,.08)"}}>
          <div style={{fontWeight:800,fontSize:16,marginBottom:16,color:"var(--text)"}}>New Product</div>
          <form onSubmit={save}>
            <div className="form-grid" style={{marginBottom:14}}>
              {[
                {ph:"Product name",k:"product_name"},
                {ph:"Price (₹)",k:"price",t:"number"},
                {ph:"Stock qty",k:"stock",t:"number"},
                {ph:"Barcode (optional)",k:"barcode"}
              ].map(f => (
                <div key={f.k}>
                  <label style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:"var(--text3)",display:"block",marginBottom:5}}>{f.ph}</label>
                  <input 
                    className="solo" 
                    type={f.t || "text"} 
                    placeholder={f.ph} 
                    value={form[f.k]} 
                    onChange={e => setForm({...form, [f.k]: e.target.value})} 
                    required={f.k !== "barcode"} 
                  />
                </div>
              ))}
              <div>
                <label style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:"var(--text3)",display:"block",marginBottom:5}}>Category</label>
                <select className="solo" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                  <option value="">Select category</option>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Product"}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Category filter chips */}
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none"}}>
        {categories.map(c => (
          <button 
            key={c} 
            onClick={() => setActiveCat(c)}
            style={{
              flexShrink:0,
              padding:"6px 14px",
              borderRadius:50,
              border:`1.5px solid ${activeCategory===c?"var(--green)":"var(--border)"}`,
              background:activeCategory===c?"var(--green)":"var(--surface)",
              color:activeCategory===c?"#fff":"var(--text3)",
              fontWeight:600,
              fontSize:12.5,
              cursor:"pointer",
              transition:"all .18s",
              whiteSpace:"nowrap",
              boxShadow:activeCategory===c?"0 4px 12px rgba(22,163,74,.3)":"none"
            }}
          >
            {c !== "All" ? `${catEmoji(c)} ` : ""}{c}
          </button>
        ))}
      </div>

      {/* Count */}
      <div style={{fontSize:12.5,color:"var(--text4)",fontWeight:600}}>{filtered.length} product{filtered.length !== 1 ? "s" : ""}</div>

      {/* Table */}
      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Barcode</th>
                {isAdmin && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} style={{textAlign:"center",padding:"48px 0",color:"var(--text4)"}}>
                    <div style={{fontSize:32,marginBottom:8}}>📦</div>No products found
                  </td>
                </tr>
              ) : filtered.map(p => {
                const prodId = p._id || p.id;
                const price = Number(p.price || 0);
                const stock = Number(p.stock || 0);
                return (
                  <tr key={prodId}>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:36,height:36,background:"var(--green-tint)",border:"1px solid #bbf7d0",borderRadius:9,display:"grid",placeItems:"center",fontSize:18,flexShrink:0}}>
                          {catEmoji(p.category)}
                        </div>
                        <div style={{fontWeight:600,fontSize:13.5,color:"var(--text)"}}>{p.product_name || "Unnamed"}</div>
                      </div>
                    </td>
                    <td><span className="badge badge-gray">{p.category || "—"}</span></td>
                    <td><strong style={{color:"var(--green)",fontSize:14}}>₹{price}</strong></td>
                    <td>
                      <span className={`badge ${stock <= 0 ? "badge-red" : stock <= 5 ? "badge-yellow" : "badge-green"}`}>
                        {stock <= 0 ? "Out of stock" : stock <= 5 ? `Low: ${stock}` : stock}
                      </span>
                    </td>
                    <td style={{fontSize:12,color:"var(--text4)",fontFamily:"monospace"}}>{p.barcode || "—"}</td>
                    {isAdmin && (
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => remove(prodId)}>Delete</button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
