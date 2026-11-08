import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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

export default function Signup() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser({ name, mobile, email, password });
      navigate("/customer/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please verify your details.");
    } finally {
      setLoading(false);
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

          <h1>Create<br/>Account</h1>
          <p>
            Join Trolly Hub to manage inventory, sales, and billing seamlessly.
          </p>

          <div className="hero-art">
            <svg width="240" height="120" viewBox="0 0 240 120" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 90h40l20-40h100" opacity="0.3"/>
              <circle cx="80" cy="100" r="10" opacity="0.3"/>
              <circle cx="160" cy="100" r="10" opacity="0.3"/>
              <rect x="180" y="40" width="40" height="70" rx="4" opacity="0.3"/>
              <path d="M190 50h20 M190 65h20 M190 80h20 M190 95h20" opacity="0.3"/>
            </svg>
          </div>
        </section>

        <section className="lc">
          <div style={{ marginBottom: 24 }}>
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
          <div className="l-title">Get Started</div>
          <div className="l-sub">Create a customer account to begin</div>

          <form onSubmit={handleSignup}>
            <div className="l-field">
              <label className="l-label">Full Name</label>
              <div className="l-iw">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                <input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>

            <div className="l-field">
              <label className="l-label">Mobile Number</label>
              <div className="l-iw">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                <input type="tel" placeholder="Enter mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
              </div>
            </div>

            <div className="l-field">
              <label className="l-label">Email Address</label>
              <div className="l-iw">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: "#64748b" }}>
            Already have an account? <Link to="/login" style={{ color: "#1a6640", fontWeight: 600, textDecoration: "none" }}>Sign In</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
