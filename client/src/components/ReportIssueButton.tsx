import { useState } from "react";
import { captureScreenAsDataUrl } from "../lib/screenshot";
export default function ReportIssueButton({ appId, reportedBy }:{ appId?:string; reportedBy:string }){
  const [open,setOpen]=useState(false); const [title,setTitle]=useState(""); const [desc,setDesc]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(){
    setBusy(true);
    const screenshot = await captureScreenAsDataUrl();
    await fetch("/api/support/report",{ method:"POST", credentials:"include", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ title, description: desc, appId, screenshot, reportedBy }) });
    setBusy(false); setOpen(false); setTitle(""); setDesc("");
    alert("Thanks — your report has been sent to Support.");
  }
  return (<>
    <button className="auth-btn secondary" onClick={()=>setOpen(true)}>Report an Issue</button>
    {open && <div className="modal"><div className="card pad" role="dialog" aria-modal="true" style={{maxWidth:560}}>
      <div className="section-title">Report an Issue</div>
      <div className="auth-field"><label>Title</label><input className="auth-input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Short summary"/></div>
      <div className="auth-field"><label>Description</label><textarea className="auth-input" rows={6} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="What happened? Steps to reproduce."/></div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button className="auth-btn" onClick={()=>setOpen(false)} disabled={busy}>Cancel</button>
        <button className="lm-inbound" onClick={submit} disabled={!title || !desc || busy}>{busy?"Submitting…":"Submit"}</button>
      </div>
    </div></div>}
  </>);
}