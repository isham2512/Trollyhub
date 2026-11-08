import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .unauth-root { min-height:100vh; background:#0c1a12; display:grid; place-items:center; position:relative; overflow:hidden; }
        .unauth-glow { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; }
        .unauth-g1 { width:360px; height:360px; background:rgba(220,38,38,.1); top:-60px; right:-60px; }
        .unauth-g2 { width:300px; height:300px; background:rgba(22,163,74,.08); bottom:-60px; left:-40px; }
        .unauth-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px); background-size:36px 36px; pointer-events:none; }
        .unauth-card { position:relative; z-index:1; text-align:center; padding:60px 48px; max-width:480px; animation:fadeUp .5s ease both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .unauth-icon { font-size:56px; margin-bottom:16px; animation:wiggle .5s .3s ease both; }
        @keyframes wiggle { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-8deg)} 75%{transform:rotate(8deg)} }
        .unauth-code { font-size:clamp(60px,12vw,110px); font-weight:800; line-height:1; background:linear-gradient(135deg,#f87171,#dc2626); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; letter-spacing:-.04em; }
        .unauth-title { font-size:22px; font-weight:700; color:#fff; margin:8px 0 10px; }
        .unauth-sub { font-size:14px; color:rgba(255,255,255,.4); line-height:1.7; margin-bottom:32px; }
        .unauth-btn { display:inline-flex; align-items:center; gap:8px; background:linear-gradient(135deg,#16a34a,#166534); color:#fff; padding:13px 28px; border-radius:14px; font-weight:700; font-size:14px; transition:all .2s; box-shadow:0 6px 20px rgba(22,163,74,.4); }
        .unauth-btn:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(22,163,74,.5); }
      `}</style>
      <div className="unauth-root">
        <div className="unauth-glow unauth-g1"/><div className="unauth-glow unauth-g2"/><div className="unauth-grid"/>
        <div className="unauth-card">
          <div className="unauth-icon">🔒</div>
          <div className="unauth-code">401</div>
          <div className="unauth-title">Access Denied</div>
          <p className="unauth-sub">You don't have permission to view this page.<br/>Please sign in with the correct role to continue.</p>
          <Link to="/login" className="unauth-btn">← Back to Login</Link>
        </div>
      </div>
    </>
  );
}
