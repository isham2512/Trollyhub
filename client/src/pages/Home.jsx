import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-root">
      {/* Navigation */}
      <nav className="home-nav">
        <div className="nav-left">
          <div className="nav-logo-icon">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div className="nav-logo-text">Trolly Hub</div>
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About Us</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="nav-actions">
          <Link to="/login" className="btn btn-ghost" style={{padding:"10px 24px"}}>
            Log In
          </Link>
          <Link to="/signup" className="btn btn-primary" style={{padding:"10px 24px"}}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-sec">
        <div className="hero-content">
          <div className="hero-pill">Smart POS Solution</div>
          <h1>
            Manage Your Store <br /><span>Smarter</span> and Faster
          </h1>
          <p>
            Trolly Hub helps you manage billing, inventory, orders and reports in one simple platform.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary" style={{padding:"14px 28px", fontSize:15}}>
              Get Started
            </Link>
            <Link to="/login" className="btn btn-ghost" style={{padding:"14px 28px", fontSize:15}}>
              View Demo
            </Link>
          </div>
        </div>

        <div className="hero-art-container">
          <div className="hero-blob" />
          <div className="hero-mockup">
            {/* Extremely simplified CSS representation of the dashboard to serve as the graphic */}
            <div style={{display:"flex",height:400,background:"#f8fafc"}}>
              <div style={{width:80,background:"#1a6640",padding:16}}>
                <div style={{width:32,height:32,background:"#fff",borderRadius:8,marginBottom:24}}/>
                {[1,2,3,4,5,6].map(i=><div key={i} style={{width:32,height:12,background:"rgba(255,255,255,0.2)",borderRadius:4,marginBottom:16}}/>)}
              </div>
              <div style={{flex:1,padding:24,background:"#f8fafc"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:24}}>
                  <div style={{width:100,height:16,background:"#cbd5e1",borderRadius:4}}/>
                  <div style={{width:150,height:16,background:"#cbd5e1",borderRadius:4}}/>
                </div>
                <div style={{display:"flex",gap:16,marginBottom:24}}>
                  {[1,2,3,4].map(i=>(
                    <div key={i} style={{flex:1,height:80,background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:12}}>
                      <div style={{width:24,height:24,background:"#eaf3ef",borderRadius:6,marginBottom:8}}/>
                      <div style={{width:"60%",height:12,background:"#cbd5e1",borderRadius:4}}/>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:16}}>
                  <div style={{flex:2,height:160,background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:16}}>
                    <div style={{width:"30%",height:12,background:"#cbd5e1",borderRadius:4,marginBottom:16}}/>
                    <div style={{display:"flex",alignItems:"flex-end",gap:12,height:100}}>
                      {[60,40,80,30,90,50].map((h,i)=><div key={i} style={{flex:1,height:`${h}%`,background:"#1a6640",borderRadius:"4px 4px 0 0"}}/>)}
                    </div>
                  </div>
                  <div style={{flex:1,height:160,background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:16,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                    <div style={{width:48,height:48,borderRadius:"50%",background:"#dcfce7",border:"4px solid #bbf7d0",marginBottom:12}}/>
                    <div style={{width:"80%",height:10,background:"#cbd5e1",borderRadius:4,marginBottom:6}}/>
                    <div style={{width:"60%",height:8,background:"#e2e8f0",borderRadius:4}}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="feat-bar" id="features">
        <div className="feat-item">
          <div className="feat-icon-box">
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          </div>
          <div className="feat-info">
            <h3>Inventory Management</h3>
            <p>Track stock in real-time and get low stock alerts.</p>
          </div>
        </div>

        <div className="feat-item">
          <div className="feat-icon-box">
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <div className="feat-info">
            <h3>Fast Billing</h3>
            <p>Create bills quickly and manage transactions easily.</p>
          </div>
        </div>

        <div className="feat-item">
          <div className="feat-icon-box">
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <div className="feat-info">
            <h3>Real-time Reports</h3>
            <p>Get insights that help you grow your business.</p>
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <footer className="footer-cta" id="about">
        <div className="footer-content">
          <div className="footer-icon">
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h2>Start managing your store today</h2>
          <p>Join thousands of businesses using Trolly Hub.</p>
        </div>
        <Link to="/signup" className="btn btn-primary" style={{padding:"16px 32px", fontSize:16}}>
          Create Account →
        </Link>
      </footer>
    </div>
  );
}
