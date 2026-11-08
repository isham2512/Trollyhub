import { useEffect, useMemo, useState, useRef } from "react";
import api from "../api";
import LoadingOverlay from "../components/LoadingOverlay";

export default function BillingPage() {
  const [products, setProducts]             = useState([]);
  const [search, setSearch]                 = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart]                     = useState([]);
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerName, setCustomerName]     = useState("");
  const [tax, setTax]                       = useState(0);
  const [discount, setDiscount]             = useState(0);
  const [lastBill, setLastBill]             = useState(null);
  const [loading, setLoading]               = useState(true);
  const [ordering, setOrdering]             = useState(false);
  const [paymentMethod, setPaymentMethod]   = useState("Cash");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [verifying, setVerifying]           = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    api.get("/products")
      .then((res) => {
        setProducts(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const safe = Array.isArray(products) ? products : [];
    const cats = [...new Set(safe.map((p) => p?.category).filter(Boolean))];
    return ["All", ...cats];
  }, [products]);

  const filtered = useMemo(() => {
    const safe = Array.isArray(products) ? products : [];
    return safe.filter((p) => {
      if (!p) return false;
      const matchSearch = (p.product_name || "").toLowerCase().includes((search || "").toLowerCase()) || (p.barcode || "").includes(search || "");
      const matchCat = activeCategory === "All" || p.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, activeCategory]);

  const addToCart = (product) => {
    if ((product.stock || 0) <= 0) return;
    const prodId = product._id || product.id;
    setCart((prev) => {
      const exists = prev.find((x) => x.product_id === prodId);
      if (exists) {
        if (exists.quantity >= product.stock) return prev;
        return prev.map((x) => x.product_id === prodId ? { ...x, quantity: x.quantity + 1 } : x);
      }
      return [...prev, { product_id: prodId, product_name: product.product_name, price: product.price, quantity: 1, stock: product.stock }];
    });
  };

  const removeFromCart = (id) => setCart((p) => p.filter((x) => x.product_id !== id));
  
  const updateQty = (id, delta) => {
    setCart((p) => p.map((x) => {
      if (x.product_id === id) {
        const newQty = Math.max(1, x.quantity + delta);
        if (newQty > x.stock) return x;
        return { ...x, quantity: newQty };
      }
      return x;
    }));
  };

  const subtotal   = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const taxAmount  = subtotal * (Number(tax) / 100);
  const discAmount = subtotal * (Number(discount) / 100);
  const finalTotal = Math.max(subtotal + taxAmount - discAmount, 0);

  const checkout = async () => {
    if (!cart.length) return;
    setOrdering(true);
    try {
      const { data } = await api.post("/orders", { 
        customerMobile, 
        customerName,
        tax: taxAmount, 
        discount: discAmount, 
        payment_method: paymentMethod,
        items: cart.map((i) => ({ product_id: i.product_id, quantity: i.quantity })) 
      });
      setLastBill({ ...data, appliedTax: tax, appliedDiscount: discount });
      setCart([]); setCustomerMobile(""); setCustomerName(""); setTax(0); setDiscount(0);
      setPaymentMethod("Cash");
      setShowPaymentModal(false);
      const fresh = await api.get("/products");
      setProducts(fresh.data);
    } catch (err) {
      alert("Billing failed");
    } finally { 
      setOrdering(false); 
    }
  };

  if (loading) return <LoadingOverlay text="Loading POS..." />;

  return (
    <div style={{ display: "flex", gap: 24, height: "calc(100vh - 120px)" }}>
      {/* ── LEFT: Products ─────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, overflow: "hidden" }}>
        
        {/* Search & Categories */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
          <input 
            className="solo" 
            ref={searchRef} 
            placeholder="Search products or scan barcode…" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            autoFocus 
          />
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
            {categories.map((c) => (
              <button 
                key={c} 
                onClick={() => setActiveCategory(c)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 50,
                  border: "none",
                  background: activeCategory === c ? "var(--green)" : "var(--surface)",
                  color: activeCategory === c ? "#fff" : "var(--text2)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, overflowY: "auto", paddingRight: 8 }}>
          {filtered.length === 0 && <div style={{gridColumn:"1/-1",textAlign:"center",color:"var(--text4)",padding:"40px 0"}}>No products found</div>}
          {filtered.map((p) => {
            const inCart = cart.find(i => i.product_id === p._id);
            return (
              <div 
                key={p._id} 
                className="card card-pad" 
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  padding: 20, 
                  opacity: p.stock <= 0 ? 0.6 : 1,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  border: "1px solid var(--border)",
                  position: "relative"
                }}
                onMouseEnter={(e) => {
                  if(p.stock > 0) {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                    e.currentTarget.style.borderColor = "rgba(26, 102, 64, 0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: "var(--text)" }}>{p.product_name}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }}></span>
                    {p.category}
                  </div>
                  <div style={{ fontWeight: 800, color: "var(--green)", fontSize: 20 }}>₹{p.price.toLocaleString("en-IN")}</div>
                </div>
                <div style={{ fontSize: 11, color: p.stock <= 5 ? "var(--danger)" : "var(--text4)", marginTop: 12, marginBottom: 16, fontWeight: p.stock <= 5 ? 700 : 500, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {p.stock <= 0 ? "⚠️ Out of stock" : `${p.stock} units available`}
                </div>
                <button 
                  className={inCart ? "btn btn-ghost" : "btn btn-primary"} 
                  style={{ 
                    width: "100%", 
                    padding: "10px", 
                    borderRadius: 12,
                    border: inCart ? "2px solid var(--green)" : "none", 
                    color: inCart ? "var(--green)" : "#fff",
                    fontSize: 13,
                    fontWeight: 700
                  }}
                  onClick={() => addToCart(p)}
                  disabled={p.stock <= 0}
                >
                  {p.stock <= 0 ? "Unavailable" : inCart ? "Add Another" : "Add to Bill"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT: Bill Panel ──────────────────────────── */}
      <div className="card" style={{ width: 360, display: "flex", flexDirection: "column", height: "100%", flexShrink: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Current Bill</div>
          <span className="badge badge-green">{cart.reduce((s, i) => s + i.quantity, 0)} items</span>
        </div>
        
        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
          <input 
            className="solo" 
            style={{ width: "100%", background: "var(--bg)", border: "none" }}
            placeholder="Customer name (optional)" 
            value={customerName} 
            onChange={(e) => setCustomerName(e.target.value)} 
          />
          <input 
            className="solo" 
            style={{ width: "100%", background: "var(--bg)", border: "none" }}
            placeholder="Customer mobile (optional)" 
            value={customerMobile} 
            onChange={(e) => setCustomerMobile(e.target.value)} 
            type="tel" 
          />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {cart.length === 0 ? (
            <div style={{ color: "var(--text4)", textAlign: "center", marginTop: 40, fontSize: 14 }}>
              Bill is empty. Add items to proceed.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {cart.map(item => (
                <div key={item.product_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ minWidth: 0, flex: 1, paddingRight: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.product_name}</div>
                    <div style={{ fontSize: 13, color: "var(--green)", fontWeight: 700 }}>₹{item.price} each</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", background: "var(--surface2)", borderRadius: 6, overflow: "hidden" }}>
                      <button style={{ border: "none", background: "transparent", padding: "4px 8px", cursor: "pointer", color: "var(--text)" }} onClick={() => updateQty(item.product_id, -1)}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 600, width: 20, textAlign: "center" }}>{item.quantity}</span>
                      <button style={{ border: "none", background: "transparent", padding: "4px 8px", cursor: "pointer", color: "var(--text)" }} onClick={() => updateQty(item.product_id, 1)}>+</button>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, width: 44, textAlign: "right" }}>₹{item.price * item.quantity}</div>
                    <button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }} onClick={() => removeFromCart(item.product_id)}>
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m5 4v6m4-6v6"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: 20, borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", display: "block", marginBottom: 4 }}>Tax (%)</label>
              <input type="number" min="0" className="solo" style={{ width: "100%", padding: "8px" }} value={tax} onChange={(e) => setTax(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", display: "block", marginBottom: 4 }}>Discount (%)</label>
              <input type="number" min="0" className="solo" style={{ width: "100%", padding: "8px" }} value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "var(--text2)" }}>
            <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
          </div>
          {taxAmount > 0 && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "var(--text2)" }}>
            <span>Tax ({tax}%)</span><span>+₹{taxAmount.toFixed(2)}</span>
          </div>}
          {discAmount > 0 && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 13, color: "var(--text2)" }}>
            <span>Discount ({discount}%)</span><span style={{ color: "var(--danger)" }}>−₹{discAmount.toFixed(2)}</span>
          </div>}
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, fontSize: 18, fontWeight: 800, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            <span>Total</span><span style={{ color: "var(--green)" }}>₹{finalTotal.toFixed(2)}</span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", display: "block", marginBottom: 8 }}>Payment Method</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {["Cash", "Card", "UPI"].map((m) => (
                <button 
                  key={m} 
                  onClick={() => setPaymentMethod(m)}
                  style={{
                    padding: "8px",
                    borderRadius: 8,
                    border: paymentMethod === m ? "2px solid var(--green)" : "1px solid var(--border)",
                    background: paymentMethod === m ? "rgba(31, 143, 78, 0.1)" : "transparent",
                    color: paymentMethod === m ? "var(--green)" : "var(--text2)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: "100%", padding: 14 }}
            disabled={cart.length === 0 || ordering}
            onClick={() => {
              if (paymentMethod === "UPI" || paymentMethod === "Card") {
                setShowPaymentModal(true);
              } else {
                checkout();
              }
            }}
          >
            {ordering ? "Processing..." : `Take Payment · ₹${finalTotal.toFixed(2)}`}
          </button>
        </div>
      </div>

      {/* ── PAYMENT VERIFICATION MODAL ───────────────────── */}
      {showPaymentModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: 420, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{paymentMethod === "UPI" ? "📱" : "💳"}</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{paymentMethod} Payment Verification</h2>
            <p style={{ color: "var(--text3)", marginBottom: 24, fontSize: 14 }}>
              {paymentMethod === "UPI" 
                ? `Please ask the customer to scan the QR code and complete the payment of `
                : `Please swipe or insert the card in the machine for the payment of `
              }
              <span style={{ fontWeight: 800, color: "var(--text)" }}>₹{finalTotal.toFixed(2)}</span>
            </p>
            
            <div style={{ background: "#f8fafc", borderRadius: 16, padding: 24, marginBottom: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
              {paymentMethod === "UPI" ? (
                /* Dummy QR Code */
                <div style={{ width: 160, height: 160, background: "#fff", border: "8px solid #fff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", marginBottom: 16 }}>
                  <svg width={140} height={140} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={0.5}>
                    <rect x="2" y="2" width="6" height="6"/><rect x="16" y="2" width="6" height="6"/><rect x="2" y="16" width="6" height="6"/>
                    <path d="M10 2h4v4h-4zM10 10h4v4h-4zM10 18h4v4h-4zM2 10h4v4h-4zM18 10h4v4h-4zM18 18h4v4h-4z"/>
                  </svg>
                  {verifying && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div className="spinner" style={{ width: 40, height: 40, border: "4px solid var(--green)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                    </div>
                  )}
                </div>
              ) : (
                /* Card Simulation */
                <div style={{ width: 160, height: 100, background: "linear-gradient(135deg, #1e293b, #334155)", borderRadius: 12, position: "relative", marginBottom: 16, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 30, height: 20, background: "#fbbf24", borderRadius: 4, position: "absolute", left: 20, top: 40 }}></div>
                  <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, letterSpacing: 1 }}>•••• •••• •••• 4242</div>
                  {verifying && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div className="spinner" style={{ width: 30, height: 30, border: "3px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                    </div>
                  )}
                </div>
              )}
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text3)" }}>Transaction ID: <span style={{ color: "var(--text)" }}>TLY{Math.random().toString(36).substring(7).toUpperCase()}</span></div>
            </div>

            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowPaymentModal(false)} disabled={verifying}>Cancel</button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1 }} 
                disabled={verifying}
                onClick={() => {
                  setVerifying(true);
                  setTimeout(() => {
                    setVerifying(false);
                    checkout();
                  }, 2000);
                }}
              >
                {verifying ? "Verifying..." : "Confirm Received"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INVOICE OVERLAY ───────────────────────────────── */}
      {lastBill && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", zIndex: 999 }} onClick={(e) => e.target === e.currentTarget && setLastBill(null)}>
          <div className="card" style={{ width: 400, padding: 32, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, background: "#ecfdf5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--green)" }}>
              <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Bill Generated!</h2>
            <p style={{ color: "var(--text3)", marginBottom: 24, fontSize: 14 }}>Transaction completed successfully</p>
            
            <div style={{ background: "var(--bg)", borderRadius: 12, padding: 20, marginBottom: 24, textAlign: "left", fontSize: 14 }}>
              <div style={{ textAlign: "center", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Trolly Hub</div>
              <div style={{ borderTop: "1px dashed var(--border)", margin: "12px 0" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "var(--text3)" }}>Customer</span><span style={{ fontWeight: 600 }}>{lastBill.order.customer_id?.name || "Walk-in Customer"}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "var(--text3)" }}>Bill No.</span><span style={{ fontWeight: 600 }}>#{lastBill.bill.bill_number}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "var(--text3)" }}>Payment</span><span style={{ fontWeight: 600 }}>{lastBill.order.payment_method}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "var(--text3)" }}>Date</span><span style={{ fontWeight: 600 }}>{new Date().toLocaleDateString()}</span></div>
              <div style={{ borderTop: "1px dashed var(--border)", margin: "12px 0" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "var(--text3)" }}>Subtotal</span><span style={{ fontWeight: 600 }}>₹{lastBill.bill.total_amount?.toFixed(2)}</span></div>
              {lastBill.bill.tax_amount > 0 && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "var(--text3)" }}>Tax ({lastBill.appliedTax}%)</span><span style={{ fontWeight: 600 }}>+₹{lastBill.bill.tax_amount?.toFixed(2)}</span></div>}
              {lastBill.bill.discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "var(--text3)" }}>Discount ({lastBill.appliedDiscount}%)</span><span style={{ fontWeight: 600 }}>−₹{lastBill.bill.discount?.toFixed(2)}</span></div>}
              <div style={{ borderTop: "1px dashed var(--border)", margin: "12px 0" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800 }}><span style={{ color: "var(--text)" }}>Total</span><span style={{ color: "var(--green)" }}>₹{lastBill.bill.final_amount?.toFixed(2)}</span></div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-ghost" style={{ flex: 1, border: "1px solid var(--border)" }} onClick={() => setLastBill(null)}>New Bill</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => window.print()}>Print Receipt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
