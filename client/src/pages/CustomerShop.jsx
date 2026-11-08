import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import LoadingOverlay from "../components/LoadingOverlay";

export default function CustomerShop() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [takeawayTime, setTakeawayTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Pay on Pickup"); // "Pay on Pickup" or "Online"
  
  // Payment Verification States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayType, setSelectedPayType] = useState("UPI"); // UPI or Card
  const [verifying, setVerifying] = useState(false);
  const [transactionId] = useState(() => Math.random().toString(36).substr(2, 9).toUpperCase());

  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  useEffect(() => {
    api.get("/products")
      .then(r => {
        setProducts(Array.isArray(r.data) ? r.data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load products:", err);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  const addToCart = (product) => {
    const prodId = product._id || product.id;
    setCart(prev => {
      const existing = prev.find(i => (i._id || i.id) === prodId);
      if (existing) {
        if (existing.qty >= product.stock) return prev; // Cannot exceed stock
        return prev.map(i => (i._id || i.id) === prodId ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, _id: prodId, id: prodId, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => (i._id || i.id) !== id));
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i._id === id) {
        const newQty = Math.max(1, i.qty + delta);
        if (newQty > i.stock) return i;
        return { ...i, qty: newQty };
      }
      return i;
    }));
  };

  const placeOrder = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    if (!customerName.trim()) return alert("Please enter your name");
    if (!altPhone.trim() || altPhone.length < 10) return alert("Please enter a valid alternate phone number");
    if (!takeawayTime) return alert("Please select a takeaway time");

    if (paymentMethod === "Online" && !verifying) {
      setShowPaymentModal(true);
      return;
    }

    setOrdering(true);
    try {
      const items = cart.map(i => ({ product_id: i._id, quantity: i.qty }));
      const response = await api.post("/orders", { 
        items, 
        takeaway_time: takeawayTime, 
        payment_method: paymentMethod,
        customer_name_manual: customerName,
        alternate_phone: altPhone,
        order_type: "Takeaway"
      });

      // Trigger notification for staff
      addNotification({
        title: "New Takeaway Order",
        message: `Order placed by ${customerName}. Pickup at ${new Date(takeawayTime).toLocaleString()}. Alt Phone: ${altPhone}`,
        type: "order"
      });

      alert("Order sent to shop successfully!");
      setCart([]);
      setTakeawayTime("");
      setCustomerName("");
      setAltPhone("");
      navigate("/orders");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to place order");
    } finally {
      setOrdering(false);
      setVerifying(false);
      setShowPaymentModal(false);
    }
  };

  const confirmPayment = () => {
    setVerifying(true);
    setTimeout(() => {
      placeOrder();
    }, 2000);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (loading) return <LoadingOverlay text="Loading products..." />;

  return (
    <div style={{ display: "flex", gap: 24, height: "calc(100vh - 120px)" }}>
      {/* Product List */}
      <div style={{ flex: 1, overflowY: "auto", paddingRight: 12 }}>
        <h2 style={{ fontSize: 20, marginBottom: 16 }}>Available Products</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {products.map(p => (
            <div key={p._id} className="card card-pad" style={{ display: "flex", flexDirection: "column", padding: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{p.product_name}</div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12 }}>{p.category}</div>
                <div style={{ fontWeight: 700, color: "var(--green)", fontSize: 16 }}>₹{p.price.toLocaleString("en-IN")}</div>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: 16, width: "100%", padding: "8px" }}
                onClick={() => addToCart(p)}
                disabled={p.stock === 0}
              >
                {p.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="card" style={{ width: 340, display: "flex", flexDirection: "column", height: "100%", flexShrink: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 16 }}>
          Your Cart
        </div>
        
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {cart.length === 0 ? (
            <div style={{ color: "var(--text4)", textAlign: "center", marginTop: 40, fontSize: 14 }}>
              Cart is empty. Add items to proceed.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {cart.map(item => (
                <div key={item._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.product_name}</div>
                    <div style={{ fontSize: 13, color: "var(--green)", fontWeight: 700 }}>₹{item.price}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", background: "var(--surface2)", borderRadius: 6, overflow: "hidden" }}>
                      <button style={{ border: "none", background: "transparent", padding: "4px 8px", cursor: "pointer", color: "var(--text)" }} onClick={() => updateQty(item._id, -1)}>-</button>
                      <span style={{ fontSize: 13, fontWeight: 600, width: 20, textAlign: "center" }}>{item.qty}</span>
                      <button style={{ border: "none", background: "transparent", padding: "4px 8px", cursor: "pointer", color: "var(--text)" }} onClick={() => updateQty(item._id, 1)}>+</button>
                    </div>
                    <button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }} onClick={() => removeFromCart(item._id)}>
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m5 4v6m4-6v6"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: 20, borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 16, fontWeight: 700 }}>
            <span>Total</span>
            <span style={{ color: "var(--green)" }}>₹{total.toLocaleString("en-IN")}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text2)" }}>Customer Name *</label>
              <input type="text" className="solo" placeholder="Enter your name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text2)" }}>Alt. Phone Number *</label>
              <input type="tel" className="solo" placeholder="Alternate mobile" value={altPhone} onChange={e => setAltPhone(e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text2)" }}>Pickup Time *</label>
              <input 
                type="datetime-local" 
                className="solo" 
                value={takeawayTime} 
                onChange={(e) => setTakeawayTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text2)" }}>Payment Option</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  onClick={() => setPaymentMethod("Pay on Pickup")}
                  style={{ flex: 1, padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid var(--border)", background: paymentMethod === "Pay on Pickup" ? "var(--green)" : "#fff", color: paymentMethod === "Pay on Pickup" ? "#fff" : "var(--text)" }}
                >
                  Pay on Pickup
                </button>
                <button 
                  onClick={() => setPaymentMethod("Online")}
                  style={{ flex: 1, padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid var(--border)", background: paymentMethod === "Online" ? "var(--green)" : "#fff", color: paymentMethod === "Online" ? "#fff" : "var(--text)" }}
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{ width: "100%", padding: 14 }}
            disabled={cart.length === 0 || ordering}
            onClick={placeOrder}
          >
            {ordering ? "Processing Order..." : "Confirm & Send to Shop"}
          </button>
        </div>
      </div>

      {/* ── PAYMENT MODAL ───────────────────────────────────── */}
      {showPaymentModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: "100%", maxWidth: 420, overflow: "hidden", animation: "modalSlideUp 0.4s ease-out" }}>
            <div style={{ background: "linear-gradient(135deg, #1a6640 0%, #064e3b 100%)", padding: "32px 24px", color: "#fff", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, background: "rgba(255,255,255,0.15)", borderRadius: "50%", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
                <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Secure Payment</h2>
              <div style={{ fontSize: 14, opacity: 0.9 }}>Finalize your order for {customerName}</div>
            </div>

            <div style={{ padding: 28 }}>
              <div style={{ background: "var(--surface2)", borderRadius: 16, padding: 20, marginBottom: 24, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Order Summary</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: "var(--text)" }}>₹{total.toLocaleString("en-IN")}</span>
                  <span className="badge badge-green">TAKEAWAY</span>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 12, color: "var(--text2)" }}>Choose Payment Method</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <button onClick={() => setSelectedPayType("UPI")} style={{ padding: "16px", borderRadius: 12, border: "2px solid", borderColor: selectedPayType === "UPI" ? "var(--green)" : "var(--border)", background: selectedPayType === "UPI" ? "var(--green-tint)" : "#fff", cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ fontWeight: 800, color: selectedPayType === "UPI" ? "var(--green)" : "var(--text3)" }}>UPI</div>
                  </button>
                  <button onClick={() => setSelectedPayType("Card")} style={{ padding: "16px", borderRadius: 12, border: "2px solid", borderColor: selectedPayType === "Card" ? "var(--green)" : "var(--border)", background: selectedPayType === "Card" ? "var(--green-tint)" : "#fff", cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ fontWeight: 800, color: selectedPayType === "Card" ? "var(--green)" : "var(--text3)" }}>CARD</div>
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "center", padding: "20px", background: "var(--surface2)", borderRadius: 12, border: "1px dashed var(--border)" }}>
                {selectedPayType === "UPI" ? (
                  <div>
                    <div style={{ width: 120, height: 120, background: "#fff", margin: "0 auto 16px", border: "1px solid var(--border)", padding: 8, borderRadius: 8 }}>
                      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#1a6640" strokeWidth={1}><rect x={2} y={2} width={20} height={20} rx={2}/><path d="M6 6h4v4H6zM14 6h4v4h-4zM6 14h4v4H6zM14 14h1v1h-1zM17 14h1v1h-1zM14 17h1v1h-1zM17 17h1v1h-1z"/></svg>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text3)" }}>Scan QR to Pay</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ width: 60, height: 40, background: "#1e293b", borderRadius: 6, margin: "0 auto 16px", position: "relative" }}>
                      <div style={{ position: "absolute", top: 10, left: 6, width: 12, height: 8, background: "#fbbf24", borderRadius: 2 }}></div>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text3)" }}>Swipe or Insert Card</div>
                  </div>
                )}
                <div style={{ fontSize: 11, color: "var(--text4)", marginTop: 12 }}>Transaction ID: {transactionId}</div>
              </div>
            </div>

            <div style={{ padding: 24, borderTop: "1px solid var(--border)", display: "flex", gap: 12 }}>
              <button onClick={() => setShowPaymentModal(false)} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid var(--border)", background: "#fff", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button onClick={confirmPayment} disabled={verifying} style={{ flex: 2, padding: "14px", borderRadius: 12, border: "none", background: "var(--green)", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                {verifying ? "Verifying..." : "Confirm Received"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
