"use client";
import { useState, useEffect, useRef } from "react";

function useIsMounted(){
  const [mounted,setMounted]=useState(false);
  useEffect(()=>setMounted(true),[]);
  return mounted;
}

const SEQ_TYPES = [
  { id:"cold",        label:"Cold Prospecting",    icon:"🎯", color:"#60a5fa", steps:["d1_li","d2_em","d4_vm","d8_em","d15_em","d18_sms","d22_em","d44_em"], tone:"Professional but warm. Lead with insight not pitch. Build familiarity before asking. Gradual escalation over 44 days." },
  { id:"reengagement",label:"Re-Engagement",       icon:"🔄", color:"#c084fc", steps:["d2_em","d8_em","d15_em","d22_em","d44_em","d1_li","d18_sms","d4_vm"],  tone:"Acknowledge the gap, no guilt. Lead with something new. Create a reason to re-engage now." },
  { id:"inbound",     label:"Inbound Follow-Up",   icon:"📥", color:"#4ade80", steps:["d2_em","d4_vm","d8_em","d1_li","d15_em","d18_sms","d22_em","d44_em"], tone:"They raised their hand — respond fast. Reference what they requested. High intent means faster asks." },
  { id:"postmeeting", label:"Post-Meeting / Demo", icon:"🤝", color:"#f0a500", steps:["d2_em","d4_vm","d8_em","d15_em","d22_em","d1_li","d18_sms","d44_em"], tone:"Reference specifics from the meeting. Reinforce value seen. Address objections. Move toward a next step." },
  { id:"referral",    label:"Referral Outreach",   icon:"👋", color:"#fb923c", steps:["d2_em","d1_li","d8_em","d4_vm","d15_em","d22_em","d18_sms","d44_em"], tone:"Lead with the mutual connection. Warm tone from the start. More conversational, faster to the ask." },
];
const PERSONAS = [
  { id:"economic",  label:"Economic Buyer", sub:"CEO / CFO / Owner",  icon:"💼", color:"#f87171", tone:"Concise, ROI-focused. Business outcomes, revenue impact. Short emails, clear asks." },
  { id:"champion",  label:"Champion",       sub:"End User / Manager", icon:"⭐", color:"#4ade80", tone:"Day-to-day pain. Empathetic, conversational. Help them build the internal case." },
  { id:"technical", label:"Technical Buyer",sub:"IT / Engineering",   icon:"⚙️", color:"#60a5fa", tone:"Lead with credibility. No fluff. Mention integrations, security, scalability." },
  { id:"influencer",label:"Influencer",     sub:"Director / VP",      icon:"📊", color:"#c084fc", tone:"Balance strategic outcomes with team impact. Mix business case with practical benefits." },
];
const TOUCHES = [
  { id:"d1_li",  day:1,  label:"Connection Request", ch:"LinkedIn",  icon:"💼", dl:"Day 1"  },
  { id:"d2_em",  day:2,  label:"Intro Email",        ch:"Email",     icon:"✉️", dl:"Day 2"  },
  { id:"d4_vm",  day:4,  label:"Voicemail",          ch:"Voicemail", icon:"📞", dl:"Day 4"  },
  { id:"d8_em",  day:8,  label:"Value-Add Email",    ch:"Email",     icon:"✉️", dl:"Day 8"  },
  { id:"d15_em", day:15, label:"Social Proof",       ch:"Email",     icon:"✉️", dl:"Day 15" },
  { id:"d18_sms",day:18, label:"SMS Touch",          ch:"SMS",       icon:"💬", dl:"Day 18" },
  { id:"d22_em", day:22, label:"Direct Ask",         ch:"Email",     icon:"✉️", dl:"Day 22" },
  { id:"d44_em", day:44, label:"Last Touch",         ch:"Email",     icon:"✉️", dl:"Day 44" },
];
const CHANGE_AGENTS = [
  { key:"funding",      icon:"💰", label:"Funding & M&A",   color:"#4ade80" },
  { key:"products",     icon:"🚀", label:"New Products",     color:"#60a5fa" },
  { key:"hiring",       icon:"👥", label:"Hiring & Layoffs", color:"#f0a500" },
  { key:"earnings",     icon:"📊", label:"Earnings",         color:"#c084fc" },
  { key:"partnerships", icon:"🤝", label:"Partnerships",     color:"#fb923c" },
  { key:"regulatory",   icon:"⚖️", label:"Legal & Risk",     color:"#f87171" },
];
const PR_SIGNALS = [
  { key:"background",icon:"👤",label:"Background",    color:"#60a5fa"},
  { key:"content",   icon:"✍️",label:"Content/Quotes",color:"#c084fc"},
  { key:"priorities",icon:"🎯",label:"Priorities",    color:"#4ade80"},
  { key:"pain",      icon:"⚡",label:"Pain Signals",  color:"#f0a500"},
];
const STATUSES = [
  {id:"researching",label:"Researching",color:"#60a5fa"},
  {id:"active",     label:"Active",     color:"#f0a500"},
  {id:"warm",       label:"Warm",       color:"#4ade80"},
  {id:"followup",   label:"Follow-up",  color:"#fb923c"},
  {id:"nurture",    label:"Nurture",    color:"#c084fc"},
  {id:"closed",     label:"Closed",     color:"#6b7280"},
];
const CH = {
  LinkedIn: {bg:"rgba(96,165,250,.1)", bd:"rgba(96,165,250,.3)", tx:"#93c5fd"},
  Email:    {bg:"rgba(240,165,0,.1)",  bd:"rgba(240,165,0,.3)",  tx:"#fcd34d"},
  Voicemail:{bg:"rgba(74,222,128,.1)", bd:"rgba(74,222,128,.3)", tx:"#86efac"},
  SMS:      {bg:"rgba(192,132,252,.1)",bd:"rgba(192,132,252,.3)",tx:"#d8b4fe"},
};

const sGet  = async k    => {try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch{return null;}};
const sSet  = async(k,v) => {try{localStorage.setItem(k,JSON.stringify(v));return true;}catch{return false;}};
const sDel  = async k    => {try{localStorage.removeItem(k);return true;}catch{return false;}};
const sList = async p    => {try{return Object.keys(localStorage).filter(k=>k.startsWith(p));}catch{return[]}};
const acctKey = n => `acct:${n.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"")}`;
const ts  = () => new Date().toISOString();
const fmt = iso => {try{return new Date(iso).toLocaleDateString("en-US",{month:"short",day:"numeric"});}catch{return "—";}};

function parseJsonFromText(raw) {
  let t = (raw || "").replace(/```json|```/g, "").trim();
  const start = t.indexOf("{");
  if (start === -1) throw new Error("No JSON object found in response");
  let depth = 0, end = -1;
  for (let i = start; i < t.length; i++) {
    if (t[i] === "{") depth++;
    else if (t[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  const jsonStr = end !== -1 ? t.slice(start, end + 1) : t.slice(start);
  return JSON.parse(jsonStr);
}

async function ai(system,user){
  const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2500,system,messages:[{role:"user",content:user}]})});
  const d=await r.json();
  if(!r.ok||d.error) throw new Error(d.error?.message||d.message||`API error (${r.status})`);
  const t=(d.content||[]).map(b=>b.text||"").join("");
  return parseJsonFromText(t);
}

async function webSearch(system, user) {
  const r = await fetch("/api/claude", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens:2000,
      system,
      tools:[{"type":"web_search_20250305","name":"web_search"}],
      messages:[{role:"user", content:user}]
    })
  });
  const d = await r.json();
  if(d.error) throw new Error(d.error.message);
  const text = (d.content||[]).filter(b=>b.type==="text").map(b=>b.text||"").join("").trim();
  return parseJsonFromText(text);
}

const WS_CO = (co,industry,seller) =>
  `You are a B2B sales intelligence assistant. Use web search to find the latest news, signals, and activity about "${co}" (${industry||"B2B company"}).
The seller solves: "${seller.problemSolved}" for ICP: "${seller.icp}".
Search for: recent funding, product launches, hiring trends, earnings, partnerships, leadership changes, and anything signaling a buying cycle.
After searching, return ONLY valid JSON with no markdown fences:
{"snapshot":"2-3 sentence company overview","funding":[],"products":[],"hiring":[],"earnings":[],"partnerships":[],"regulatory":[],"buyingSignals":"one sentence on why they may be in a buying cycle now","timingScore":"Hot or Warm or Cold","timingReason":"one sentence explaining the score"}
Only populate arrays where you found real signal. Return ONLY valid JSON.`;

const WS_PR = (firstName,lastName,title,company,seller) =>
  `You are a B2B sales intelligence assistant. Use web search to find information about ${firstName} ${lastName}, ${title} at ${company}.
The seller solves: "${seller.problemSolved}".
Search for: their LinkedIn activity, recent posts, interviews, conference appearances, priorities, and any signal relevant to the seller.
After searching, return ONLY valid JSON with no markdown fences:
{"summary":"2-3 sentence overview","background":[],"content":[],"priorities":[],"pain":[],"angle":"best personalized outreach angle for this seller","opener":"one natural conversation-starting sentence","warmth":"Champion or Influencer or Gatekeeper or Unknown"}
Return ONLY valid JSON.`;

const Q_CO  = s=>`ONE Google search query surfacing buying signals for seller who solves:"${s.problemSolved}",ICP:"${s.icp}". Return ONLY JSON:{"query":"..."}`;
const S_CI  = `Extract company intel. Return ONLY JSON:{"snapshot":"2-3 sentences","funding":[],"products":[],"hiring":[],"earnings":[],"partnerships":[],"regulatory":[],"buyingSignals":"why in buying mode","timingScore":"Hot/Warm/Cold","timingReason":"one sentence"}`;
const S_PI  = `Extract prospect intel. Return ONLY JSON:{"summary":"2-3 sentences","background":[],"content":[],"priorities":[],"pain":[],"angle":"best outreach angle","opener":"one sentence conversation starter","warmth":"Champion/Influencer/Gatekeeper/Unknown"}`;
const S_SEQ = (st,p)=>`Expert B2B sales copywriter. SEQUENCE:${st.label}—${st.tone} PERSONA:${p.label}(${p.sub})—${p.tone} Return ONLY JSON keys:${st.steps.join(",")} each:{"subject":"or empty","body":"message"}. Voicemail<25w,SMS<30w,LinkedIn<300ch. No placeholders. Return ONLY valid JSON.`;

function Fld({label,value,onChange,ph,ta}){
  return <div><label className="fl">{label}</label>{ta?<textarea className="ta" value={value} onChange={onChange} placeholder={ph} rows={3}/>:<input className="fi" value={value} onChange={onChange} placeholder={ph}/>}</div>;
}
function AB({onClick,children,loading,disabled,color,sm,style}){
  const p=sm?"6px 12px":"9px 17px";const fs=sm?11:12;
  return <button className="abtn" onClick={onClick} disabled={disabled||loading} style={{padding:p,background:`${color}18`,border:`1px solid ${color}35`,color,fontSize:fs,opacity:(disabled||loading)?0.4:1,...style}}>{loading&&<span className="spin"/>}{children}</button>;
}
function QBox({query,copied,onCopy,color}){
  return <div className="qbox" style={{borderColor:color+"25"}}><div style={{fontSize:9,color,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>SEARCH QUERY</div><div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#e8e3d8",lineHeight:1.6,marginBottom:8}}>{query}</div><div className="row gap8"><button className={`cpbtn${copied?" ok":""}`} onClick={onCopy}>{copied?"COPIED":"COPY"}</button><a href={`https://www.google.com/search?q=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer" style={{padding:"4px 10px",borderRadius:6,background:color+"10",border:`1px solid ${color}25`,color,fontSize:10,textDecoration:"none",fontWeight:500}}>OPEN IN GOOGLE</a></div></div>;
}
function ICard({ca,items}){
  return <div className="icard"><div className="ihead" style={{color:ca.color}}>{ca.icon} {ca.label}</div>{items.map((it,i)=><div key={i} className="iitem" style={{borderLeftColor:ca.color+"30"}}>{it}</div>)}</div>;
}

export default function Home(){
  const mounted = useIsMounted();
  const [view,setView]=useState("home");
  const [resTab,setResTab]=useState("company");
  const [seqTab,setSeqTab]=useState("build");
  const [seller,setSeller]=useState({yourName:"",yourTitle:"",yourCompany:"",yourPhone:"",sellerIndustry:"",problemSolved:"",icp:"",valueprop:"",socialProof:""});
  const [profileDone,setProfileDone]=useState(false);
  const [showProfile,setShowProfile]=useState(false);
  const [accounts,setAccounts]=useState([]);
  const [co,setCo]=useState({name:"",industry:"",website:""});
  const [coQuery,setCoQuery]=useState("");
  const [coPasted,setCoPasted]=useState("");
  const [coIntel,setCoIntel]=useState(null);
  const [loadingCQ,setLoadingCQ]=useState(false);
  const [analyzingCo,setAnalyzingCo]=useState(false);
  const [acctStatus,setAcctStatus]=useState("researching");
  const [acctNotes,setAcctNotes]=useState("");
  const [savedMsg,setSavedMsg]=useState("");
  const [prospects,setProspects]=useState([]);
  const [activePi,setActivePi]=useState(null);
  const [newP,setNewP]=useState({firstName:"",lastName:"",title:"",linkedin:"",seqTypeId:"cold",personaId:"economic"});
  const [addingP,setAddingP]=useState(false);
  const [seqType,setSeqType]=useState(SEQ_TYPES[0]);
  const [persona,setPersona]=useState(PERSONAS[0]);
  const [seqForm,setSeqForm]=useState({firstName:"",lastName:"",company:"",title:"",industry:"",painPoint:"",valueprop:"",socialProof:"",referralName:"",meetingNotes:"",downloadedContent:""});
  const [seqIntel,setSeqIntel]=useState("");
  const [seqQuery,setSeqQuery]=useState("");
  const [loadingSQ,setLoadingSQ]=useState(false);
  const [generating,setGenerating]=useState(false);
  const [generated,setGenerated]=useState(null);
  const [activeStep,setActiveStep]=useState(null);
  const [trackerPi,setTrackerPi]=useState(null);
  const [copied,setCopied]=useState("");
  const [err,setErr]=useState("");
  const [sqCopied,setSqCopied]=useState(false);
  const [cqCopied,setCqCopied]=useState(false);
  const [trendQuery,setTrendQuery]=useState("");
  const [loadingTQ,setLoadingTQ]=useState(false);
  const [tqCopied,setTqCopied]=useState(false);
  const [geminiKey,setGeminiKey]=useState("");
  const [geminiInput,setGeminiInput]=useState("");
  const [autoResearchingCo,setAutoResearchingCo]=useState(false);

  const ref=useRef({});
  ref.current={co,coIntel,prospects,acctStatus,acctNotes};

  useEffect(()=>{
    (async()=>{
      const s=await sGet("gw-seller");
      if(s){setSeller(s);setProfileDone(true);}else setShowProfile(true);
      const gk=await sGet("gw-gemini-key");
      if(gk){setGeminiKey(gk);setGeminiInput(gk);}
      await reload();
    })();
  },[]);

  const reload=async()=>{
    const keys=await sList("acct:");
    const all=await Promise.all(keys.map(k=>sGet(k)));
    setAccounts(all.filter(Boolean).sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)));
  };

  const save=async(ov={})=>{
    const{co,coIntel,prospects,acctStatus,acctNotes}=ref.current;
    if(!co.name)return;
    const key=acctKey(co.name);
    const prev=await sGet(key);
    await sSet(key,{id:key,co,coIntel,prospects,status:ov.status??acctStatus,notes:ov.notes??acctNotes,createdAt:prev?.createdAt||ts(),updatedAt:ts()});
    await reload();
    setSavedMsg("Saved"); setTimeout(()=>setSavedMsg(""),2000);
  };

  useEffect(()=>{
    const{co,coIntel,prospects}=ref.current;
    if(co.name&&(coIntel||prospects.length>0))save();
  },[coIntel,prospects]);

  const loadAcct=a=>{
    setCo(a.co);setCoIntel(a.coIntel);setProspects(a.prospects||[]);
    setActivePi(a.prospects?.length>0?0:null);
    setAcctStatus(a.status||"researching");setAcctNotes(a.notes||"");
    setCoQuery("");setCoPasted("");setTrackerPi(null);
    setView("research");setResTab("company");
  };

  const delAcct=async(key,e)=>{
    e.stopPropagation();
    if(!window.confirm("Delete this account?"))return;
    await sDel(key);await reload();
  };

  const patchAcct=async(key,field,val)=>{
    const a=await sGet(key);if(!a)return;
    a[field]=val;a.updatedAt=ts();await sSet(key,a);await reload();
    if(field==="status"&&co.name&&acctKey(co.name)===key)setAcctStatus(val);
    if(field==="notes"&&co.name&&acctKey(co.name)===key)setAcctNotes(val);
  };

  const autoResearchCo=async()=>{
    if(!co.name){setErr("Enter company name first.");return;}
    setErr("");setAutoResearchingCo(true);
    try{
      const d=await webSearch(WS_CO(co.name,co.industry,seller),`Research ${co.name} (${co.industry||"B2B company"}) for B2B sales intel.`);
      setCoIntel(d);
    }catch(e){setErr("Auto-research failed: "+e.message);}
    setAutoResearchingCo(false);
  };

  const autoResearchPr=async(i)=>{
    const p=prospects[i];
    upP(i,"analyzing",true);setErr("");
    try{
      const d=await webSearch(WS_PR(p.firstName,p.lastName,p.title,co.name,seller),`Research ${p.firstName} ${p.lastName}, ${p.title} at ${co.name}.`);
      upP(i,"intel",d);
    }catch(e){setErr("Auto-research failed: "+e.message);}
    upP(i,"analyzing",false);
  };

  const getCoQ=async()=>{
    if(!co.name){setErr("Enter company name.");return;}
    setErr("");setLoadingCQ(true);
    try{const d=await ai(Q_CO(seller),`Company:${co.name},Industry:${co.industry}`);setCoQuery(d.query);}
    catch(e){setErr(e?.message||"Failed — try again.");}
    setLoadingCQ(false);
  };

  const getTrendQ=async()=>{
    if(!co.name){setErr("Enter company name first.");return;}
    setErr("");setLoadingTQ(true);
    try{
      const industry = co.industry||seller.sellerIndustry||"B2B SaaS";
      const d=await ai(
        `Generate ONE targeted Google search query for industry trends, headwinds, and tailwinds relevant to a company in the "${industry}" space. The seller solves:"${seller.problemSolved}". Focus on macro trends affecting buying decisions. Return ONLY JSON:{"query":"..."}`,
        `Company:${co.name}, Industry:${industry}`
      );
      setTrendQuery(d.query);
    }catch(e){setErr(e?.message||"Failed — try again.");}
    setLoadingTQ(false);
  };

  const analyzeComp=async()=>{
    if(!coPasted.trim()){setErr("Paste research first.");return;}
    setErr("");setAnalyzingCo(true);
    try{const d=await ai(S_CI+`\nSeller:"${seller.problemSolved}" ICP:"${seller.icp}"`,`Company:${co.name}\n\n${coPasted}`);setCoIntel(d);}
    catch(e){setErr(e?.message||"Analysis failed.");}
    setAnalyzingCo(false);
  };

  const upP=(i,k,v)=>setProspects(ps=>ps.map((p,j)=>j===i?{...p,[k]:v}:p));

  const addProspect=()=>{
    if(!newP.firstName||!newP.title){setErr("Name and title required.");return;}
    const ps=[...prospects,{...newP,query:"",pasted:"",intel:null,loadingQ:false,analyzing:false,generating:false,sequence:null,touchDone:{},touchDates:{},touchNotes:{},touchOutcome:{},seqStartDate:null}];
    setProspects(ps);setActivePi(ps.length-1);
    setNewP({firstName:"",lastName:"",title:"",linkedin:"",seqTypeId:"cold",personaId:"economic"});
    setAddingP(false);setErr("");
  };

  const getPrQ=async(i)=>{
    upP(i,"loadingQ",true);setErr("");
    try{const d=await ai(Q_CO(seller),`${prospects[i].firstName} ${prospects[i].lastName},${prospects[i].title} at ${co.name}`);upP(i,"query",d.query);}
    catch(e){setErr(e?.message||"Failed.");}
    upP(i,"loadingQ",false);
  };

  const analyzePr=async(i)=>{
    const p=prospects[i];if(!p.pasted.trim()){setErr("Paste research first.");return;}
    upP(i,"analyzing",true);setErr("");
    try{const d=await ai(S_PI+`\nSeller:"${seller.problemSolved}"`,`${p.firstName} ${p.lastName},${p.title}\n\n${p.pasted}`);upP(i,"intel",d);}
    catch(e){setErr(e?.message||"Failed.");}
    upP(i,"analyzing",false);
  };

  const buildSeq=async(pi)=>{
    const p=prospects[pi];
    const st=SEQ_TYPES.find(t=>t.id===p.seqTypeId)||SEQ_TYPES[0];
    const per=PERSONAS.find(x=>x.id===p.personaId)||PERSONAS[0];
    upP(pi,"generating",true);setErr("");
    try{
      const intel=p.intel?`\nCompany:${coIntel?.snapshot||""}\nAngle:${p.intel.angle}\nPain:${p.intel.pain?.join("; ")||""}`:""
      const d=await ai(S_SEQ(st,per),`Prospect:${p.firstName} ${p.lastName},${p.title} at ${co.name}\nPain:${p.intel?.pain?.join("; ")||coIntel?.buyingSignals||""}\nValue:${seller.valueprop||seller.problemSolved}\nProof:${seller.socialProof}\nSender:${seller.yourName},${seller.yourTitle} at ${seller.yourCompany}${intel}`);
      upP(pi,"sequence",d);upP(pi,"seqStartDate",ts());
    }catch(e){setErr(e?.message||"Generation failed.");}
    upP(pi,"generating",false);
  };

  const loadIntel=()=>{
    const ap=activePi!==null?prospects[activePi]:null;
    setSeqForm({firstName:ap?.firstName||"",lastName:ap?.lastName||"",company:co.name||"",title:ap?.title||"",industry:co.industry||"",painPoint:ap?.intel?.pain?.join("; ")||coIntel?.buyingSignals||"",valueprop:seller.valueprop||seller.problemSolved||"",socialProof:seller.socialProof||"",referralName:"",meetingNotes:"",downloadedContent:""});
    if(ap?.intel)setSeqIntel(`Company:${coIntel?.snapshot||""}\nBuying:${coIntel?.buyingSignals||""}\nAngle:${ap.intel.angle}`);
    setView("sequence");setSeqTab("build");
  };

  const generateSeq=async()=>{
    if(!seqForm.firstName||!seqForm.company||!seller.yourName||!seller.yourCompany){setErr("Fill required fields + seller profile.");return;}
    setErr("");setGenerating(true);
    try{
      const ex=seqType.id==="referral"?`\nReferral:${seqForm.referralName}`:seqType.id==="postmeeting"?`\nMeeting:${seqForm.meetingNotes}`:seqType.id==="inbound"?`\nDownloaded:${seqForm.downloadedContent}`:"";
      const d=await ai(S_SEQ(seqType,persona),`Prospect:${seqForm.firstName} ${seqForm.lastName},${seqForm.title} at ${seqForm.company}(${seqForm.industry})\nPain:${seqForm.painPoint}\nValue:${seqForm.valueprop}\nProof:${seqForm.socialProof}\nSender:${seller.yourName},${seller.yourTitle} at ${seller.yourCompany}${ex}${seqIntel?"\nIntel:\n"+seqIntel:""}`);
      setGenerated(d);setActiveStep(seqType.steps[0]);setSeqTab("results");
    }catch(e){setErr(e?.message||"Generation failed.");}
    setGenerating(false);
  };

  const toggleTouch=(pi,tid)=>{
    const p=prospects[pi];
    const done={...(p.touchDone||{})};const dates={...(p.touchDates||{})};
    if(done[tid]){delete done[tid];delete dates[tid];}
    else{done[tid]=true;dates[tid]=ts();}
    upP(pi,"touchDone",done);upP(pi,"touchDates",dates);
  };

  const nextT=p=>{
    if(!p.sequence)return null;
    const st=SEQ_TYPES.find(t=>t.id===p.seqTypeId)||SEQ_TYPES[0];
    const done=p.touchDone||{};
    const nid=st.steps.find(id=>!done[id]);
    if(!nid)return null;
    const touch=TOUCHES.find(t=>t.id===nid);
    const idx=st.steps.indexOf(nid);
    const prevDay=idx>0?(TOUCHES.find(t=>t.id===st.steps[idx-1])?.day||0):0;
    return{touchId:nid,touch,content:p.sequence[nid],daysFromPrev:touch.day-prevDay};
  };

  const doneCount=p=>Object.keys(p.touchDone||{}).length;
  const totalT=p=>(SEQ_TYPES.find(t=>t.id===p.seqTypeId)||SEQ_TYPES[0]).steps.length;
  const cp=(text,id)=>{navigator.clipboard.writeText(text);setCopied(id);setTimeout(()=>setCopied(""),2000);};

  const saveSeller=async()=>{
    if(!seller.problemSolved||!seller.icp){setErr("Fill in Problem Solved and ICP.");return;}
    await sSet("gw-seller",seller);setProfileDone(true);setShowProfile(false);setErr("");
  };

  const ap=activePi!==null?prospects[activePi]:null;
  const tp=trackerPi!==null?prospects[trackerPi]:null;
  const acSt=STATUSES.find(s=>s.id===acctStatus)||STATUSES[0];
  if(!mounted) return <div style={{minHeight:"100vh",background:"#0a0a08"}}/>;

  const extCfg={
    referral:{label:"Referred by",ph:"John Smith, VP at PartnerCo",key:"referralName"},
    postmeeting:{label:"Meeting Notes",ph:"What was discussed...",key:"meetingNotes"},
    inbound:{label:"What They Downloaded",ph:"Pricing guide, ROI calculator",key:"downloadedContent"},
  };

  const navs=[
    {id:"home",    icon:"◆",label:"Home"},
    {id:"settings",icon:"⚙",label:"Settings", badge:!geminiKey?"!":null,bc:"#f87171"},
    {id:"accounts",icon:"⊞",label:"Accounts", badge:accounts.length||null,bc:"#4ade80"},
    {id:"research",icon:"◎",label:"Research",  badge:coIntel?"✓":null,bc:"#60a5fa"},
    {id:"tracker", icon:"▤",label:"Tracker",   badge:prospects.filter(p=>p.sequence).length||null,bc:"#f0a500"},
    {id:"sequence",icon:"⟡",label:"Sequence",  badge:generated?"✓":null,bc:"#f0a500"},
  ];

  return(
    <div className="app">
      {showProfile&&(
        <div className="modal-bg">
          <div className="modal">
            <div style={{fontSize:10,color:"#f0a500",letterSpacing:"3px",textTransform:"uppercase",marginBottom:12}}>{profileDone?"EDIT PROFILE":"WELCOME TO GROUNDWORK"}</div>
            <div className="serif" style={{fontSize:26,fontWeight:400,margin:"0 0 7px",letterSpacing:"-.3px"}}>{profileDone?"Update your profile":"Set up your profile"}</div>
            <p style={{fontSize:12,color:"#5a5850",lineHeight:1.7,marginBottom:20}}>Powers every query, analysis, and sequence.</p>
            <div className="g2 mb10">
              <Fld label="Your Name" value={seller.yourName} onChange={e=>setSeller(s=>({...s,yourName:e.target.value}))} ph="Alex Rivera"/>
              <Fld label="Your Title" value={seller.yourTitle} onChange={e=>setSeller(s=>({...s,yourTitle:e.target.value}))} ph="Account Executive"/>
              <Fld label="Company" value={seller.yourCompany} onChange={e=>setSeller(s=>({...s,yourCompany:e.target.value}))} ph="YourCo"/>
              <Fld label="Phone" value={seller.yourPhone} onChange={e=>setSeller(s=>({...s,yourPhone:e.target.value}))} ph="555-0100"/>
              <Fld label="Your Industry" value={seller.sellerIndustry} onChange={e=>setSeller(s=>({...s,sellerIndustry:e.target.value}))} ph="e.g. SaaS, FinTech, HR Tech, Sales Tech"/>
            </div>
            <div className="divider mb10"/>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
              <Fld label="THE PROBLEM YOU SOLVE *" value={seller.problemSolved} onChange={e=>setSeller(s=>({...s,problemSolved:e.target.value}))} ph="e.g. We help revenue ops teams eliminate manual CRM data entry" ta/>
              <Fld label="YOUR ICP *" value={seller.icp} onChange={e=>setSeller(s=>({...s,icp:e.target.value}))} ph="e.g. B2B SaaS 100-1000 employees, RevOps team of 3+" ta/>
              <div className="g2">
                <Fld label="Value Proposition" value={seller.valueprop} onChange={e=>setSeller(s=>({...s,valueprop:e.target.value}))} ph="One-line: what you deliver" ta/>
                <Fld label="Social Proof" value={seller.socialProof} onChange={e=>setSeller(s=>({...s,socialProof:e.target.value}))} ph="Helped SimilarCo 3x pipeline in 60 days" ta/>
              </div>
            </div>
            {err&&<div className="err">{err}</div>}
            <div className="row gap8" style={{marginTop:12}}>
              <button onClick={saveSeller} style={{flex:1,padding:"12px",borderRadius:8,background:"#f0a500",border:"none",color:"#0a0a08",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit",letterSpacing:".5px"}}>{profileDone?"SAVE CHANGES":"SAVE & START"}</button>
              {profileDone&&<button onClick={()=>{setShowProfile(false);setErr("");}} style={{padding:"12px 16px",borderRadius:8,background:"transparent",border:"1px solid rgba(255,255,255,.07)",color:"#5a5850",cursor:"pointer",fontFamily:"inherit",fontSize:13}}>Cancel</button>}
            </div>
          </div>
            </div>
          )}

      <div className="sb">
        <div className="sb-logo"><div className="sb-name">Groundwork</div><div className="sb-tag">Sales Intelligence</div></div>
        <div className="nav">
          {navs.map(n=>(
            <div key={n.id} className={`ni${view===n.id?" on":""}`} onClick={()=>setView(n.id)}>
              <span className="ni-icon">{n.icon}</span>
              <span className="ni-label">{n.label}</span>
              {n.badge!=null&&<span className="tag" style={{background:`${n.bc}18`,color:n.bc,fontSize:9}}>{n.badge}</span>}
            </div>
          ))}
          {view==="research"&&<div className="snav">{["company","prospects","brief"].map(t=><div key={t} className={`sni${resTab===t?" on":""}`} onClick={()=>setResTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</div>)}</div>}
          {view==="sequence"&&<div className="snav">{["build","results"].map(t=><div key={t} className={`sni${seqTab===t?" on":""}`} onClick={()=>{if(t==="results"&&!generated)return;setSeqTab(t);}} style={{opacity:t==="results"&&!generated?0.35:1}}>{t.charAt(0).toUpperCase()+t.slice(1)}</div>)}</div>}
          {view==="tracker"&&prospects.length>0&&<div className="snav">{prospects.map((p,i)=><div key={i} className={`sni${trackerPi===i?" on":""}`} onClick={()=>setTrackerPi(i)}><div className="av" style={{width:16,height:16,fontSize:8,background:`hsl(${i*55+180},50%,40%)`}}>{p.firstName[0]}</div><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.firstName} {p.lastName}</span>{p.sequence&&<span style={{marginLeft:"auto",fontSize:9,color:"#4ade80",flexShrink:0}}>{doneCount(p)}/{totalT(p)}</span>}</div>)}</div>}
        </div>
        <div className="sb-bot">
          {co.name&&<div className="sb-card"><div style={{fontSize:9,color:"#5a5850",letterSpacing:"2px",textTransform:"uppercase",marginBottom:3}}>Active Account</div><div style={{fontSize:12,fontWeight:500,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{co.name}</div><div className="row gap6"><span className="tag" style={{background:`${acSt.color}18`,color:acSt.color,fontSize:9}}>{acSt.label}</span>{savedMsg&&<span style={{fontSize:9,color:"#4ade80"}}>{savedMsg}</span>}</div></div>}
          {profileDone?<div className="sb-card"><div className="between mb8"><span style={{fontSize:9,color:"#f0a500",letterSpacing:"2px",textTransform:"uppercase"}}>Profile</span><button onClick={()=>setShowProfile(true)} style={{fontSize:9,color:"#5a5850",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>EDIT</button></div><div style={{fontSize:11,lineHeight:1.5,marginBottom:2}}>{seller.problemSolved.slice(0,44)}{seller.problemSolved.length>44?"...":""}</div><div style={{fontSize:10,color:"#5a5850"}}>ICP: {seller.icp.slice(0,34)}{seller.icp.length>34?"...":""}</div></div>:<button onClick={()=>setShowProfile(true)} style={{width:"100%",padding:"8px",borderRadius:7,background:"rgba(248,113,113,.08)",border:"1px solid rgba(248,113,113,.2)",color:"#f87171",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>SET UP PROFILE</button>}
        </div>
      </div>

      <div className="main">
        <div className="wrap">

          {view==="home"&&(
            <div className="fade">
              <div className="mb20">
                <div style={{fontSize:10,color:"#f0a500",letterSpacing:"4px",textTransform:"uppercase",marginBottom:16}}>Sales Intelligence Platform</div>
                <h1 className="serif" style={{fontSize:52,fontWeight:400,lineHeight:1.02,letterSpacing:"-2px",margin:"0 0 14px",background:"linear-gradient(135deg,#e8e3d8 40%,#f0a500)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Groundwork.</h1>
                <p style={{fontSize:13,color:"#5a5850",maxWidth:420,lineHeight:1.9}}>Research accounts. Profile stakeholders. Generate personalized sequences. Track every touch. The deal is won before the first message.</p>
              </div>
              {profileDone&&<div className="am-chip row gap12 mb20"><div style={{fontSize:11,color:"#f0a500",textTransform:"uppercase",letterSpacing:"2px"}}>◆</div><div style={{flex:1}}><div style={{fontSize:11,color:"#f0a500",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:2}}>{seller.yourName||"You"} · {seller.yourCompany}</div><div style={{fontSize:13}}>{seller.problemSolved}</div></div><button onClick={()=>setShowProfile(true)} style={{padding:"5px 10px",borderRadius:6,background:"transparent",border:"1px solid rgba(255,255,255,.07)",color:"#5a5850",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>EDIT</button></div>}
              <div className="g4">{[{id:"accounts",icon:"⊞",label:"Accounts",desc:`${accounts.length} saved`,c:"#4ade80"},{id:"research",icon:"◎",label:"Research Hub",desc:"Companies + stakeholders",c:"#60a5fa"},{id:"tracker",icon:"▤",label:"Sequence Tracker",desc:"Track & execute touches",c:"#f0a500"},{id:"sequence",icon:"⟡",label:"SequenceAI",desc:"Generate sequences",c:"#f0a500"}].map(h=><div key={h.id} onClick={()=>setView(h.id)} className="box" style={{cursor:"pointer",transition:"all .18s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=h.c+"50";e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.07)";e.currentTarget.style.transform="none";}}><div style={{fontSize:20,marginBottom:10,color:h.c}}>{h.icon}</div><div style={{fontSize:13,fontWeight:500,marginBottom:4}}>{h.label}</div><div style={{fontSize:11,color:"#5a5850",lineHeight:1.5}}>{h.desc}</div></div>)}</div>
            </div>
          )}

          {view==="accounts"&&(
            <div className="fade">
              <div className="between mb24"><div><div className="eyebrow">SAVED ACCOUNTS</div><h2 className="serif" style={{fontSize:26,fontWeight:400,letterSpacing:"-.5px"}}>{accounts.length} Account{accounts.length!==1?"s":""}</h2></div><button onClick={()=>{setCo({name:"",industry:"",website:""});setCoIntel(null);setProspects([]);setActivePi(null);setAcctStatus("researching");setAcctNotes("");setView("research");setResTab("company");}} style={{padding:"7px 14px",borderRadius:7,background:"#f0a500",border:"none",color:"#0a0a08",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit",letterSpacing:".5px"}}>+ NEW ACCOUNT</button></div>
              {accounts.length===0&&<div style={{textAlign:"center",padding:"56px 20px",color:"#5a5850"}}><div style={{fontSize:36,marginBottom:14,opacity:.3}}>⊞</div><p style={{fontSize:13,marginBottom:16}}>No accounts yet.</p><button onClick={()=>setView("research")} style={{padding:"9px 20px",borderRadius:7,background:"rgba(240,165,0,.12)",border:"1px solid rgba(240,165,0,.28)",color:"#f0a500",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Research First Account</button></div>}
              {accounts.length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:12}}>{accounts.map(a=>{const st=STATUSES.find(s=>s.id===a.status)||STATUSES[0];const np=a.prospects?.length||0;const ni=a.prospects?.filter(p=>p.intel).length||0;const ns=a.prospects?.filter(p=>p.sequence).length||0;return(<div key={a.id} className="box" style={{cursor:"pointer",transition:"border-color .18s"}} onClick={()=>loadAcct(a)} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(240,165,0,.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.07)"}><div className="between mb10"><div style={{flex:1,minWidth:0}}><div className="serif" style={{fontSize:16,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.co?.name}</div><div style={{fontSize:11,color:"#5a5850"}}>{a.co?.industry||"—"}</div></div><button onClick={e=>delAcct(a.id,e)} style={{background:"none",border:"none",color:"#5a5850",cursor:"pointer",fontSize:13,padding:"2px 5px",flexShrink:0}}>✕</button></div><div className="g4 mb10"><div className="stat-box"><div style={{fontSize:15,fontWeight:600,color:a.coIntel?.timingScore==="Hot"?"#f87171":a.coIntel?.timingScore==="Warm"?"#f0a500":"#5a5850",marginBottom:2}}>{a.coIntel?.timingScore||"—"}</div><div style={{fontSize:8,color:"#5a5850",textTransform:"uppercase",letterSpacing:"1.5px"}}>TIMING</div></div><div className="stat-box"><div style={{fontSize:15,fontWeight:600,color:"#60a5fa",marginBottom:2}}>{np}</div><div style={{fontSize:8,color:"#5a5850",textTransform:"uppercase",letterSpacing:"1.5px"}}>PROSPECTS</div></div><div className="stat-box"><div style={{fontSize:15,fontWeight:600,color:"#4ade80",marginBottom:2}}>{ni}</div><div style={{fontSize:8,color:"#5a5850",textTransform:"uppercase",letterSpacing:"1.5px"}}>PROFILED</div></div><div className="stat-box"><div style={{fontSize:15,fontWeight:600,color:"#f0a500",marginBottom:2}}>{ns}</div><div style={{fontSize:8,color:"#5a5850",textTransform:"uppercase",letterSpacing:"1.5px"}}>IN SEQ</div></div></div><div className="row gap8 mb8"><select value={a.status||"researching"} onClick={e=>e.stopPropagation()} onChange={e=>{e.stopPropagation();patchAcct(a.id,"status",e.target.value);}} style={{flex:1,padding:"5px 8px",borderRadius:6,background:`${st.color}12`,border:`1px solid ${st.color}30`,color:st.color,fontSize:11,fontFamily:"inherit"}}>{STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select><span style={{fontSize:10,color:"#5a5850",flexShrink:0}}>{fmt(a.updatedAt)}</span></div><textarea value={a.notes||""} onClick={e=>e.stopPropagation()} onChange={e=>{e.stopPropagation();patchAcct(a.id,"notes",e.target.value);}} placeholder="Notes..." rows={2} style={{width:"100%",padding:"6px 9px",borderRadius:6,background:"rgba(0,0,0,.2)",border:"1px solid rgba(255,255,255,.07)",color:"#5a5850",fontSize:11,fontFamily:"inherit",resize:"none",lineHeight:1.5}}/><div style={{marginTop:9,fontSize:11,color:"#f0a500",letterSpacing:".5px"}}>OPEN & RESUME →</div></div>);})}</div>}
            </div>
          )}

          {view==="research"&&(
            <div className="fade">
              {resTab==="company"&&(
                <>
                  <div className="between mb20"><div><div className="eyebrow">RESEARCH HUB</div><h2 className="serif" style={{fontSize:24,fontWeight:400,letterSpacing:"-.5px"}}>Company Research</h2>{profileDone&&<p style={{fontSize:11,color:"#5a5850",marginTop:4}}>Tailored to: &quot;{seller.problemSolved.slice(0,50)}...&quot;</p>}</div>{co.name&&<div className="row gap8"><select value={acctStatus} onChange={e=>setAcctStatus(e.target.value)} style={{padding:"5px 8px",borderRadius:6,background:"var(--surf)",border:"1px solid var(--bd)",color:"var(--tx)",fontSize:11,fontFamily:"inherit"}}>{STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select><AB onClick={save} color="#4ade80" sm>{savedMsg||"Save"}</AB></div>}</div>
                  {profileDone&&<div className="am-chip row gap10 mb14"><span style={{fontSize:11,color:"#f0a500"}}>◆</span><span style={{fontSize:11,color:"#f0a500",flex:1}}>{seller.problemSolved.slice(0,65)}{seller.problemSolved.length>65?"...":""}</span><button onClick={()=>setShowProfile(true)} style={{fontSize:9,color:"#5a5850",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",letterSpacing:"1.5px"}}>EDIT</button></div>}
                  <div className="box mb12"><div className="lbl">TARGET ACCOUNT</div><div className="g3"><Fld label="Company *" value={co.name} onChange={e=>setCo(c=>({...c,name:e.target.value}))} ph="Acme Corp"/><Fld label="Industry" value={co.industry} onChange={e=>setCo(c=>({...c,industry:e.target.value}))} ph="SaaS / FinTech"/><Fld label="Website" value={co.website} onChange={e=>setCo(c=>({...c,website:e.target.value}))} ph="acme.com"/></div></div>
                  <div className="box mb12" style={{borderColor:"rgba(240,165,0,.3)"}}>
                    <div className="lbl" style={{color:"#f0a500"}}>AUTO RESEARCH — LIVE WEB</div>
                    <p style={{fontSize:11,color:"#5a5850",marginBottom:12,lineHeight:1.6}}>Claude will search the live web and return structured intel automatically. No copy-paste needed.</p>
                    <button onClick={autoResearchCo} disabled={autoResearchingCo||!co.name||!profileDone} style={{width:"100%",padding:"11px",borderRadius:8,background:autoResearchingCo||!co.name?"rgba(255,255,255,.04)":"linear-gradient(135deg,rgba(240,165,0,.2),rgba(240,165,0,.1))",border:"1px solid rgba(240,165,0,.4)",color:autoResearchingCo||!co.name?"#5a5850":"#f0a500",fontSize:12,fontWeight:500,cursor:autoResearchingCo||!co.name?"not-allowed":"pointer",fontFamily:"inherit",letterSpacing:".5px",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                      {autoResearchingCo?<><span className="spin"/>SEARCHING THE WEB...</>:"⚡ AUTO RESEARCH THE WEB"}
                    </button>
                  </div>
                  <div className="box mb12"><div className="lbl">STEP 1 — GENERATE QUERY</div><AB onClick={getCoQ} loading={loadingCQ} disabled={loadingCQ||!co.name||!profileDone} color="#60a5fa">{loadingCQ?"Generating...":"Generate Company Query"}</AB>{coQuery&&<QBox query={coQuery} copied={cqCopied} onCopy={()=>{navigator.clipboard.writeText(coQuery);setCqCopied(true);setTimeout(()=>setCqCopied(false),2000)}} color="#60a5fa"/>}</div>
                  <div className="box mb12"><div className="lbl">INDUSTRY TRENDS QUERY</div><p style={{fontSize:11,color:"#5a5850",marginBottom:10,lineHeight:1.6}}>Search for macro trends in {co.industry||seller.sellerIndustry||"their industry"}.</p><AB onClick={getTrendQ} loading={loadingTQ} disabled={loadingTQ||!co.name||!profileDone} color="#c084fc">{loadingTQ?"Generating...":"Get Industry Trends Query"}</AB>{trendQuery&&<QBox query={trendQuery} copied={tqCopied} onCopy={()=>{navigator.clipboard.writeText(trendQuery);setTqCopied(true);setTimeout(()=>setTqCopied(false),2000)}} color="#c084fc"/>}</div>
                  <div className="box mb12"><div className="lbl">STEP 2 — PASTE & ANALYZE</div><textarea className="paste" value={coPasted} onChange={e=>setCoPasted(e.target.value)} placeholder="Paste company research — news, funding, job postings, product launches..." rows={5}/>{coPasted&&<div style={{fontSize:10,color:"#4ade80",marginTop:3}}>✓ {coPasted.split(/\s+/).filter(Boolean).length} words</div>}{err&&<div className="err">{err}</div>}<AB onClick={analyzeComp} loading={analyzingCo} disabled={analyzingCo||!coPasted.trim()} color="#60a5fa" style={{marginTop:10}}>{analyzingCo?"Analyzing...":"Analyze Change Agents"}</AB></div>
                  {co.name&&<div className="box mb12"><div className="lbl">ACCOUNT NOTES</div><textarea className="ta" value={acctNotes} onChange={e=>setAcctNotes(e.target.value)} placeholder="Internal notes..." rows={2}/></div>}
                  {coIntel&&(
                    <div className="fade">
                      <div className="row gap12 mb12">
                        <div className="box" style={{flex:1}}><div className="lbl" style={{color:"#60a5fa"}}>SNAPSHOT</div><p style={{fontSize:13,lineHeight:1.8,color:"#bfdbfe",marginBottom:9}}>{coIntel.snapshot}</p><p style={{fontSize:12,color:"#f0a500",fontStyle:"italic",margin:0}}>◆ {coIntel.buyingSignals}</p></div>
                        <div className="box" style={{border:`2px solid ${coIntel.timingScore==="Hot"?"#f87171":coIntel.timingScore==="Warm"?"#f0a500":"#5a5850"}`,textAlign:"center",minWidth:108,padding:"14px 12px"}}><div style={{fontSize:9,color:"#5a5850",textTransform:"uppercase",letterSpacing:"2px",marginBottom:5}}>TIMING</div><div className="serif" style={{fontSize:22,color:coIntel.timingScore==="Hot"?"#f87171":coIntel.timingScore==="Warm"?"#f0a500":"#5a5850",marginBottom:4}}>{coIntel.timingScore}</div><div style={{fontSize:10,color:"#5a5850",lineHeight:1.5}}>{coIntel.timingReason}</div></div>
                      </div>
                      <div className="g2 mb14">{CHANGE_AGENTS.map(ca=>{const items=coIntel[ca.key]||[];if(!items.length)return null;return <ICard key={ca.key} ca={ca} items={items}/>;})}</div>
                      <button onClick={()=>setResTab("prospects")} style={{width:"100%",padding:"11px",borderRadius:8,background:"#60a5fa",border:"none",color:"#fff",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit",letterSpacing:".5px"}}>ADD PROSPECTS →</button>
                    </div>
                  )}
                </>
              )}
              {resTab==="prospects"&&(
                <>
                  <div style={{marginBottom:22}}><div className="eyebrow">RESEARCH HUB</div><h2 className="serif" style={{fontSize:24,fontWeight:400,letterSpacing:"-.5px"}}>Prospect Profiles</h2><p style={{fontSize:11,color:"#5a5850",marginTop:4}}>Stakeholders at {co.name||"target account"}</p></div>
                  <div className="row gap8 mb14 wrap-row">
                    {prospects.map((p,i)=><button key={i} onClick={()=>setActivePi(i)} className={`ppill${activePi===i?" on":""}`}>{p.firstName} {p.lastName}{p.intel&&<span style={{color:"#4ade80",fontSize:9}}>✓</span>}</button>)}
                    <button onClick={()=>setAddingP(true)} className="ppill">+ Add</button>
                  </div>
                  {addingP&&(
                    <div className="box mb12" style={{borderColor:"rgba(240,165,0,.2)"}}>
                      <div className="lbl" style={{color:"#f0a500"}}>NEW PROSPECT</div>
                      <div className="g2 mb10"><Fld label="First Name *" value={newP.firstName} onChange={e=>setNewP(p=>({...p,firstName:e.target.value}))} ph="Sarah"/><Fld label="Last Name" value={newP.lastName} onChange={e=>setNewP(p=>({...p,lastName:e.target.value}))} ph="Johnson"/><Fld label="Title *" value={newP.title} onChange={e=>setNewP(p=>({...p,title:e.target.value}))} ph="VP of Sales"/><Fld label="LinkedIn" value={newP.linkedin} onChange={e=>setNewP(p=>({...p,linkedin:e.target.value}))} ph="linkedin.com/in/..."/></div>
                      <div className="g2 mb10"><div><div className="fl">Sequence Type</div><select value={newP.seqTypeId} onChange={e=>setNewP(p=>({...p,seqTypeId:e.target.value}))} style={{width:"100%",padding:"7px 9px",borderRadius:6,background:"var(--surf)",border:"1px solid var(--bd)",color:"var(--tx)",fontSize:12,fontFamily:"inherit"}}>{SEQ_TYPES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}</select></div><div><div className="fl">Buyer Persona</div><select value={newP.personaId} onChange={e=>setNewP(p=>({...p,personaId:e.target.value}))} style={{width:"100%",padding:"7px 9px",borderRadius:6,background:"var(--surf)",border:"1px solid var(--bd)",color:"var(--tx)",fontSize:12,fontFamily:"inherit"}}>{PERSONAS.map(p=><option key={p.id} value={p.id}>{p.icon} {p.label} — {p.sub}</option>)}</select></div></div>
                      {err&&<div className="err">{err}</div>}
                      <div className="row gap8"><AB onClick={addProspect} color="#f0a500" sm>Add Prospect</AB><AB onClick={()=>{setAddingP(false);setErr("");}} color="#5a5850" sm>Cancel</AB></div>
                    </div>
                  )}
                  {ap&&(
                    <div className="fade" key={activePi}>
                      <div className="row gap12 mb14"><div className="av" style={{width:38,height:38,fontSize:14,background:`hsl(${(activePi||0)*55+180},50%,35%)`}}>{ap.firstName[0]}{ap.lastName?.[0]||""}</div><div><div className="serif" style={{fontSize:18}}>{ap.firstName} {ap.lastName}</div><div style={{fontSize:11,color:"#5a5850"}}>{ap.title} · {co.name}</div></div></div>
                      <div className="box mb10" style={{borderColor:"rgba(240,165,0,.3)"}}>
                        <div className="lbl" style={{color:"#f0a500"}}>AUTO RESEARCH — LIVE WEB</div>
                        <p style={{fontSize:11,color:"#5a5850",marginBottom:12,lineHeight:1.6}}>Claude will search the live web for {ap.firstName} {ap.lastName} and return their intel automatically.</p>
                        <button onClick={()=>autoResearchPr(activePi)} disabled={ap.analyzing||!profileDone} style={{width:"100%",padding:"11px",borderRadius:8,background:ap.analyzing?"rgba(255,255,255,.04)":"linear-gradient(135deg,rgba(240,165,0,.2),rgba(240,165,0,.1))",border:"1px solid rgba(240,165,0,.4)",color:ap.analyzing?"#5a5850":"#f0a500",fontSize:12,fontWeight:500,cursor:ap.analyzing?"not-allowed":"pointer",fontFamily:"inherit",letterSpacing:".5px",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                          {ap.analyzing?<><span className="spin"/>SEARCHING THE WEB...</>:"⚡ AUTO RESEARCH THE WEB"}
                        </button>
                      </div>
                      <div className="box mb10"><div className="lbl">STEP 1 — RESEARCH QUERY</div><AB onClick={()=>getPrQ(activePi)} loading={ap.loadingQ} disabled={ap.loadingQ} color="#60a5fa">{ap.loadingQ?"Generating...":"Generate Prospect Query"}</AB>{ap.query&&<QBox query={ap.query} copied={copied==="pq"+activePi} onCopy={()=>cp(ap.query,"pq"+activePi)} color="#60a5fa"/>}</div>
                      <div className="box mb10"><div className="lbl">STEP 2 — PASTE & ANALYZE</div><textarea className="paste" value={ap.pasted} onChange={e=>upP(activePi,"pasted",e.target.value)} placeholder={`Paste findings about ${ap.firstName}...`} rows={4}/>{ap.pasted&&<div style={{fontSize:10,color:"#4ade80",marginTop:3}}>✓ {ap.pasted.split(/\s+/).filter(Boolean).length} words</div>}{err&&<div className="err">{err}</div>}<AB onClick={()=>analyzePr(activePi)} loading={ap.analyzing} disabled={ap.analyzing||!ap.pasted.trim()} color="#60a5fa" style={{marginTop:10}}>{ap.analyzing?"Analyzing...":"Analyze Prospect"}</AB></div>
                      {ap.intel&&(
                        <div className="fade">
                          <div className="row gap12 mb12">
                            <div className="box" style={{flex:1}}><div className="lbl" style={{color:"#f0a500"}}>OUTREACH ANGLE</div><p style={{fontSize:13,lineHeight:1.8,color:"#fde68a",marginBottom:9}}>{ap.intel.angle}</p><div style={{padding:"8px 11px",background:"rgba(240,165,0,.07)",border:"1px solid rgba(240,165,0,.28)",borderRadius:6}}><div style={{fontSize:9,color:"#f0a500",textTransform:"uppercase",letterSpacing:"2px",marginBottom:4}}>OPENER</div><p style={{fontSize:12,margin:0,fontStyle:"italic",lineHeight:1.7}}>&quot;{ap.intel.opener}&quot;</p></div></div>
                            <div className="box" style={{border:`2px solid ${ap.intel.warmth==="Champion"?"#4ade80":ap.intel.warmth==="Influencer"?"#60a5fa":ap.intel.warmth==="Gatekeeper"?"#f87171":"#5a5850"}`,textAlign:"center",minWidth:96,padding:"12px 10px"}}><div style={{fontSize:9,color:"#5a5850",textTransform:"uppercase",letterSpacing:"2px",marginBottom:5}}>ROLE</div><div style={{fontSize:12,fontWeight:500,color:ap.intel.warmth==="Champion"?"#4ade80":ap.intel.warmth==="Influencer"?"#60a5fa":ap.intel.warmth==="Gatekeeper"?"#f87171":"#5a5850"}}>{ap.intel.warmth}</div></div>
                          </div>
                          <div className="g2 mb14">{PR_SIGNALS.map(sig=>{const items=ap.intel[sig.key]||[];if(!items.length)return null;return <ICard key={sig.key} ca={sig} items={items}/>;})}</div>
                          <div className="row gap10">
                            <button onClick={loadIntel} style={{flex:1,padding:"11px",borderRadius:8,background:"rgba(240,165,0,.12)",border:"1px solid rgba(240,165,0,.28)",color:"#f0a500",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit",letterSpacing:".5px"}}>USE INTEL → BUILD SEQUENCE</button>
                            {!ap.sequence&&<button onClick={()=>buildSeq(activePi)} disabled={ap.generating} style={{flex:1,padding:"11px",borderRadius:8,background:ap.generating?"rgba(255,255,255,.04)":"#f0a500",border:"none",color:ap.generating?"#5a5850":"#0a0a08",fontSize:12,fontWeight:500,cursor:ap.generating?"not-allowed":"pointer",fontFamily:"inherit",letterSpacing:".5px",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{ap.generating?<><span className="spin"/>GENERATING...</>:"GENERATE & TRACK"}</button>}
                            {ap.sequence&&<button onClick={()=>{setTrackerPi(activePi);setView("tracker");}} style={{flex:1,padding:"11px",borderRadius:8,background:"rgba(74,222,128,.1)",border:"1px solid rgba(74,222,128,.4)",color:"#4ade80",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit",letterSpacing:".5px"}}>OPEN IN TRACKER →</button>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {!ap&&!addingP&&<div style={{textAlign:"center",padding:"40px 20px",color:"#5a5850"}}><div style={{fontSize:32,marginBottom:12,opacity:.3}}>◎</div><p style={{fontSize:13,marginBottom:14}}>No prospects yet.</p><button onClick={()=>setAddingP(true)} style={{padding:"9px 18px",borderRadius:7,background:"rgba(240,165,0,.12)",border:"1px solid rgba(240,165,0,.28)",color:"#f0a500",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>+ ADD FIRST PROSPECT</button></div>}
                </>
              )}
              {resTab==="brief"&&(
                <>
                  <div style={{marginBottom:22}}><div className="eyebrow">RESEARCH HUB</div><h2 className="serif" style={{fontSize:24,fontWeight:400,letterSpacing:"-.5px"}}>Intel Brief</h2><p style={{fontSize:11,color:"#5a5850",marginTop:4}}>{co.name} · {prospects.filter(p=>p.intel).length} prospect(s)</p></div>
                  <div className="box mb12">
                    {coIntel&&<><div className="between mb10"><div className="serif" style={{fontSize:16}}>{co.name}</div><span className="tag" style={{background:coIntel.timingScore==="Hot"?"rgba(248,113,113,.14)":"rgba(240,165,0,.14)",color:coIntel.timingScore==="Hot"?"#f87171":"#f0a500"}}>{coIntel.timingScore} Timing</span></div><p style={{fontSize:12,color:"#5a5850",lineHeight:1.75,marginBottom:7}}>{coIntel.snapshot}</p><p style={{fontSize:12,color:"#f0a500",fontStyle:"italic",marginBottom:16}}>◆ {coIntel.buyingSignals}</p><div className="g3 mb16">{CHANGE_AGENTS.map(ca=>{const items=coIntel[ca.key]||[];if(!items.length)return null;return <div key={ca.key} style={{background:"rgba(0,0,0,.3)",borderRadius:6,padding:"9px 11px"}}><div style={{fontSize:9,color:ca.color,textTransform:"uppercase",letterSpacing:"2px",marginBottom:5}}>{ca.icon} {ca.label}</div>{items.slice(0,2).map((it,i)=><div key={i} style={{fontSize:11,color:"#5a5850",lineHeight:1.5,marginBottom:2}}>· {it}</div>)}</div>;})}</div></>}
                    <div className="divider" style={{margin:"4px 0 16px"}}/>
                    {prospects.filter(p=>p.intel).map((p,i,arr)=>(
                      <div key={i} style={{marginBottom:16,paddingBottom:16,borderBottom:i<arr.length-1?"1px solid #2a2924":"none"}}>
                        <div className="row gap10 mb8"><div className="av" style={{width:28,height:28,fontSize:11,background:`hsl(${i*55+180},50%,35%)`}}>{p.firstName[0]}{p.lastName?.[0]||""}</div><div><div className="serif" style={{fontSize:14}}>{p.firstName} {p.lastName}</div><div style={{fontSize:11,color:"#5a5850"}}>{p.title}</div></div><span className="tag" style={{marginLeft:"auto",background:p.intel.warmth==="Champion"?"rgba(74,222,128,.1)":"rgba(96,165,250,.1)",color:p.intel.warmth==="Champion"?"#4ade80":"#60a5fa"}}>{p.intel.warmth}</span></div>
                        <div style={{background:"rgba(240,165,0,.06)",border:"1px solid rgba(240,165,0,.28)",borderRadius:6,padding:"9px 11px"}}><p style={{fontSize:12,margin:"0 0 4px",lineHeight:1.65}}>{p.intel.angle}</p><p style={{fontSize:11,color:"#f0a500",margin:0,fontStyle:"italic"}}>Opener: &quot;{p.intel.opener}&quot;</p></div>
                      </div>
                    ))}
                  </div>
                  <div className="row gap10">
                    <button onClick={()=>{const t=`INTEL BRIEF:${co.name}\n\n`+(coIntel?`${coIntel.snapshot}\n${coIntel.buyingSignals}\n\n`:"")+prospects.filter(p=>p.intel).map(p=>`${p.firstName} ${p.lastName}·${p.title}\n${p.intel.angle}\nOpener:"${p.intel.opener}"\n`).join("\n---\n\n");cp(t,"brief");}} style={{flex:1,padding:"11px",borderRadius:8,background:copied==="brief"?"rgba(74,222,128,.1)":"var(--surf)",border:copied==="brief"?"1px solid rgba(74,222,128,.4)":"1px solid var(--bd)",color:copied==="brief"?"#4ade80":"#5a5850",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{copied==="brief"?"COPIED":"COPY FULL BRIEF"}</button>
                    <button onClick={loadIntel} style={{padding:"11px 18px",borderRadius:8,background:"#f0a500",border:"none",color:"#0a0a08",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit",letterSpacing:".5px"}}>BUILD SEQUENCE</button>
                  </div>
                </>
              )}
            </div>
          )}

          {view==="tracker"&&(
            <div className="fade">
              <div style={{marginBottom:22}}><div className="eyebrow">SEQUENCE TRACKER</div><h2 className="serif" style={{fontSize:24,fontWeight:400,letterSpacing:"-.5px"}}>{tp?`${tp.firstName} ${tp.lastName}`:"Select a Prospect"}</h2>{tp&&<p style={{fontSize:11,color:"#5a5850",marginTop:4}}>{tp.title} · {co.name} · {(SEQ_TYPES.find(t=>t.id===tp.seqTypeId)||SEQ_TYPES[0]).label} · {(PERSONAS.find(p=>p.id===tp.personaId)||PERSONAS[0]).label}</p>}</div>
              {prospects.length===0&&<div style={{textAlign:"center",padding:"48px 20px",color:"#5a5850"}}><div style={{fontSize:32,opacity:.3,marginBottom:12}}>▤</div><p style={{fontSize:13,marginBottom:14}}>Research prospects first, then generate their sequences here.</p><button onClick={()=>setView("research")} style={{padding:"9px 18px",borderRadius:7,background:"rgba(240,165,0,.12)",border:"1px solid rgba(240,165,0,.28)",color:"#f0a500",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Go to Research</button></div>}
              {prospects.length>0&&(
                <div className="row gap16" style={{alignItems:"flex-start"}}>
                  <div style={{width:180,flexShrink:0}}>
                    {prospects.map((p,i)=>(
                      <div key={i} className={`tp${trackerPi===i?" on":""}`} onClick={()=>setTrackerPi(i)}>
                        <div className="row gap8 mb8"><div className="av" style={{width:28,height:28,fontSize:11,background:`hsl(${i*55+180},50%,35%)`}}>{p.firstName[0]}{p.lastName?.[0]||""}</div><div style={{minWidth:0}}><div style={{fontSize:12,fontWeight:500,color:trackerPi===i?"#f0a500":"#e8e3d8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.firstName} {p.lastName}</div><div style={{fontSize:10,color:"#5a5850",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title}</div></div></div>
                        {p.sequence?<><div className="between mb5"><span style={{fontSize:10,color:"#5a5850"}}>Progress</span><span style={{fontSize:10,color:"#4ade80",fontWeight:500}}>{doneCount(p)}/{totalT(p)}</span></div><div className="prog-bg"><div className="prog-fill" style={{width:`${(doneCount(p)/totalT(p))*100}%`}}/></div></>:<div style={{fontSize:10,color:"#5a5850",fontStyle:"italic"}}>No sequence yet</div>}
                      </div>
                    ))}
                  </div>
                  <div style={{flex:1}}>
                    {tp===null&&<div style={{textAlign:"center",padding:"40px 20px",color:"#5a5850",fontSize:13}}>Select a prospect to view their sequence.</div>}
                    {tp&&!tp.sequence&&<div className="box" style={{textAlign:"center",padding:"24px"}}><div style={{fontSize:28,marginBottom:12,opacity:.4}}>⟡</div><p style={{fontSize:13,color:"#5a5850",marginBottom:16,lineHeight:1.7}}>No sequence for {tp.firstName} yet.{tp.intel?" Ready to generate.":""}</p>{tp.intel&&<button onClick={()=>buildSeq(trackerPi)} disabled={tp.generating} style={{padding:"10px 22px",borderRadius:8,background:tp.generating?"rgba(255,255,255,.04)":"#f0a500",border:"none",color:tp.generating?"#5a5850":"#0a0a08",fontSize:12,fontWeight:500,cursor:tp.generating?"not-allowed":"pointer",fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:8}}>{tp.generating?<><span className="spin"/>GENERATING...</>:"GENERATE SEQUENCE"}</button>}{!tp.intel&&<button onClick={()=>{setActivePi(trackerPi);setView("research");setResTab("prospects");}} style={{padding:"10px 22px",borderRadius:8,background:"rgba(240,165,0,.12)",border:"1px solid rgba(240,165,0,.28)",color:"#f0a500",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>RESEARCH THIS PROSPECT</button>}</div>}
                    {tp&&tp.sequence&&(()=>{
                      const st=SEQ_TYPES.find(t=>t.id===tp.seqTypeId)||SEQ_TYPES[0];
                      const nxt=nextT(tp);
                      return(<>
                        {nxt&&(
                          <div className="next-card mb14">
                            <div className="between mb12"><div style={{fontSize:9,color:"#f0a500",letterSpacing:"3px",textTransform:"uppercase"}}>▶ NEXT TOUCH</div><div style={{fontSize:11,color:"#f0a500"}}>{nxt.daysFromPrev===0?"Send today":`${nxt.daysFromPrev} day${nxt.daysFromPrev!==1?"s":""} after previous`}</div></div>
                            <div className="row gap12">
                              <div style={{fontSize:22}}>{nxt.touch.icon}</div>
                              <div style={{flex:1}}>
                                <div className="row gap8 mb8"><span style={{fontSize:13,fontWeight:500}}>{nxt.touch.label}</span><span style={{fontSize:10,color:"#5a5850"}}>{nxt.touch.dl} · {nxt.touch.ch}</span></div>
                                {nxt.content.subject&&<div style={{fontSize:12,color:"#f0a500",marginBottom:7,fontWeight:500}}>Subject: {nxt.content.subject}</div>}
                                <div className="msg-body mb10">{nxt.content.body}</div>
                                <div className="row gap8"><button className={`cpbtn${copied==="next_b"?" ok":""}`} onClick={()=>cp(nxt.content.body,"next_b")}>{copied==="next_b"?"COPIED":"COPY MESSAGE"}</button>{nxt.content.subject&&<button className={`cpbtn${copied==="next_a"?" ok":""}`} onClick={()=>cp(`Subject:${nxt.content.subject}\n\n${nxt.content.body}`,"next_a")}>{copied==="next_a"?"COPIED":"COPY BOTH"}</button>}<button onClick={()=>toggleTouch(trackerPi,nxt.touchId)} style={{marginLeft:"auto",padding:"6px 14px",borderRadius:7,background:"#4ade80",border:"none",color:"#0a0a08",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit",letterSpacing:".5px"}}>MARK DONE</button></div>
                              </div>
                            </div>
                          </div>
                        )}
                        {!nxt&&<div style={{background:"rgba(74,222,128,.1)",border:"1px solid rgba(74,222,128,.4)",borderRadius:10,padding:"16px 18px",textAlign:"center",marginBottom:14}}><div style={{fontSize:22,marginBottom:8}}>🎉</div><div style={{fontSize:14,color:"#4ade80",fontWeight:500,marginBottom:4}}>All touches complete!</div><div style={{fontSize:12,color:"#5a5850"}}>Full {totalT(tp)}-touch sequence finished for {tp.firstName}.</div></div>}
                        <div className="box">
                          <div className="lbl">SEQUENCE TIMELINE</div>
                          {st.steps.map((sid,idx)=>{
                            const touch=TOUCHES.find(t=>t.id===sid);
                            const content=tp.sequence[sid];
                            const done=(tp.touchDone||{})[sid];
                            const isNext=nxt?.touchId===sid;
                            const date=(tp.touchDates||{})[sid];
                            const note=(tp.touchNotes||{})[sid]||"";
                            const outcome=(tp.touchOutcome||{})[sid]||"";
                            const cs=CH[touch.ch];
                            return(
                              <div key={sid} className="tl-item">
                                <div className="tl-spine"><div className={`cb${done?" done":""}`} onClick={()=>toggleTouch(trackerPi,sid)}>{done&&<span style={{color:"#0a0a08",fontSize:11,fontWeight:700}}>✓</span>}{!done&&isNext&&<span style={{color:"#f0a500",fontSize:10,animation:"pulse 1.5s infinite"}}>▶</span>}</div>{idx<st.steps.length-1&&<div className="tl-line" style={{background:done?"rgba(74,222,128,.4)":"#2a2924"}}/>}</div>
                                <div className="tl-body" style={{opacity:done?0.55:1}}>
                                  <div className="tl-hdr"><span style={{fontSize:14}}>{touch.icon}</span><span style={{fontSize:12,fontWeight:500,color:isNext?"#f0a500":done?"#4ade80":"#e8e3d8"}}>{touch.label}</span><span className="tag" style={{background:cs.bg,color:cs.tx,border:`1px solid ${cs.bd}`}}>{touch.dl}</span>{done&&date&&<span style={{fontSize:10,color:"#5a5850"}}>Done {fmt(date)}</span>}{isNext&&!done&&<span style={{fontSize:10,color:"#f0a500",animation:"pulse 1.5s infinite"}}>← NEXT</span>}</div>
                                  {(isNext||done)&&content&&<div className="mb8">{content.subject&&<div style={{fontSize:11,color:"#f0a500",marginBottom:5}}>Subject: {content.subject}</div>}<div style={{fontSize:12,color:done?"#5a5850":"#e8e3d8",lineHeight:1.75,whiteSpace:"pre-wrap",background:"rgba(0,0,0,.2)",border:"1px solid #2a2924",borderRadius:6,padding:"9px 11px",maxHeight:120,overflowY:"auto"}}>{content.body}</div>{!done&&<div className="row gap6" style={{marginTop:7}}><button className={`cpbtn${copied===sid+"_b"?" ok":""}`} onClick={()=>cp(content.body,sid+"_b")}>{copied===sid+"_b"?"✓":"Copy"}</button>{content.subject&&<button className={`cpbtn${copied===sid+"_a"?" ok":""}`} onClick={()=>cp(`Subject:${content.subject}\n\n${content.body}`,sid+"_a")}>{copied===sid+"_a"?"✓ Both":"Copy Both"}</button>}</div>}</div>}
                                  {done&&<div className="g2 gap8 mb8"><select value={outcome} onChange={e=>upP(trackerPi,"touchOutcome",{...(tp.touchOutcome||{}),[sid]:e.target.value})} style={{padding:"5px 8px",borderRadius:6,background:"var(--surf)",border:"1px solid var(--bd)",color:"#5a5850",fontSize:11,fontFamily:"inherit"}}><option value="">Outcome...</option><option>No response</option><option>Opened</option><option>Replied</option><option>Booked meeting</option><option>Not interested</option></select><input value={note} onChange={e=>upP(trackerPi,"touchNotes",{...(tp.touchNotes||{}),[sid]:e.target.value})} placeholder="Quick note..." style={{padding:"5px 8px",borderRadius:6,background:"var(--surf)",border:"1px solid var(--bd)",color:"#5a5850",fontSize:11,fontFamily:"inherit",width:"100%"}}/></div>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>);
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {view==="settings"&&(
            <div className="fade">
              <div style={{marginBottom:22}}><div className="eyebrow">SETTINGS</div><h2 className="serif" style={{fontSize:24,fontWeight:400,letterSpacing:"-.5px"}}>Configuration</h2><p style={{fontSize:11,color:"#5a5850",marginTop:4}}>Auto-research is powered by Claude — no extra key needed.</p></div>
              <div className="box mb12" style={{borderColor:"rgba(74,222,128,.3)"}}>
                <div className="lbl" style={{color:"#4ade80"}}>AUTO RESEARCH — ACTIVE</div>
                <p style={{fontSize:11,color:"#5a5850",lineHeight:1.7}}>Auto-research uses Claude with live web search. One-click research replaces manual copy-paste entirely. No configuration needed.</p>
              </div>
              <div className="box" style={{opacity:.5}}>
                <div className="lbl">ANTHROPIC API KEY</div>
                <p style={{fontSize:11,color:"#5a5850",lineHeight:1.7}}>The Claude API key is managed by this platform automatically.</p>
              </div>
            </div>
          )}

          {view==="sequence"&&(
            <div className="fade">
              {seqTab==="build"&&(
                <>
                  <div style={{marginBottom:22}}><div className="eyebrow">SEQUENCEAI</div><h2 className="serif" style={{fontSize:24,fontWeight:400,letterSpacing:"-.5px"}}>Build a Sequence</h2><p style={{fontSize:11,color:"#5a5850",marginTop:4}}>Select type and persona — every word adapts accordingly.</p></div>
                  <div className="g2 mb14"><div className="box" style={{borderColor:seqType.color+"30"}}><div className="lbl">SEQUENCE TYPE</div><select value={seqType.id} onChange={e=>setSeqType(SEQ_TYPES.find(t=>t.id===e.target.value))} style={{width:"100%",padding:"9px 10px",borderRadius:7,background:"rgba(255,255,255,.04)",border:`1px solid ${seqType.color}40`,color:"#e8e3d8",fontSize:13,fontFamily:"inherit",cursor:"pointer",marginBottom:9}}>{SEQ_TYPES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}</select><p style={{fontSize:11,color:"#5a5850",lineHeight:1.7,margin:0}}>{seqType.tone}</p></div><div className="box" style={{borderColor:persona.color+"30"}}><div className="lbl">BUYER PERSONA</div><select value={persona.id} onChange={e=>setPersona(PERSONAS.find(p=>p.id===e.target.value))} style={{width:"100%",padding:"9px 10px",borderRadius:7,background:"rgba(255,255,255,.04)",border:`1px solid ${persona.color}40`,color:"#e8e3d8",fontSize:13,fontFamily:"inherit",cursor:"pointer",marginBottom:9}}>{PERSONAS.map(p=><option key={p.id} value={p.id}>{p.icon} {p.label} — {p.sub}</option>)}</select><p style={{fontSize:11,color:"#5a5850",lineHeight:1.7,margin:0}}>{persona.tone.slice(0,100)}...</p></div></div>
                  <div className="box row gap6 mb14 wrap-row" style={{fontSize:11,color:"#5a5850"}}><span>Generating a</span><span style={{color:seqType.color,fontWeight:500}}>{seqType.label}</span><span>for an</span><span style={{color:persona.color,fontWeight:500}}>{persona.label}</span><span>({persona.sub})</span></div>
                  {coIntel&&<div style={{background:"rgba(74,222,128,.06)",border:"1px solid rgba(74,222,128,.4)",borderRadius:7,padding:"8px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:9}}><span style={{fontSize:11,color:"#4ade80"}}>✓ Intel loaded · {co.name} · {coIntel.timingScore} Timing</span><button onClick={loadIntel} style={{marginLeft:"auto",padding:"4px 10px",borderRadius:6,background:"rgba(74,222,128,.1)",border:"1px solid rgba(74,222,128,.4)",color:"#4ade80",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Re-apply</button></div>}
                  <div className="box mb12"><div className="lbl">PROSPECT</div><div className="g2"><Fld label="First Name *" value={seqForm.firstName} onChange={e=>setSeqForm(f=>({...f,firstName:e.target.value}))} ph="Sarah"/><Fld label="Last Name" value={seqForm.lastName} onChange={e=>setSeqForm(f=>({...f,lastName:e.target.value}))} ph="Johnson"/><Fld label="Company *" value={seqForm.company} onChange={e=>setSeqForm(f=>({...f,company:e.target.value}))} ph="Acme Corp"/><Fld label="Title" value={seqForm.title} onChange={e=>setSeqForm(f=>({...f,title:e.target.value}))} ph="VP of Sales"/><Fld label="Industry" value={seqForm.industry} onChange={e=>setSeqForm(f=>({...f,industry:e.target.value}))} ph="SaaS / FinTech"/></div></div>
                  <div className="box mb12"><div className="lbl">MESSAGING CONTEXT</div><div className="g2"><Fld label="Their Pain Point" value={seqForm.painPoint} onChange={e=>setSeqForm(f=>({...f,painPoint:e.target.value}))} ph="What keeps them up at night?" ta/><Fld label="Value Proposition" value={seqForm.valueprop} onChange={e=>setSeqForm(f=>({...f,valueprop:e.target.value}))} ph="How do you solve it?" ta/><Fld label="Social Proof" value={seqForm.socialProof} onChange={e=>setSeqForm(f=>({...f,socialProof:e.target.value}))} ph="Customer result or case study" ta/>{extCfg[seqType.id]&&<Fld label={extCfg[seqType.id].label} value={seqForm[extCfg[seqType.id].key]} onChange={e=>setSeqForm(f=>({...f,[extCfg[seqType.id].key]:e.target.value}))} ph={extCfg[seqType.id].ph} ta/>}</div></div>
                  <div className="box mb14"><div className="lbl">RESEARCH (OPTIONAL)</div><AB onClick={async()=>{if(!seqForm.company){setErr("Enter company.");return;}setErr("");setLoadingSQ(true);try{const d=await ai(Q_CO(seller),`${seqForm.firstName} ${seqForm.lastName} at ${seqForm.company}`);setSeqQuery(d.query);}catch(e){setErr(e?.message||"Failed.");}setLoadingSQ(false);}} loading={loadingSQ} disabled={loadingSQ||!seqForm.company} color="#f0a500" sm>{loadingSQ?"Generating...":"Get Research Query"}</AB>{seqQuery&&<QBox query={seqQuery} copied={sqCopied} onCopy={()=>{navigator.clipboard.writeText(seqQuery);setSqCopied(true);setTimeout(()=>setSqCopied(false),2000)}} color="#f0a500"/>}<textarea className="paste" value={seqIntel} onChange={e=>setSeqIntel(e.target.value)} placeholder="Paste research or leave blank..." rows={4} style={{marginTop:10}}/></div>
                  {err&&<div className="err mb12">{err}</div>}
                  <button className="gen-btn" disabled={generating} onClick={generateSeq}>{generating?<><span className="spin"/>GENERATING...</>:`GENERATE ${seqType.label.toUpperCase()} SEQUENCE`}</button>
                </>
              )}
              {seqTab==="results"&&generated&&(
                <>
                  <div className="mb20"><div className="eyebrow">SEQUENCE RESULTS</div><h2 className="serif" style={{fontSize:22,fontWeight:400,letterSpacing:"-.5px",marginBottom:8}}>{seqForm.firstName} {seqForm.lastName} · {seqType.label}</h2><div className="row gap8 wrap-row"><span className="tag" style={{background:`${seqType.color}12`,color:seqType.color,border:`1px solid ${seqType.color}30`}}>{seqType.icon} {seqType.label}</span><span className="tag" style={{background:`${persona.color}12`,color:persona.color,border:`1px solid ${persona.color}30`}}>{persona.icon} {persona.label}</span><span className="tag" style={{background:"var(--surf)",color:"var(--mt)"}}>{seqForm.company}</span></div></div>
                  <div className="row gap12" style={{alignItems:"flex-start"}}>
                    <div style={{width:172,flexShrink:0}}>
                      {(()=>{
                        const stepsOrder=seqType.steps;
                        return stepsOrder.map(sid=>{
                        const t=TOUCHES.find(x=>x.id===sid);if(!t)return null;
                        const isA=activeStep===sid;const cs=CH[t.ch];
                        return <button key={sid} onClick={()=>setActiveStep(sid)} className="step-btn" style={{background:isA?cs.bg:"transparent",borderColor:isA?cs.bd:"rgba(255,255,255,.07)"}}><span style={{fontSize:13}}>{t.icon}</span><div><div style={{fontSize:9,color:isA?cs.tx:"#5a5850",textTransform:"uppercase",letterSpacing:"1px"}}>{t.dl}</div><div style={{fontSize:11,fontWeight:isA?500:400,color:isA?"#e8e3d8":"#5a5850"}}>{t.label}</div></div></button>;
                      });})()}
                    </div>
                    {(()=>{
                      const t=TOUCHES.find(x=>x.id===activeStep);const c=generated[activeStep];
                      const sl=seqType.steps;
                      const idx=sl.indexOf(activeStep);
                      if(!t||!c)return null;const cs=CH[t.ch];
                      return(
                        <div style={{flex:1}}>
                          <div className="box mb10">
                            <div className="between mb14"><div className="row gap10"><span style={{fontSize:20}}>{t.icon}</span><div><div style={{fontSize:9,color:"#5a5850",textTransform:"uppercase",letterSpacing:"2px"}}>{t.dl} · {t.ch}</div><div className="serif" style={{fontSize:15}}>{t.label}</div></div></div><span className="tag" style={{background:cs.bg,color:cs.tx,border:`1px solid ${cs.bd}`}}>{t.ch}</span></div>
                            {c.subject&&<div className="mb10"><div className="lbl">SUBJECT</div><div style={{padding:"8px 11px",background:"var(--amdim)",border:"1px solid var(--ambdr)",borderRadius:6,fontSize:13,fontWeight:500,color:"#f0a500"}}>{c.subject}</div></div>}
                            <div className="mb14"><div className="lbl">MESSAGE</div><div style={{padding:"13px",background:"rgba(0,0,0,.25)",border:"1px solid rgba(255,255,255,.07)",borderRadius:7,fontSize:13,lineHeight:1.85,whiteSpace:"pre-wrap",color:"#e8e3d8"}}>{c.body}</div></div>
                            <div className="row gap6">{c.subject&&<button className={`cpbtn${copied===activeStep+"_s"?" ok":""}`} onClick={()=>cp(c.subject,activeStep+"_s")}>{copied===activeStep+"_s"?"COPIED":"COPY SUBJECT"}</button>}<button className={`cpbtn pri${copied===activeStep+"_b"?" ok":""}`} onClick={()=>cp(c.body,activeStep+"_b")}>{copied===activeStep+"_b"?"COPIED":"COPY MESSAGE"}</button><button className={`cpbtn${copied===activeStep+"_a"?" ok":""}`} onClick={()=>cp(`Subject:${c.subject||""}\n\n${c.body}`,activeStep+"_a")}>{copied===activeStep+"_a"?"COPIED":"COPY BOTH"}</button></div>
                          </div>
                          <div className="between"><button disabled={idx===0} onClick={()=>setActiveStep(sl[idx-1])} style={{padding:"6px 12px",borderRadius:7,background:"transparent",border:"1px solid rgba(255,255,255,.07)",color:idx===0?"#2a2924":"#5a5850",cursor:idx===0?"not-allowed":"pointer",fontFamily:"inherit",fontSize:11}}>← PREV</button><span style={{fontSize:10,color:"#5a5850",letterSpacing:"1px"}}>{idx+1} / {sl.length}</span><button disabled={idx===sl.length-1} onClick={()=>setActiveStep(sl[idx+1])} style={{padding:"6px 12px",borderRadius:7,background:idx===sl.length-1?"transparent":"#f0a500",border:idx===sl.length-1?"1px solid rgba(255,255,255,.07)":"none",color:idx===sl.length-1?"#2a2924":"#0a0a08",cursor:idx===sl.length-1?"not-allowed":"pointer",fontFamily:"inherit",fontSize:11,fontWeight:500}}>NEXT →</button></div>
                        </div>
                      );
                    })()}
                  </div>
                  <button onClick={()=>{setSeqTab("build");setGenerated(null);}} style={{marginTop:16,padding:"6px 12px",borderRadius:7,background:"transparent",border:"1px solid rgba(255,255,255,.07)",color:"#5a5850",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>+ NEW SEQUENCE</button>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
