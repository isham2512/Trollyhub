import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .err-root { min-height:100vh; background:#0c1a12; display:grid; place-items:center; position:relative; overflow:hidden; }
        .err-glow { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; }
        .err-g1 { width:400px; height:400px; background:rgba(22,163,74,.12); top:-80px; left:-80px; }
        .err-g2 { width:350px; height:350px; background:rgba(5,150,105,.08); bottom:-60px; right:-60px; }
        .err-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(22,163,74,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(22,163,74,.04) 1px,transparent 1px); background-size:36px 36px; pointer-events:none; }
        .err-card { position:relative; z-index:1; text-align:center; padding:60px 48px; max-width:480px; animation:fadeUp .5s ease both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .err-code { font-size:clamp(80px,15vw,140px); font-weight:800; line-height:1; background:linear-gradient(135deg,#4ade80,#16a34a); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; letter-spacing:-.04em; }
        .err-title { font-size:24px; font-weight:700; color:#fff; margin:8px 0 10px; }
        .err-sub { font-size:14px; color:rgba(255,255,255,.4); line-height:1.7; margin-bottom:32px; }
        .err-btn { display:inline-flex; align-items:center; gap:8px; background:linear-gradient(135deg,#16a34a,#166534); color:#fff; padding:13px 28px; border-radius:14px; font-weight:700; font-size:14px; transition:all .2s; box-shadow:0 6px 20px rgba(22,163,74,.4); }
        .err-btn:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(22,163,74,.5); }
      `}</style>
      <div className="err-root">
        <div className="err-glow err-g1"/><div className="err-glow err-g2"/><div className="err-grid"/>
        <div className="err-card">
          <div className="err-code">404</div>
          <div className="err-title">Page not found</div>
          <p className="err-sub">The page you're looking for doesn't exist or has been moved.<br/>Let's get you back on track.</p>
          <Link to="/" className="err-btn">← Back to Home</Link>
        </div>
      </div>
    </>
  );
}
