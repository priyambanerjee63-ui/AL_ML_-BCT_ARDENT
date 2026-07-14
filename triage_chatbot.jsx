import { useState, useRef, useEffect } from "react";
import { Activity, Send, AlertTriangle, Phone, ShieldAlert, Stethoscope } from "lucide-react";

const LEVELS = [
  { key: "self_care", label: "Self-care", sub: "manage at home", color: "#6B9080" },
  { key: "routine", label: "Routine", sub: "see a clinician soon", color: "#0F5257" },
  { key: "urgent", label: "Urgent", sub: "seek care today", color: "#D98E04" },
  { key: "emergency", label: "Emergency", sub: "call now", color: "#C43D3D" },
];

const RED_FLAGS = [
  { re: /chest pain|pressure in (my|the) chest|tightness in (my|the) chest/i, tag: "cardiac" },
  { re: /can'?t breathe|difficulty breathing|shortness of breath|gasping/i, tag: "respiratory" },
  { re: /unconscious|passed out|not breathing|unresponsive/i, tag: "collapse" },
  { re: /severe bleeding|won'?t stop bleeding|bleeding a lot/i, tag: "bleeding" },
  { re: /stroke|face (is )?droop|slurred speech|sudden numbness|can'?t move (my )?(arm|face|leg)/i, tag: "stroke" },
  { re: /suicid|kill myself|want to die|end my life|hurt myself/i, tag: "crisis" },
  { re: /overdose|poison(ed|ing)?/i, tag: "toxic" },
  { re: /throat (is )?closing|swelling.*(throat|lips|tongue)|anaphyla/i, tag: "allergic" },
  { re: /seizure|convulsion/i, tag: "seizure" },
  { re: /severe burn/i, tag: "burn" },
];

const SYSTEM_PROMPT = `You are a symptom-triage assistant embedded in a web app. Your job is to ask short, focused
follow-up questions (one at a time) to understand a person's symptoms, then classify the urgency of
their situation and recommend the right level of care. You do NOT diagnose conditions and you never
state a definitive medical cause. You are cautious by default: if there is any reasonable chance of a
serious or life-threatening condition, classify as "urgent" or "emergency" rather than guessing low.

Recognize red-flag presentations (chest pain, breathing difficulty, stroke signs, severe bleeding,
anaphylaxis, suicidal ideation, loss of consciousness, poisoning/overdose, seizures) and classify
those as "emergency" immediately without needing more questions.

Never give specific medication doses. You may mention general categories of self-care (rest,
hydration, OTC pain relief in general terms) but always defer specifics to a pharmacist or doctor.

Respond with ONLY a single JSON object, no markdown fences, no prose outside the JSON, matching this
shape exactly:
{
  "reply": "<one short, warm, plain-language message to show the person now>",
  "acuity": "self_care" | "routine" | "urgent" | "emergency",
  "askMore": <boolean, true if you still need more info before a final recommendation>,
  "recommendation": "<empty string until askMore is false, then a short actionable recommendation>"
}

Ask at most one question per turn. Keep "reply" under 40 words. Once you have enough information
(usually after 2-4 exchanges, sooner if red flags appear), set askMore to false and fill in
"recommendation" with a clear next step (e.g. "Rest and fluids; see a doctor if it lasts past 3 days"
or "Go to an emergency room now").`;

function detectRedFlags(text) {
  return RED_FLAGS.filter((f) => f.re.test(text));
}

function Gauge({ level, pulse }) {
  const idx = LEVELS.findIndex((l) => l.key === level);
  return (
    <div className="flex md:flex-col gap-2 md:gap-3">
      {LEVELS.map((l, i) => {
        const active = i === idx;
        return (
          <div
            key={l.key}
            className="flex-1 md:flex-none rounded-md px-3 py-2 md:py-3 border transition-all duration-500"
            style={{
              borderColor: active ? l.color : "rgba(30,42,38,0.12)",
              background: active ? `${l.color}14` : "transparent",
              boxShadow: active ? `0 0 0 1px ${l.color}55 inset` : "none",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${active && pulse ? "animate-pulse" : ""}`}
                style={{ background: active ? l.color : "rgba(30,42,38,0.25)" }}
              />
              <span
                className="text-[11px] tracking-widest uppercase"
                style={{ color: active ? l.color : "#1E2A2688", fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {l.label}
              </span>
            </div>
            <div className="hidden md:block text-[10px] mt-1 opacity-60" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {l.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TriageChatbot() {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [acuity, setAcuity] = useState(null);
  const [emergency, setEmergency] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const [finished, setFinished] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  async function callClaude(history) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    const data = await res.json();
    const text = (data.content || [])
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("");
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  }

  async function send(text) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const flags = detectRedFlags(trimmed);
    if (flags.length > 0) {
      setEmergency(true);
      setAcuity("emergency");
      if (flags.some((f) => f.tag === "crisis")) setCrisis(true);
    }

    const userMsg = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const parsed = await callClaude(nextMessages);
      setAcuity((prev) => (prev === "emergency" ? "emergency" : parsed.acuity));
      if (parsed.acuity === "emergency") setEmergency(true);
      const assistantMsg = {
        role: "assistant",
        content: parsed.reply + (!parsed.askMore && parsed.recommendation ? `\n\n${parsed.recommendation}` : ""),
      };
      setMessages((m) => [...m, assistantMsg]);
      if (!parsed.askMore) setFinished(true);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Something went wrong reaching the assessment service. If this is urgent, please contact a doctor or emergency services directly rather than waiting on this tool.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="w-full min-h-[600px] flex flex-col"
      style={{
        background: "#F2F4F1",
        color: "#1E2A26",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .triage-scroll::-webkit-scrollbar { width: 6px; }
        .triage-scroll::-webkit-scrollbar-thumb { background: #1E2A2622; border-radius: 4px; }
        @keyframes blip { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#1E2A2618" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "#0F5257" }}>
            <Activity size={16} color="#F2F4F1" />
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight leading-none">Triage</div>
            <div className="text-[11px] opacity-55 mt-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              symptom assessment — not a diagnosis
            </div>
          </div>
        </div>
        <Stethoscope size={18} className="opacity-40" />
      </div>

      {/* Emergency banner */}
      {emergency && (
        <div
          className="px-5 py-3 flex items-start gap-3"
          style={{ background: "#C43D3D", color: "#FFF6F0" }}
        >
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div className="text-[13px] leading-snug">
            <div className="font-semibold">
              This may be an emergency. Call your local emergency number now (e.g. 112, 911, 999, or your
              country's equivalent).
            </div>
            {crisis && (
              <div className="mt-1 flex items-center gap-1.5 opacity-95">
                <ShieldAlert size={14} />
                If you're thinking about suicide, you can also reach the 988 Suicide & Crisis Lifeline (US)
                or a local crisis line — you don't have to be alone with this right now.
              </div>
            )}
            <div className="mt-1 opacity-90">This tool cannot dispatch help. Please contact emergency services or a trusted person directly.</div>
          </div>
        </div>
      )}

      {!started ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="text-[20px] font-semibold mb-3">Before we start</div>
            <p className="text-[13px] leading-relaxed opacity-75 mb-5">
              This assistant asks a few questions about your symptoms and suggests how urgently you
              should seek care. It does not diagnose conditions and is not a substitute for a doctor.
              If you're facing a medical emergency, stop and call your local emergency number now.
            </p>
            <button
              onClick={() => setStarted(true)}
              className="px-5 py-2.5 rounded-md text-[13px] font-medium"
              style={{ background: "#0F5257", color: "#F2F4F1" }}
            >
              I understand, start assessment
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Gauge rail */}
          <div className="md:w-48 shrink-0 p-4 md:border-r" style={{ borderColor: "#1E2A2618" }}>
            <Gauge level={acuity} pulse={loading} />
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col min-h-0">
            <div ref={scrollRef} className="triage-scroll flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-[13px] opacity-55">Describe what you're experiencing to begin — for example, "I've had a headache since this morning."</div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[80%] rounded-lg px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap"
                    style={
                      m.role === "user"
                        ? { background: "#0F5257", color: "#F2F4F1" }
                        : { background: "#FFFFFF", color: "#1E2A26", border: "1px solid #1E2A2614" }
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-3.5 py-2.5 text-[12px]" style={{ background: "#FFFFFF", border: "1px solid #1E2A2614", fontFamily: "'IBM Plex Mono', monospace" }}>
                    <span style={{ animation: "blip 1.2s infinite" }}>assessing…</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t flex items-end gap-2" style={{ borderColor: "#1E2A2618" }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                disabled={finished || loading}
                placeholder={finished ? "Assessment complete." : "Describe your symptoms…"}
                rows={1}
                className="flex-1 resize-none rounded-md px-3 py-2 text-[13.5px] outline-none"
                style={{ background: "#FFFFFF", border: "1px solid #1E2A2622" }}
              />
              <button
                onClick={() => send(input)}
                disabled={finished || loading || !input.trim()}
                className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 disabled:opacity-40"
                style={{ background: "#0F5257" }}
              >
                <Send size={15} color="#F2F4F1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer disclaimer */}
      <div className="px-5 py-2.5 border-t text-center" style={{ borderColor: "#1E2A2618" }}>
        <span className="text-[10.5px] opacity-50" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          Not medical advice · No diagnosis is made · In an emergency, call your local emergency number
        </span>
      </div>
    </div>
  );
}
