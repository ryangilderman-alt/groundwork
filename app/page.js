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
const INDUSTRY_TEMPLATES = ["SaaS","FinTech","HR Tech","Sales Tech","Healthcare","Manufacturing","Retail","Real Estate","Legal","Insurance","Media","Education"];

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
  const [humanizingStep,setHumanizingStep]=useState(null);
  const [bobiTab,setBobiTab]=useState("accounts");
  const [bobiStageFilter,setBobiStageFilter]=useState("all");
  const [bobiSearch,setBobiSearch]=useState("");
  const [bobiDetailId,setBobiDetailId]=useState(null);

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

  const humanizeStep=async(sid)=>{
    const c=generated[sid];if(!c?.body){setErr("No message to humanize.");return;}
    setErr("");setHumanizingStep(sid);
    try{
      const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1024,system:"Rewrite the following sales message to sound more natural and human, less templated or robotic. Keep the same intent and length. If a subject line is provided, return JSON: {\"subject\":\"...\",\"body\":\"...\"}. Otherwise return JSON: {\"body\":\"...\"}. Return only that JSON, no other text.",messages:[{role:"user",content:(c.subject?`Subject: ${c.subject}\n\n`:"")+c.body}]})});
      const d=await r.json();
      if(!r.ok||d.error) throw new Error(d.error?.message||d.message||"Humanize failed");
      const t=(d.content||[]).map(b=>b.text||"").join("");
      const out=parseJsonFromText(t);
      setGenerated(prev=>({...prev,[sid]:{subject:out.subject??prev[sid]?.subject??"",body:out.body||prev[sid]?.body||""}}));
    }catch(e){setErr(e?.message||"Humanize failed.");}
    setHumanizingStep(null);
  };

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
    {id:"bobi",icon:"⊞",label:"BoBi", badge:accounts.length||null,bc:"#4ade80"},
    {id:"research",icon:"◎",label:"Research",  badge:coIntel?"✓":null,bc:"#60a5fa"},
    {id:"tracker", icon:"▤",label:"Tracker",   badge:prospects.filter(p=>p.sequence).length||null,bc:"#f0a500"},
    {id:"sequence",icon:"⟡",label:"Sequence",  badge:generated?"✓":null,bc:"#f0a500"},
  ];

  const stageCfg = {
    Prospecting:{color:"#64748b",bg:"rgba(100,116,139,.12)"},
    Discovery:{color:"#1d4ed8",bg:"rgba(29,78,216,.12)"},
    Proposal:{color:"#b45309",bg:"rgba(180,83,9,.12)"},
    Negotiation:{color:"#6d28d9",bg:"rgba(109,40,217,.12)"},
    "Closed Won":{color:"#15803d",bg:"rgba(21,128,61,.12)"},
    "Closed Lost":{color:"#b91c1c",bg:"rgba(185,28,28,.12)"},
  };
  const stageOrder = ["Prospecting","Discovery","Proposal","Negotiation","Closed Won","Closed Lost"];
  const bobiAccounts = accounts.map(a=>({
    ...a,
    stage: a.stage || "Prospecting",
    timing: a.coIntel?.timingScore || "Cold",
    revenue: Number(a.revenue || 0),
    region: a.region || "NA",
    inPipeline: !["Closed Won","Closed Lost"].includes(a.stage || "Prospecting"),
    stale: (Date.now()-new Date(a.updatedAt||Date.now()).getTime()) > 1000*60*60*24*30,
  }));
  const filteredBoBi = bobiAccounts.filter(a=>{
    const byStage = bobiStageFilter==="all" || a.stage===bobiStageFilter;
    const q=bobiSearch.trim().toLowerCase();
    const bySearch=!q||`${a.co?.name||""} ${a.co?.industry||""} ${a.region}`.toLowerCase().includes(q);
    return byStage && bySearch;
  });
  const totalRevenue = bobiAccounts.reduce((n,a)=>n+a.revenue,0);
  const selectedBoBi = bobiAccounts.find(a=>a.id===bobiDetailId) || null;

  function buildBoBi(){
    const pipeline = bobiAccounts.filter(a=>a.inPipeline);
    const hot = bobiAccounts.filter(a=>a.timing==="Hot");
    const stale = bobiAccounts.filter(a=>a.stale);
    const byStageCount = stage => bobiAccounts.filter(a=>a.stage===stage);
    const tabBtn = (id,label)=><button className={`ppill${bobiTab===id?" on":""}`} onClick={()=>setBobiTab(id)}>{label}</button>;
    return (
      <div className="fade">
        <div className="between mb16">
          <div><div className="eyebrow">BOOK OF BUSINESS</div><h2 className="serif" style={{fontSize:26,fontWeight:500}}>BoBi</h2></div>
          <div className="row gap8"><button className="cpbtn" onClick={()=>window.alert("CSV/Excel upload coming next.")}>Upload CSV/Excel</button><button className="cpbtn pri" onClick={()=>setView("research")}>+ Add Account</button></div>
        </div>
        <div className="row gap8 wrap-row mb12">
          <div className="stat-box"><div style={{fontSize:16,fontWeight:700}}>{bobiAccounts.length}</div><div style={{fontSize:9,color:"#78716c"}}>Total Accounts</div></div>
          <div className="stat-box"><div style={{fontSize:16,fontWeight:700}}>{pipeline.length}</div><div style={{fontSize:9,color:"#78716c"}}>In Pipeline</div></div>
          <div className="stat-box"><div style={{fontSize:16,fontWeight:700,color:"#ef4444"}}>{hot.length}</div><div style={{fontSize:9,color:"#78716c"}}>Hot Timing</div></div>
          <div className="stat-box"><div style={{fontSize:16,fontWeight:700,color:"#b45309"}}>{stale.length}</div><div style={{fontSize:9,color:"#78716c"}}>Stale</div></div>
          <div className="stat-box"><div style={{fontSize:16,fontWeight:700}}>${totalRevenue.toLocaleString()}</div><div style={{fontSize:9,color:"#78716c"}}>Total Revenue</div></div>
        </div>
        <div className="row gap8 wrap-row mb12">
          {tabBtn("accounts","Accounts Table")}
          {tabBtn("opps","Opportunities")}
          {tabBtn("pipeline","Pipeline")}
          {tabBtn("segments","Segments")}
        </div>

        {bobiTab==="accounts"&&<div className="box">
          <div className="between mb10">
            <div className="row gap6 wrap-row">{["all",...stageOrder].map(s=>{const cfg=stageCfg[s]||{color:"#6b7280",bg:"rgba(107,114,128,.12)"};return <button key={s} className={`ppill${bobiStageFilter===s?" on":""}`} onClick={()=>setBobiStageFilter(s)} style={{background:bobiStageFilter===s?cfg.bg:"transparent",borderColor:cfg.color,color:cfg.color}}>{s==="all"?"All Stages":s}</button>;})}</div>
            <input className="fi" style={{maxWidth:240}} placeholder="Search accounts..." value={bobiSearch} onChange={e=>setBobiSearch(e.target.value)} />
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{textAlign:"left",color:"#78716c"}}><th>Company</th><th>Industry</th><th>Region</th><th>Revenue</th><th>Stage</th><th>Timing</th><th>Prospects</th><th>Intel</th></tr></thead>
              <tbody>{filteredBoBi.map(a=>{const cfg=stageCfg[a.stage]||stageCfg.Prospecting;return <tr key={a.id} onClick={()=>setBobiDetailId(a.id)} style={{cursor:"pointer",borderTop:"1px solid #e7e5e4"}}><td style={{padding:"8px 0"}}>{a.co?.name||"—"}</td><td>{a.co?.industry||"—"}</td><td>{a.region}</td><td>${a.revenue.toLocaleString()}</td><td><span className="tag" style={{background:cfg.bg,color:cfg.color}}>{a.stage}</span></td><td>{a.timing}</td><td>{a.prospects?.length||0}</td><td>{a.coIntel?"✓":"—"}</td></tr>;})}</tbody>
            </table>
          </div>
        </div>}

        {bobiTab==="opps"&&<div className="g2">
          <div className="box"><div className="lbl">Hot Accounts</div>{hot.filter(a=>a.inPipeline).map(a=><div key={a.id} className="tp"><div className="between"><strong>{a.co?.name}</strong><span>${a.revenue.toLocaleString()}</span></div><div style={{fontSize:11,color:"#78716c"}}>{a.co?.industry||"—"} · {a.stage}</div></div>)}</div>
          <div className="box"><div className="lbl">Stale Accounts</div>{stale.map(a=><div key={a.id} className="tp"><div className="between"><strong>{a.co?.name}</strong><span className="tag" style={{background:"rgba(239,68,68,.12)",color:"#b91c1c"}}>Re-engage</span></div><div style={{fontSize:11,color:"#78716c"}}>30+ days no activity</div></div>)}</div>
        </div>}

        {bobiTab==="pipeline"&&<div className="g3">{stageOrder.map(stage=>{const rows=byStageCount(stage);return <div key={stage} className="box"><div className="between mb8"><strong>{stage}</strong><span style={{fontSize:11,color:"#78716c"}}>{rows.length} · ${rows.reduce((n,a)=>n+a.revenue,0).toLocaleString()}</span></div>{rows.map(a=><div key={a.id} className="tp"><div style={{fontWeight:600}}>{a.co?.name}</div><div className="between"><span style={{fontSize:11,color:"#78716c"}}>${a.revenue.toLocaleString()}</span><span className="tag" style={{background:a.timing==="Hot"?"rgba(239,68,68,.12)":"rgba(245,158,11,.12)",color:a.timing==="Hot"?"#b91c1c":"#b45309"}}>{a.timing}</span></div></div>)}</div>;})}</div>}

        {bobiTab==="segments"&&<div className="g2">
          <div className="box"><div className="lbl">By Industry</div>{Object.entries(bobiAccounts.reduce((m,a)=>{const k=a.co?.industry||"Unknown";m[k]=(m[k]||0)+1;return m;},{})).map(([k,v])=><div key={k} className="between mb8"><span>{k}</span><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:120,height:6,background:"#e7e5e4",borderRadius:4}}><div style={{height:"100%",width:`${Math.min(100,v*15)}%`,background:"#d97706",borderRadius:4}}/></div><span>{v}</span></div></div>)}</div>
          <div className="box"><div className="lbl">By Stage</div>{stageOrder.map(s=>{const count=byStageCount(s).length;const rev=byStageCount(s).reduce((n,a)=>n+a.revenue,0);return <div key={s} className="between mb8"><span>{s}</span><span>{count} · ${rev.toLocaleString()}</span></div>;})}</div>
        </div>}

        {selectedBoBi&&<div style={{position:"fixed",top:0,right:0,width:420,maxWidth:"92vw",height:"100vh",background:"#fff",borderLeft:"1px solid #e7e5e4",padding:20,overflowY:"auto",zIndex:500}}>
          <div className="between mb10"><h3 className="serif" style={{fontSize:22}}>{selectedBoBi.co?.name}</h3><button className="cpbtn" onClick={()=>setBobiDetailId(null)}>Close</button></div>
          <div className="row gap8 mb10"><span className="tag" style={{background:(stageCfg[selectedBoBi.stage]||stageCfg.Prospecting).bg,color:(stageCfg[selectedBoBi.stage]||stageCfg.Prospecting).color}}>{selectedBoBi.stage}</span><span className="tag" style={{background:"rgba(245,158,11,.12)",color:"#b45309"}}>{selectedBoBi.timing}</span><span className="tag">${selectedBoBi.revenue.toLocaleString()}</span></div>
          <div className="box mb10"><div className="lbl">Deal Info</div><div style={{fontSize:12,lineHeight:1.8}}>Industry: {selectedBoBi.co?.industry||"—"}<br/>Region: {selectedBoBi.region}<br/>Website: {selectedBoBi.co?.website||"—"}<br/>Prospects: {selectedBoBi.prospects?.length||0}</div></div>
          <div className="box mb10"><div className="lbl">Deal Stage</div><select value={selectedBoBi.stage} onChange={e=>patchAcct(selectedBoBi.id,"stage",e.target.value)} className="fi">{stageOrder.map(s=><option key={s}>{s}</option>)}</select></div>
          <div className="box mb10"><div className="lbl">Account Snapshot</div><p style={{fontSize:12,color:"#57534e"}}>{selectedBoBi.coIntel?.snapshot||"No snapshot yet."}</p></div>
          <div className="box mb10"><div className="lbl">Prospects</div>{(selectedBoBi.prospects||[]).length?selectedBoBi.prospects.map((p,i)=><div key={i} className="tp">{p.firstName} {p.lastName} · {p.title}</div>):<p style={{fontSize:12,color:"#78716c"}}>No prospects added.</p>}</div>
          <div className="box"><div className="lbl">Activity Log</div><p style={{fontSize:12,color:"#78716c"}}>Updated {fmt(selectedBoBi.updatedAt)}</p></div>
        </div>}
      </div>
    );
  }

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
        <div className="sb-logo"><div className="row gap8" style={{marginBottom:6}}><div style={{width:18,height:18,borderRadius:4,background:"#d97706",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,fontWeight:700}}>◆</div><div className="sb-name" style={{marginBottom:0}}>Groundwork</div></div><div className="sb-tag">Sales Intelligence</div></div>
        <div className="nav">
          {navs.map(n=>(
            <div key={n.id} className={`ni${view===n.id?" on":""}`} onClick={()=>setView(n.id)}>
              <span className="ni-icon">{n.icon}</span>
              <span className="ni-label">{n.label}</span>
              {n.badge!=null&&<span className="tag" style={{background:`${n.bc}18`,color:n.bc,fontSize:9}}>{n.badge}</span>}
            </div>
          ))}
          
          {view==="sequence"&&<div className="snav">{["build","results"].map(t=><div key={t} className={`sni${seqTab===t?" on":""}`} onClick={()=>{if(t==="results"&&!generated)return;setSeqTab(t);}} style={{opacity:t==="results"&&!generated?0.35:1}}>{t.charAt(0).toUpperCase()+t.slice(1)}</div>)}</div>}
          {view==="tracker"&&prospects.length>0&&<div className="snav">{prospects.map((p,i)=><div key={i} className={`sni${trackerPi===i?" on":""}`} onClick={()=>setTrackerPi(i)}><div className="av" style={{width:16,height:16,fontSize:8,background:`hsl(${i*55+180},50%,40%)`}}>{p.firstName[0]}</div><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.firstName} {p.lastName}</span>{p.sequence&&<span style={{marginLeft:"auto",fontSize:9,color:"#4ade80",flexShrink:0}}>{doneCount(p)}/{totalT(p)}</span>}</div>)}</div>}
        </div>
        <div className="sb-bot">
          {co.name&&<div className="sb-card"><div style={{fontSize:9,color:"#cbd5e1",letterSpacing:"2px",textTransform:"uppercase",marginBottom:3}}>Active Account</div><div style={{fontSize:12,fontWeight:500,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"#fff"}}>{co.name}</div><div className="row gap6"><span className="tag" style={{background:`${acSt.color}18`,color:acSt.color,fontSize:9}}>{acSt.label}</span>{savedMsg&&<span style={{fontSize:9,color:"#86efac"}}>{savedMsg}</span>}</div></div>}
          {profileDone?<div className="sb-card"><div className="between mb8"><span style={{fontSize:9,color:"#fbbf24",letterSpacing:"2px",textTransform:"uppercase"}}>Profile</span><button onClick={()=>setShowProfile(true)} style={{fontSize:9,color:"#cbd5e1",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>EDIT</button></div><div style={{fontSize:11,lineHeight:1.5,marginBottom:2,color:"#e2e8f0"}}>{seller.problemSolved.slice(0,44)}{seller.problemSolved.length>44?"...":""}</div><div style={{fontSize:10,color:"#cbd5e1"}}>ICP: {seller.icp.slice(0,34)}{seller.icp.length>34?"...":""}</div></div>:<button onClick={()=>setShowProfile(true)} style={{width:"100%",padding:"8px",borderRadius:7,background:"rgba(248,113,113,.12)",border:"1px solid rgba(248,113,113,.3)",color:"#fecaca",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>SET UP PROFILE</button>}
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
              <div className="g4">{[{id:"bobi",icon:"⊞",label:"BoBi",desc:`${accounts.length} accounts`,c:"#4ade80"},{id:"research",icon:"◎",label:"Research Hub",desc:"Companies + stakeholders",c:"#60a5fa"},{id:"tracker",icon:"▤",label:"Sequence Tracker",desc:"Track & execute touches",c:"#f0a500"},{id:"sequence",icon:"⟡",label:"SequenceAI",desc:"Generate sequences",c:"#f0a500"}].map(h=><div key={h.id} onClick={()=>setView(h.id)} className="box" style={{cursor:"pointer",transition:"all .18s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=h.c+"50";e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.07)";e.currentTarget.style.transform="none";}}><div style={{fontSize:20,marginBottom:10,color:h.c}}>{h.icon}</div><div style={{fontSize:13,fontWeight:500,marginBottom:4}}>{h.label}</div><div style={{fontSize:11,color:"#5a5850",lineHeight:1.5}}>{h.desc}</div></div>)}</div>
            </div>
          )}

          {view==="bobi"&&buildBoBi()}

          {view==="research"&&(
            <div className="fade">
              <div className="between mb14">
                <div>
                  <div className="eyebrow">RESEARCH</div>
                  <h2 className="serif" style={{fontSize:24,fontWeight:500}}>Account Intelligence</h2>
                </div>
              </div>

              <div className="row gap8 wrap-row mb14">
                {accounts.map(a=><button key={a.id} className={`ppill${co.name===a.co?.name?" on":""}`} onClick={()=>loadAcct(a)}>{a.co?.name||"Untitled"}</button>)}
                <button className="ppill" onClick={()=>setView("bobi")}>+ New Account</button>
              </div>

              {coIntel?(
                <div className="box mb14">
                  <div className="lbl" style={{color:"#d97706"}}>◆ Account Snapshot</div>
                  <div className="row gap12 mb10">
                    <div style={{minWidth:110,padding:"12px",borderRadius:8,border:`1px solid ${coIntel.timingScore==="Hot"?"#fca5a5":coIntel.timingScore==="Warm"?"#fcd34d":"#d6d3d1"}`,textAlign:"center"}}>
                      <div style={{fontSize:9,color:"#78716c",letterSpacing:"2px",textTransform:"uppercase"}}>Timing</div>
                      <div className="serif" style={{fontSize:20,color:coIntel.timingScore==="Hot"?"#b91c1c":coIntel.timingScore==="Warm"?"#b45309":"#57534e"}}>{coIntel.timingScore}</div>
                    </div>
                    <p style={{fontSize:13,lineHeight:1.8,color:"#44403c",margin:0,flex:1}}>{coIntel.snapshot}</p>
                  </div>
                  <div style={{padding:"10px 12px",borderRadius:8,background:"rgba(217,119,6,.08)",border:"1px solid rgba(217,119,6,.22)",fontSize:12,color:"#92400e"}}>
                    <strong>Top Buying Signal:</strong> {coIntel.buyingSignals}
                  </div>
                </div>
              ):(
                <div className="box mb14">
                  <div className="lbl">◆ Account Snapshot</div>
                  <p style={{fontSize:13,color:"#78716c"}}>No intel for this account yet.</p>
                  <button className="cpbtn pri" onClick={()=>setView("bobi")}>Pull Snapshot →</button>
                </div>
              )}

              <div className="between mb10">
                <div className="lbl" style={{margin:0}}>Prospects</div>
                <button className="cpbtn pri" onClick={()=>setAddingP(true)}>+ Add Prospect</button>
              </div>

              {addingP&&(
                <div className="box mb12">
                  <div className="g2 mb10">
                    <Fld label="First Name *" value={newP.firstName} onChange={e=>setNewP(p=>({...p,firstName:e.target.value}))} ph="Sarah"/>
                    <Fld label="Last Name" value={newP.lastName} onChange={e=>setNewP(p=>({...p,lastName:e.target.value}))} ph="Johnson"/>
                    <Fld label="Title *" value={newP.title} onChange={e=>setNewP(p=>({...p,title:e.target.value}))} ph="VP of Sales"/>
                    <Fld label="LinkedIn" value={newP.linkedin} onChange={e=>setNewP(p=>({...p,linkedin:e.target.value}))} ph="linkedin.com/in/..."/>
                  </div>
                  <div className="row gap8"><AB onClick={addProspect} color="#d97706" sm>Add Prospect</AB><AB onClick={()=>setAddingP(false)} color="#78716c" sm>Cancel</AB></div>
                </div>
              )}

              {prospects.length===0&&<div className="box"><p style={{fontSize:13,color:"#78716c"}}>No prospects yet.</p><button className="cpbtn pri" onClick={()=>setAddingP(true)}>+ Add Prospect</button></div>}

              {prospects.map((p,i)=>{
                const st=SEQ_TYPES.find(t=>t.id===p.seqTypeId)||SEQ_TYPES[0];
                const researched=!!p.intel;
                return(
                  <div key={i} className="box mb12">
                    <div className="between mb10">
                      <div className="row gap10">
                        <div className="av" style={{width:30,height:30,fontSize:11,background:"#d97706"}}>{p.firstName?.[0]||"?"}{p.lastName?.[0]||""}</div>
                        <div><div className="serif" style={{fontSize:16}}>{p.firstName} {p.lastName}</div><div style={{fontSize:11,color:"#78716c"}}>{p.title||"—"}</div></div>
                      </div>
                      <div className="row gap8"><span className="tag" style={{background:`${st.color}18`,color:st.color}}>{st.label}</span><span className="tag" style={{background:researched?"rgba(21,128,61,.12)":"rgba(107,114,128,.12)",color:researched?"#15803d":"#6b7280"}}>{researched?"✓ Researched":"Not researched"}</span></div>
                    </div>
                    {researched&&<>
                      <div style={{padding:"9px 11px",borderRadius:7,background:"rgba(217,119,6,.08)",border:"1px solid rgba(217,119,6,.22)",fontSize:12,color:"#92400e",marginBottom:8}}><strong>Outreach Angle:</strong> {p.intel.angle}</div>
                      <div style={{padding:"9px 11px",borderRadius:7,background:"#f5f5f4",border:"1px solid #e7e5e4",fontSize:12,color:"#44403c",marginBottom:10}}><strong>Opener:</strong> {p.intel.opener}</div>
                    </>}
                    <div className="row gap8 wrap-row">
                      {researched?<><button className="cpbtn pri" onClick={()=>{setActivePi(i);buildSeq(i);}}>Build Sequence</button><button className="cpbtn" onClick={()=>autoResearchPr(i)}>Re-Research</button><button className="cpbtn" onClick={()=>cp(p.intel?.opener||"","opener"+i)}>Copy Opener</button></>:<button className="cpbtn pri" onClick={()=>autoResearchPr(i)}>⚡ Auto Research {p.firstName}</button>}
                    </div>
                  </div>
                );
              })}
              {err&&<div className="err">{err}</div>}
            </div>
          )}

          {view==="tracker"&&(
            <div className="fade">
              {(()=>{
                const pipeline = bobiAccounts.filter(a=>a.inPipeline);
                const closedWon = bobiAccounts.filter(a=>a.stage==="Closed Won");
                const stale = bobiAccounts.filter(a=>a.stale);
                const atRisk = bobiAccounts.filter(a=>a.inPipeline && a.timing==="Cold");
                const hotPipeline = bobiAccounts.filter(a=>a.inPipeline && a.timing==="Hot");
                const stuckDiscovery = bobiAccounts.filter(a=>a.inPipeline && a.stage==="Discovery");
                const attentionRows = bobiAccounts.map(a=>{
                  let score = 0;
                  if((a.prospects?.length||0)===0) score += 3;
                  if(a.stale) score += 2;
                  if(!a.coIntel) score += 1;
                  if(a.timing==="Cold") score += 1;
                  return {a,score};
                }).sort((x,y)=>y.score-x.score).slice(0,10);
                return (
                  <>
                    <div style={{marginBottom:16}}>
                      <div className="eyebrow">TRACKER</div>
                      <h2 className="serif" style={{fontSize:24,fontWeight:500}}>Pipeline Health Dashboard</h2>
                      <p style={{fontSize:12,color:"#57534e"}}>Your Monday morning view — what needs attention this week</p>
                    </div>
                    <div className="row gap8 wrap-row mb14">
                      <div className="stat-box"><div style={{fontSize:16,fontWeight:700}}>${pipeline.reduce((n,a)=>n+a.revenue,0).toLocaleString()}</div><div style={{fontSize:9,color:"#78716c"}}>Pipeline Value</div></div>
                      <div className="stat-box"><div style={{fontSize:16,fontWeight:700,color:"#15803d"}}>${closedWon.reduce((n,a)=>n+a.revenue,0).toLocaleString()}</div><div style={{fontSize:9,color:"#78716c"}}>Closed Won</div></div>
                      <div className="stat-box"><div style={{fontSize:16,fontWeight:700,color:"#b45309"}}>{stale.length}</div><div style={{fontSize:9,color:"#78716c"}}>Stale Accounts</div></div>
                      <div className="stat-box"><div style={{fontSize:16,fontWeight:700,color:"#b91c1c"}}>{atRisk.length}</div><div style={{fontSize:9,color:"#78716c"}}>At Risk</div></div>
                    </div>

                    <div className="box mb12"><div className="lbl">Hot Pipeline — Close This Week</div>{hotPipeline.length?hotPipeline.map(a=><div key={a.id} className="tp"><div className="between"><strong>{a.co?.name}</strong><div className="row gap6"><span className="tag" style={{background:(stageCfg[a.stage]||stageCfg.Prospecting).bg,color:(stageCfg[a.stage]||stageCfg.Prospecting).color}}>{a.stage}</span><span className="tag" style={{background:"rgba(239,68,68,.12)",color:"#b91c1c"}}>{a.timing}</span></div></div><div style={{fontSize:11,color:"#78716c"}}>${a.revenue.toLocaleString()}</div></div>):<p style={{fontSize:12,color:"#78716c"}}>No hot pipeline accounts.</p>}</div>

                    <div className="box mb12"><div className="lbl">Stale Accounts — Re-engage Now</div>{stale.length?stale.map(a=><div key={a.id} className="tp"><div className="between"><strong>{a.co?.name}</strong><button className="cpbtn" onClick={()=>{loadAcct(a);setView("research");}}>Open</button></div><div style={{fontSize:11,color:"#78716c"}}>{a.co?.industry||"—"} · ${a.revenue.toLocaleString()} · {a.stage}</div><span className="tag" style={{background:"rgba(180,83,9,.12)",color:"#b45309"}}>30+ days no activity</span></div>):<p style={{fontSize:12,color:"#78716c"}}>No stale accounts.</p>}</div>

                    <div className="box mb12"><div className="lbl">Stuck in Discovery — Push Forward</div>{stuckDiscovery.length?stuckDiscovery.map(a=><div key={a.id} className="tp"><div className="between"><strong>{a.co?.name}</strong><span>${a.revenue.toLocaleString()}</span></div><div style={{fontSize:11,color:"#78716c"}}>{a.timing} · {a.prospects?.length||0} prospects</div></div>):<p style={{fontSize:12,color:"#78716c"}}>No discovery-stage blockers.</p>}</div>

                    <div className="box mb12">
                      <div className="lbl">Top 10 Accounts Needing Attention</div>
                      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                        <thead><tr style={{textAlign:"left",color:"#78716c"}}><th>#</th><th>Company</th><th>Industry</th><th>Revenue</th><th>Stage</th><th>Timing</th><th>Prospects</th><th>Action</th></tr></thead>
                        <tbody>{attentionRows.map(({a,score},i)=><tr key={a.id} style={{borderTop:"1px solid #e7e5e4"}}><td style={{padding:"8px 0"}}>{i+1}</td><td>{a.co?.name}</td><td>{a.co?.industry||"—"}</td><td>${a.revenue.toLocaleString()}</td><td>{a.stage}</td><td>{a.timing}</td><td>{a.prospects?.length||0}</td><td>{(a.prospects?.length||0)===0?<button className="cpbtn">+ Add Stakeholder</button>:a.stale?<button className="cpbtn">Re-engage</button>:<button className="cpbtn">Research</button>} <span style={{fontSize:10,color:"#a8a29e"}}>S{score}</span></td></tr>)}</tbody>
                      </table>
                    </div>

                    <div className="box">
                      <div className="lbl">Stage Progression</div>
                      {stageOrder.map(s=>{const rows=bobiAccounts.filter(a=>a.stage===s);const rev=rows.reduce((n,a)=>n+a.revenue,0);return <div key={s} className="between mb8"><span>{s}</span><div className="row gap8"><div style={{width:160,height:6,background:"#e7e5e4",borderRadius:4}}><div style={{height:"100%",width:`${Math.min(100,rows.length*12)}%`,background:(stageCfg[s]||stageCfg.Prospecting).color,borderRadius:4}}/></div><span style={{fontSize:11,color:"#78716c"}}>{rows.length} · ${rev.toLocaleString()}</span></div></div>;})}
                    </div>
                  </>
                );
              })()}
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
                            <div className="row gap6">{c.subject&&<button className={`cpbtn${copied===activeStep+"_s"?" ok":""}`} onClick={()=>cp(c.subject,activeStep+"_s")}>{copied===activeStep+"_s"?"COPIED":"COPY SUBJECT"}</button>}<button className={`cpbtn pri${copied===activeStep+"_b"?" ok":""}`} onClick={()=>cp(c.body,activeStep+"_b")}>{copied===activeStep+"_b"?"COPIED":"COPY MESSAGE"}</button><button className={`cpbtn${copied===activeStep+"_a"?" ok":""}`} onClick={()=>cp(`Subject:${c.subject||""}\n\n${c.body}`,activeStep+"_a")}>{copied===activeStep+"_a"?"COPIED":"COPY BOTH"}</button><button className="cpbtn pri" onClick={()=>humanizeStep(activeStep)} disabled={humanizingStep===activeStep} style={{marginLeft:"auto"}}>{humanizingStep===activeStep?<><span className="spin"/>Humanizing...</>:"Humanize"}</button></div>
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
