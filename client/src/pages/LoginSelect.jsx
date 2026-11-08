import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LoginSelect.css";

const EyeOpen = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosed = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
  </svg>
);

export default function LoginSelect() {
  const [tab, setTab] = useState("staff");
  const [email, setEmail] = useState("");
  const [password, setPw] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const { loginStaff, requestCustomerOtp, verifyCustomerOtp, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await loginStaff({ email, password });
      const r = data.user.role;
      if (r === "admin") navigate("/admin/dashboard");
      else if (r === "manager") navigate("/manager/dashboard");
      else if (r === "customer") navigate("/customer/dashboard");
      else navigate("/employee/billing");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please verify your credentials.");
    }
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await requestCustomerOtp({ mobile });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to dispatch OTP. Please try again later.");
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await verifyCustomerOtp({ mobile, otp });
      navigate("/customer/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP sequence.");
    }
  };

  return (
    <div className="lp">
      <div className="shell">
        <section className="hero">
          <div className="brand">
            <div className="brand-ico">
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div>
              <div className="brand-name">Trolly Hub</div>
              <div className="brand-sub">Smart POS System</div>
            </div>
          </div>

          <h1>Secure<br/>Access</h1>
          <p>
            Manage inventory and<br/>billing efficiently.
          </p>

          <div className="hero-art">
            <svg width="240" height="120" viewBox="0 0 240 120" fill="none" stroke="currentColor" strokeWidth="2">
              {/* Simple Cart and Shelf Representation */}
              <path d="M20 90h40l20-40h100" opacity="0.3"/>
              <circle cx="80" cy="100" r="10" opacity="0.3"/>
              <circle cx="160" cy="100" r="10" opacity="0.3"/>
              <rect x="180" y="40" width="40" height="70" rx="4" opacity="0.3"/>
              <path d="M190 50h20 M190 65h20 M190 80h20 M190 95h20" opacity="0.3"/>
            </svg>
          </div>
        </section>

        <section className="lc">
          <div style={{ marginBottom: 32 }}>
            <Link to="/" style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: 8, 
              padding: "10px 16px", 
              borderRadius: 50, 
              background: "var(--bg)", 
              color: "var(--text2)", 
              fontSize: 13, 
              fontWeight: 600, 
              textDecoration: "none",
              border: "1px solid var(--border)",
              transition: "all 0.2s"
            }} className="btn-back">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back to Home
            </Link>
          </div>
          <div className="l-title">Welcome Back</div>
          <div className="l-sub">Select your sign in method to continue</div>

          {successMsg && <div style={{
            padding: "12px 16px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 8,
            color: "#166534",
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 20
          }}>{successMsg}</div>}

          <div className="l-tabs">
            <button className={`l-tab${tab === "staff" ? " active" : ""}`} onClick={() => { setTab("staff"); setError(""); }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              Email Login
            </button>
            <button className={`l-tab${tab === "customer" ? " active" : ""}`} onClick={() => { setTab("customer"); setError(""); setStep(1); }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              OTP Login
            </button>
          </div>

          {tab === "staff" && (
            <form onSubmit={handleStaffLogin}>
              <div className="l-field">
                <label className="l-label">Email Address</label>
                <div className="l-iw">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  <input type="email" placeholder="name@trollyhub.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="l-field">
                <label className="l-label">Password</label>
                <div className="l-iw">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <input type={showPw ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPw(e.target.value)} required />
                  <button type="button" className="eye-btn" onClick={() => setShowPw((p) => !p)}>{showPw ? <EyeClosed /> : <EyeOpen />}</button>
                </div>
              </div>

              {error && <div className="l-err">{error}</div>}

              <button className="l-btn" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          )}

          {tab === "customer" && step === 1 && (
            <form onSubmit={sendOtp}>
              <div className="l-field">
                <label className="l-label">Mobile Number</label>
                <div className="l-iw">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  <input type="tel" placeholder="Enter mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
                </div>
              </div>

              {error && <div className="l-err">{error}</div>}

              <button className="l-btn" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {tab === "customer" && step === 2 && (
            <form onSubmit={verifyOtp}>
              <div className="l-field">
                <label className="l-label">Enter OTP Code (sent to {mobile})</label>
                <div className="l-iw">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                </div>
              </div>

              {error && <div className="l-err">{error}</div>}

              <button className="l-btn" disabled={loading || otp.length < 4}>
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>
            </form>
          )}

          <div style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: "#64748b" }}>
            Don't have an account? <Link to="/signup" style={{ color: "#1a6640", fontWeight: 600, textDecoration: "none" }}>Sign Up</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
