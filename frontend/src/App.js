import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function useLocalUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const existing = localStorage.getItem("peerfact_user");
    if (existing) {
      setUser(JSON.parse(existing));
      return;
    }
    // bootstrap a user
    axios
      .post(`${API}/users/bootstrap`, { username: null })
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("peerfact_user", JSON.stringify(res.data));
      })
      .catch((e) => console.error("bootstrap failed", e));
  }, []);
  return user;
}

function Badge({ label, color = "indigo" }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-${color}-500/15 text-${color}-300 border border-${color}-500/30`}>{label}</span>
  );
}

function ConfidenceBar({ confidence }) {
  const pct = Math.round((confidence || 0) * 100);
  return (
    <div className="w-full h-2 bg-white/10 rounded">
      <div className="h-2 bg-emerald-400 rounded" style={{ width: `${pct}%` }}></div>
    </div>
  );
}

function ClaimCard({ item, onOpen }) {
  const { ai_label, ai_summary, text, created_at, support_count, refute_count, unclear_count, confidence } = item;

  const labelColor = useMemo(() => {
    if ((ai_label || "").toLowerCase().includes("true")) return "emerald";
    if ((ai_label || "").toLowerCase().includes("false")) return "rose";
    return "amber";
  }, [ai_label]);

  return (
    <div className="glass p-5 hover:shadow-xl transition cursor-pointer group" onClick={onOpen}>
      <div className="flex items-center gap-3">
        <Badge label={ai_label || "Unverified"} color={labelColor} />
        <div className="text-xs text-white/60">{new Date(created_at).toLocaleString()}</div>
      </div>
      <div className="mt-3 text-lg font-semibold text-white/90 group-hover:text-white">{ai_summary || text}</div>
      <div className="mt-4 grid grid-cols-4 gap-3 text-sm text-white/70">
        <div className="stat-chip">Support: {support_count}</div>
        <div className="stat-chip">Refute: {refute_count}</div>
        <div className="stat-chip">Unclear: {unclear_count}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs">Confidence</span>
          <ConfidenceBar confidence={confidence} />
        </div>
      </div>
    </div>
  );
}

function NewClaim({ user, onCreated }) {
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const disabled = !text || !user || busy;

  const submit = async () => {
    if (disabled) return;
    try {
      setBusy(true);
      setError("");
      const res = await axios.post(`${API}/claims`, {
        author_id: user.id,
        text,
        link: link || null,
        media_base64: null,
      });
      setText("");
      setLink("");
      onCreated(res.data);
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to post claim");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass p-5">
      <div className="text-white/90 font-semibold text-lg">Post a claim</div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type the claim to verify..." className="mt-3 input w-full h-28" />
      <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Optional source link" className="mt-2 input w-full" />
      <div className="mt-3 flex items-center gap-3">
        <button className="btn-primary" disabled={disabled} onClick={submit}>
          {busy ? "Analyzing..." : "Analyze & Post"}
        </button>
        {error && <div className="text-rose-300 text-sm">{error}</div>}
      </div>
    </div>
  );
}

function ClaimDetail({ claim, user, onClose, refresh }) {
  const [verifs, setVerifs] = useState([]);
  const [verdict, setVerdict] = useState(null);

  const fetchDetail = async () => {
    const r = await axios.get(`${API}/claims/${claim.id}`);
    setVerifs(r.data.verifications || []);
    setVerdict(r.data.verdict || null);
  };

  useEffect(() => {
    fetchDetail();
  }, [claim.id]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-3 z-50">
      <div className="w-full md:w-[900px] max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 shadow-2xl">
        <div className="p-5 flex items-center justify-between sticky top-0 bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="text-white/90 font-semibold">Claim</div>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <div className="text-xl text-white font-semibold">{claim.ai_summary || claim.text}</div>
            <div className="mt-2 text-white/70 text-sm">AI label: {claim.ai_label || "Unverified"}</div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass p-4">
              <div className="text-white/80 font-medium">Current Verdict</div>
              {verdict ? (
                <div className="mt-2 space-y-2 text-white/80">
                  <div>Label: {verdict.label}</div>
                  <div>Confidence: {Math.round((verdict.confidence || 0) * 100)}%</div>
                  <div>Support: {verdict.support} · Refute: {verdict.refute} · Unclear: {verdict.unclear}</div>
                </div>
              ) : (
                <div className="text-white/60">No votes yet</div>
              )}
            </div>
            <AddVerification claimId={claim.id} user={user} onAdded={() => { fetchDetail(); refresh(); }} />
            <div className="glass p-4">
              <div className="text-white/80 font-medium">Metadata</div>
              <div className="mt-2 text-white/70 text-sm break-words">Source: {claim.link || "—"}</div>
              <div className="text-white/70 text-sm">Created: {new Date(claim.created_at).toLocaleString()}</div>
            </div>
          </div>

          <div className="glass p-4">
            <div className="text-white/80 font-medium mb-2">Community Evidence</div>
            {verifs.length === 0 && <div className="text-white/60">Be the first to add evidence.</div>}
            <div className="space-y-3">
              {verifs.map((v) => (
                <div key={v.id} className="rounded-lg border border-white/10 p-3 bg-white/5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-white/80">{v.stance.toUpperCase()}</div>
                    <div className="text-white/50">{new Date(v.created_at).toLocaleString()}</div>
                  </div>
                  {v.source_url && (
                    <a className="text-sky-300 text-sm underline break-all" href={v.source_url} target="_blank" rel="noreferrer">{v.source_url}</a>
                  )}
                  {v.explanation && <div className="text-white/80 mt-1 text-sm">{v.explanation}</div>}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function AddVerification({ claimId, user, onAdded }) {
  const [stance, setStance] = useState("support");
  const [source, setSource] = useState("");
  const [explanation, setExplanation] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user) return;
    try {
      setBusy(true);
      await axios.post(`${API}/claims/${claimId}/verify`, {
        author_id: user.id,
        stance,
        source_url: source || null,
        explanation: explanation || null,
      });
      setSource("");
      setExplanation("");
      onAdded();
    } catch (e) {
      // no-op
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass p-4">
      <div className="text-white/80 font-medium">Add Verification</div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
        {[
          { key: "support", label: "Support" },
          { key: "refute", label: "Refute" },
          { key: "unclear", label: "Unclear" },
        ].map((opt) => (
          <button key={opt.key} className={`chip ${stance === opt.key ? "chip-active" : ""}`} onClick={() => setStance(opt.key)}>
            {opt.label}
          </button>
        ))}
      </div>
      <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Source URL (optional)" className="mt-3 input w-full" />
      <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Brief explanation (optional)" className="mt-2 input w-full h-24" />
      <button className="btn-secondary mt-3" onClick={submit} disabled={busy}>{busy ? "Submitting..." : "Submit Evidence"}</button>
    </div>
  );
}

function App() {
  const user = useLocalUser();
  const [claims, setClaims] = useState([]);
  const [open, setOpen] = useState(null);

  const fetchClaims = async () => {
    const res = await axios.get(`${API}/claims`);
    setClaims(res.data || []);
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <div className="min-h-screen bg-grid">
      <div className="hero-gradient" />
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="logo">PF</div>
          <div>
            <div className="text-white font-semibold text-lg">PeerFact</div>
            <div className="text-white/60 text-xs">Crowdsourced, reputation-weighted fact checking</div>
          </div>
        </div>
        <div className="text-white/70 text-sm">{user ? `Hi, ${user.username}` : "Bootstrapping..."}</div>
      </header>

      <main className="container mx-auto px-4 pb-20 space-y-6">
        <NewClaim user={user} onCreated={() => fetchClaims()} />

        <div className="grid md:grid-cols-2 gap-4">
          {claims.map((c) => (
            <ClaimCard key={c.id} item={c} onOpen={() => setOpen(c)} />)
          )}
        </div>
      </main>

      <footer className="py-10 text-center text-white/50 text-sm">Built for impact · Polygon &amp; advanced AI coming soon</footer>

      {open && <ClaimDetail claim={open} user={user} onClose={() => setOpen(null)} refresh={fetchClaims} />}
    </div>
  );
}

export default App;