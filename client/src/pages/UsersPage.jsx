import { useEffect, useState } from "react";
import api from "../api";

const ROLE_META = {
  manager:  { emoji:"📋", color:"#2563eb", bg:"#eff6ff", border:"#bfdbfe", label:"Manager"  },
  employee: { emoji:"🧾", color:"#16a34a", bg:"#f0fdf4", border:"#bbf7d0", label:"Employee" },
  customer: { emoji:"🛍️", color:"#d97706", bg:"#fffbeb", border:"#fde68a", label:"Customer" },
};
const blank = { name:"", role:"employee", email:"", mobile:"", password:"" };

export default function UsersPage() {
  const [users, setUsers]       = useState([]);
  const [form, setForm]         = useState(blank);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess]   = useState("");
  const [search, setSearch]     = useState("");

  const load = async () => { 
    try {
      const { data } = await api.get("/users"); 
      setUsers(Array.isArray(data) ? data : []); 
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([]);
    }
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault(); 
    setSaving(true);
    try {
      await api.post("/users", form);
      setForm(blank); 
      setShowForm(false);
      setSuccess(`${form.name} created successfully!`);
      setTimeout(() => setSuccess(""), 3000);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create user");
    } finally { 
      setSaving(false); 
    }
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const filtered = safeUsers.filter(u =>
    (u?.name || "").toLowerCase().includes((search || "").toLowerCase()) ||
    (u?.email || "").toLowerCase().includes((search || "").toLowerCase()) ||
    (u?.role || "").toLowerCase().includes((search || "").toLowerCase())
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {["manager","employee","customer"].map(r => {
          const meta = ROLE_META[r];
          const count = users.filter(u => u.role===r).length;
          return (
            <div key={r} style={{background:meta.bg,border:`1.5px solid ${meta.border}`,borderRadius:"var(--r-xl)",padding:"14px 18px"}}>
              <div style={{fontSize:20,marginBottom:6}}>{meta.emoji}</div>
              <div style={{fontSize:22,fontWeight:800,color:meta.color}}>{count}</div>
              <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:meta.color,opacity:.7}}>{meta.label}s</div>
            </div>
          );
        })}
        <div style={{background:"var(--surface2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-xl)",padding:"14px 18px"}}>
          <div style={{fontSize:20,marginBottom:6}}>👥</div>
          <div style={{fontSize:22,fontWeight:800,color:"var(--text)"}}>{users.length}</div>
          <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:"var(--text3)"}}>Total Users</div>
        </div>
      </div>

      {success && <div className="msg-success">✓ {success}</div>}

      {/* Add user form */}
      {showForm ? (
        <div className="card card-pad" style={{border:"1.5px solid var(--green)",boxShadow:"0 0 0 3px rgba(22,163,74,.08)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
            <div style={{fontWeight:800,fontSize:16,color:"var(--text)"}}>Create New User</div>
            <button onClick={()=>setShowForm(false)} style={{background:"none",border:"none",color:"var(--text4)",cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
          </div>
          <form onSubmit={save}>
            <div className="form-grid" style={{marginBottom:14}}>
              {[
                {ph:"Full name",k:"name"},
                {ph:"Email address",k:"email",t:"email"},
                {ph:"Mobile",k:"mobile",t:"tel"},
                {ph:"Password",k:"password",t:"password"},
              ].map(f => (
                <div key={f.k}>
                  <label style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:"var(--text3)",display:"block",marginBottom:5}}>{f.ph}</label>
                  <input className="solo" type={f.t||"text"} placeholder={f.ph} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} required={f.k!=="mobile"} />
                </div>
              ))}
              <div>
                <label style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:"var(--text3)",display:"block",marginBottom:5}}>Role</label>
                <select className="solo" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-primary" disabled={saving}>{saving?"Creating…":"Create User"}</button>
              <button type="button" className="btn btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:"var(--surface)",border:"1.5px solid var(--border)",borderRadius:"var(--r-md)",padding:"9px 14px"}}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--text4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
            <input placeholder="Search users…" value={search} onChange={e=>setSearch(e.target.value)}
              style={{border:"none",outline:"none",background:"transparent",fontSize:13.5,color:"var(--text)",width:"100%"}}/>
          </div>
          <button className="btn btn-primary" onClick={()=>setShowForm(true)}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            Add User
          </button>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>User</th><th>Role</th><th>Email</th><th>Mobile</th><th>Joined</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{textAlign:"center",padding:"48px 0",color:"var(--text4)"}}>
                  <div style={{fontSize:32,marginBottom:8}}>👤</div>No users found
                </td></tr>
              ) : filtered.map(u => {
                const meta = ROLE_META[u.role]||{emoji:"👤",color:"var(--text3)",bg:"var(--surface2)",border:"var(--border)",label:u.role};
                const initials = (u.name||"U").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
                return (
                  <tr key={u._id}>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:34,height:34,borderRadius:50,background:meta.bg,border:`1.5px solid ${meta.border}`,display:"grid",placeItems:"center",fontWeight:800,fontSize:12,color:meta.color,flexShrink:0}}>
                          {initials}
                        </div>
                        <div style={{fontWeight:600,color:"var(--text)",fontSize:13.5}}>{u.name||"—"}</div>
                      </div>
                    </td>
                    <td>
                      <span style={{background:meta.bg,border:`1px solid ${meta.border}`,color:meta.color,fontSize:11.5,fontWeight:700,padding:"3px 9px",borderRadius:50,display:"inline-flex",alignItems:"center",gap:5}}>
                        {meta.emoji} {meta.label}
                      </span>
                    </td>
                    <td style={{color:"var(--text3)",fontSize:13}}>{u.email||"—"}</td>
                    <td style={{color:"var(--text3)",fontSize:13,fontFamily:"monospace"}}>{u.mobile||"—"}</td>
                    <td style={{fontSize:12,color:"var(--text4)"}}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—"}
                    </td>
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
