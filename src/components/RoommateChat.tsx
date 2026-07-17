import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Users, Send, CheckCircle2, MessageCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { COLLEGES } from "@/lib/data";

type Tab = "closed" | "intro" | "form" | "browse" | "chat" | "done";

/* ── types ── */
type Profile = {
  name: string; whatsapp: string; college: string; year: string;
  course: string; budget_min: string; budget_max: string;
  gender_preference: string; preferred_area: string;
  move_in_date: string; about_me: string;
};

type RoommateRow = {
  id: string; name: string; college: string; year: string | null;
  course: string | null; budget_min: number | null; budget_max: number | null;
  gender_preference: string | null; preferred_area: string | null;
  move_in_date: string | null; about_me: string | null; whatsapp: string;
};

type ChatMsg = {
  id: string; created_at: string;
  sender_name: string; sender_college: string; message: string; room_id: string;
};

const emptyProfile: Profile = {
  name: "", whatsapp: "", college: COLLEGES[0], year: "", course: "",
  budget_min: "", budget_max: "", gender_preference: "", preferred_area: "",
  move_in_date: "", about_me: "",
};

/* ── main component ── */
export function RoommateChat() {
  const [tab, setTab] = useState<Tab>("closed");
  const [form, setForm] = useState<Profile>(emptyProfile);
  const [saving, setSaving] = useState(false);
  const [profiles, setProfiles] = useState<RoommateRow[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // chat state
  const [myName, setMyName] = useState<string>("");
  const [myCollege, setMyCollege] = useState<string>(COLLEGES[0]);
  const [nameSet, setNameSet] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("du_chat_name");
    if (saved) {
      setMyName(saved);
      setMyCollege(localStorage.getItem("du_chat_college") ?? COLLEGES[0]);
      setNameSet(true);
    }
  }, []);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const upd = (k: keyof Profile, v: string) => setForm((f) => ({ ...f, [k]: v }));

  /* ── load profiles ── */
  const loadProfiles = async () => {
    setLoadingProfiles(true);
    const { data } = await supabase
      .from("roommate_profiles").select("*")
      .eq("status", "active").order("created_at", { ascending: false }).limit(20);
    setProfiles((data as RoommateRow[]) ?? []);
    setLoadingProfiles(false);
  };

  /* ── post profile ── */
  const submitProfile = async () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    if (!/^\d{10}$/.test(form.whatsapp.replace(/\D/g, ""))) { toast.error("Valid 10-digit WhatsApp required"); return; }
    if (!form.budget_max) { toast.error("Max budget required"); return; }
    setSaving(true);
    const { error } = await supabase.from("roommate_profiles").insert({
      name: form.name.trim(), whatsapp: form.whatsapp.replace(/\D/g, ""),
      college: form.college, year: form.year || null, course: form.course || null,
      budget_min: form.budget_min ? Number(form.budget_min) : null,
      budget_max: Number(form.budget_max),
      gender_preference: form.gender_preference || null,
      preferred_area: form.preferred_area || null,
      move_in_date: form.move_in_date || null,
      about_me: form.about_me || null, status: "active",
    });
    setSaving(false);
    if (error) { toast.error("Could not save profile."); return; }
    setTab("done");
    loadProfiles();
  };

  /* ── chat: load history + subscribe ── */
  useEffect(() => {
    if (tab !== "chat") {
      channelRef.current?.unsubscribe();
      channelRef.current = null;
      return;
    }

    // load last 50 messages
    supabase.from("chat_messages").select("*")
      .eq("room_id", "general").order("created_at", { ascending: true }).limit(50)
      .then(({ data }) => {
        setMessages((data as ChatMsg[]) ?? []);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      });

    // subscribe to new messages
    const channel = supabase
      .channel("chat_general")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "chat_messages",
        filter: "room_id=eq.general",
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMsg]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      })
      .subscribe();

    channelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [tab]);

  /* ── send message ── */
  const sendMessage = async () => {
    const text = msgInput.trim();
    if (!text) return;
    setSending(true);
    setMsgInput("");
    const { error } = await supabase.from("chat_messages").insert({
      sender_name: myName, sender_college: myCollege,
      message: text, room_id: "general",
    });
    setSending(false);
    if (error) { toast.error("Could not send message."); setMsgInput(text); }
  };

  const saveName = () => {
    if (!myName.trim()) { toast.error("Enter your name"); return; }
    localStorage.setItem("du_chat_name", myName.trim());
    localStorage.setItem("du_chat_college", myCollege);
    setNameSet(true);
  };

  /* ── closed button ── */
  if (tab === "closed") {
    return (
      <button
        onClick={() => setTab("intro")}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-4 py-3 rounded-full shadow-2xl transition-all hover:scale-105"
      >
        <Users size={20} />
        <span className="hidden sm:inline text-sm">Find Your Roommate</span>
      </button>
    );
  }

  /* ── header title ── */
  const headerTitle =
    tab === "chat" ? "💬 Student Chat" :
    tab === "browse" ? "👀 Browse Roommates" :
    tab === "form" ? "📝 Post Profile" :
    "Find Your Roommate";

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
      style={{ maxHeight: "85vh" }}
    >
      {/* Header */}
      <div className="bg-navy px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {(tab === "form" || tab === "browse" || tab === "chat") && (
            <button onClick={() => setTab("intro")} className="text-brand-cream/60 hover:text-brand-cream mr-1">
              <ArrowLeft size={16} />
            </button>
          )}
          <Users size={18} className="text-brand-orange" />
          <span className="font-bold text-brand-cream text-sm">{headerTitle}</span>
        </div>
        <button onClick={() => setTab("closed")} className="text-brand-cream/60 hover:text-brand-cream">
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className={`flex flex-col flex-1 overflow-hidden ${tab === "chat" ? "" : "overflow-y-auto"}`}>

        {/* INTRO */}
        {tab === "intro" && (
          <div className="p-5 space-y-3 overflow-y-auto">
            <div className="text-center">
              <div className="text-4xl mb-2">🏠</div>
              <h3 className="font-bold text-navy text-base">Connect with DU students</h3>
              <p className="text-sm text-muted-foreground mt-1">Find flatmates, chat live, or post your profile.</p>
            </div>
            <button onClick={() => { setTab("chat"); }} className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
              <MessageCircle size={16} /> Live Student Chat
            </button>
            <button onClick={() => setTab("form")} className="w-full border border-border text-navy font-semibold py-3 rounded-xl text-sm hover:bg-secondary">
              📝 Post My Roommate Profile
            </button>
            <button onClick={() => { setTab("browse"); loadProfiles(); }} className="w-full border border-border text-navy font-semibold py-3 rounded-xl text-sm hover:bg-secondary">
              👀 Browse Profiles
            </button>
          </div>
        )}

        {/* LIVE CHAT */}
        {tab === "chat" && (
          <>
            {!nameSet ? (
              <div className="p-5 space-y-3 overflow-y-auto">
                <p className="text-sm text-muted-foreground">Enter your name to join the chat. No signup needed.</p>
                <ChatInput label="Your name *" value={myName} onChange={setMyName} placeholder="e.g. Priya" />
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Your college</div>
                  <select value={myCollege} onChange={(e) => setMyCollege(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-brand-orange/40">
                    {COLLEGES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button onClick={saveName} className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-3 rounded-xl text-sm">
                  Join Chat →
                </button>
              </div>
            ) : (
              <>
                {/* messages list */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {messages.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                      <MessageCircle size={28} className="mx-auto mb-2 opacity-30" />
                      No messages yet. Say hi! 👋
                    </div>
                  )}
                  {messages.map((m) => {
                    const isMe = m.sender_name === myName && m.sender_college === myCollege;
                    return (
                      <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        {!isMe && (
                          <div className="text-[10px] font-bold text-brand-orange mb-0.5 px-1">
                            {m.sender_name} · {m.sender_college.split(" ").slice(0, 2).join(" ")}
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-snug ${
                            isMe
                              ? "bg-brand-orange text-white rounded-br-sm"
                              : "bg-secondary text-navy rounded-bl-sm"
                          }`}
                        >
                          {m.message}
                        </div>
                        <div className="text-[9px] text-muted-foreground mt-0.5 px-1">
                          {new Date(m.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* input bar */}
                <div className="border-t border-border p-2 flex gap-2 shrink-0">
                  <input
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value.slice(0, 500))}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Type a message…"
                    className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !msgInput.trim()}
                    className="w-9 h-9 rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white flex items-center justify-center disabled:opacity-40 shrink-0"
                  >
                    <Send size={15} />
                  </button>
                </div>

                {/* change name */}
                <div className="px-3 pb-2 shrink-0">
                  <button onClick={() => setNameSet(false)} className="text-[10px] text-muted-foreground hover:text-navy">
                    Chatting as <b>{myName}</b> · Change
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* POST PROFILE FORM */}
        {tab === "form" && (
          <div className="p-4 space-y-3 overflow-y-auto">
            <p className="text-xs text-muted-foreground">Fill in your details — other students will contact you on WhatsApp.</p>
            <ChatInput label="Your name *" value={form.name} onChange={(v) => upd("name", v)} placeholder="Full name" />
            <ChatInput label="WhatsApp number *" value={form.whatsapp} onChange={(v) => upd("whatsapp", v.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit number" type="tel" />
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">College *</div>
              <select value={form.college} onChange={(e) => upd("college", e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-brand-orange/40">
                {COLLEGES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ChatInput label="Year" value={form.year} onChange={(v) => upd("year", v)} placeholder="e.g. 2nd year" />
              <ChatInput label="Course" value={form.course} onChange={(v) => upd("course", v)} placeholder="e.g. B.Com" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ChatInput label="Min budget (₹)" value={form.budget_min} onChange={(v) => upd("budget_min", v)} placeholder="5000" type="number" />
              <ChatInput label="Max budget (₹) *" value={form.budget_max} onChange={(v) => upd("budget_max", v)} placeholder="9000" type="number" />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Gender preference</div>
              <div className="flex gap-2 flex-wrap">
                {["Girls only", "Boys only", "Any"].map((g) => (
                  <button key={g} type="button" onClick={() => upd("gender_preference", g)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${form.gender_preference === g ? "bg-brand-orange border-brand-orange text-white" : "border-border text-navy hover:border-brand-orange/40"}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <ChatInput label="Preferred area" value={form.preferred_area} onChange={(v) => upd("preferred_area", v)} placeholder="e.g. Kamla Nagar, GTB Nagar" />
            <ChatInput label="Move-in date" value={form.move_in_date} onChange={(v) => upd("move_in_date", v)} type="date" />
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">About me</div>
              <textarea value={form.about_me} onChange={(e) => upd("about_me", e.target.value.slice(0, 200))} rows={2}
                placeholder="Habits, schedule, preferences…"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-brand-orange/40 resize-none" />
              <div className="text-xs text-muted-foreground text-right">{form.about_me.length}/200</div>
            </div>
            <button onClick={submitProfile} disabled={saving}
              className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              <Send size={14} /> {saving ? "Posting…" : "Post My Profile"}
            </button>
          </div>
        )}

        {/* DONE */}
        {tab === "done" && (
          <div className="p-6 text-center space-y-4 overflow-y-auto">
            <CheckCircle2 size={48} className="text-brand-orange mx-auto" />
            <h3 className="font-bold text-navy">Profile Posted!</h3>
            <p className="text-sm text-muted-foreground">Other students can now find you. They'll reach out on WhatsApp.</p>
            <button onClick={() => { setTab("browse"); loadProfiles(); }}
              className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-3 rounded-xl text-sm">
              Browse Other Roommates
            </button>
            <button onClick={() => setTab("chat")}
              className="w-full border border-border text-navy font-semibold py-3 rounded-xl text-sm hover:bg-secondary">
              💬 Join Live Chat
            </button>
          </div>
        )}

        {/* BROWSE PROFILES */}
        {tab === "browse" && (
          <div className="p-4 space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy uppercase tracking-wide">Active Profiles</span>
              <button onClick={() => setTab("form")} className="text-xs text-brand-orange font-bold hover:underline">+ Post Mine</button>
            </div>
            {loadingProfiles && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl shimmer" />)}
              </div>
            )}
            {!loadingProfiles && profiles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Users size={32} className="mx-auto mb-2 opacity-40" />
                No profiles yet. Be the first!
              </div>
            )}
            {profiles.map((p) => (
              <div key={p.id} className="border border-border rounded-xl p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-navy text-sm">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.college}</div>
                  </div>
                  {p.budget_max && (
                    <span className="text-xs font-bold text-brand-orange shrink-0">
                      ₹{p.budget_min ? `${(p.budget_min / 1000).toFixed(0)}k–` : ""}
                      {(p.budget_max / 1000).toFixed(0)}k/mo
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {p.year && <Tag>{p.year}</Tag>}
                  {p.course && <Tag>{p.course}</Tag>}
                  {p.gender_preference && <Tag>{p.gender_preference}</Tag>}
                  {p.preferred_area && <Tag>📍 {p.preferred_area}</Tag>}
                </div>
                {p.about_me && <p className="text-xs text-muted-foreground line-clamp-2">{p.about_me}</p>}
                <a
                  href={`https://wa.me/91${p.whatsapp}?text=${encodeURIComponent(`Hi ${p.name}, I saw your roommate profile on DU Nest. I'm also looking for a flatmate near ${p.college}. Can we connect?`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-bold text-white"
                  style={{ backgroundColor: "#25d366" }}
                >
                  💬 Connect on WhatsApp
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── shared UI ── */
function ChatInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</div>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-border rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-brand-orange/40" />
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-0.5 rounded-full bg-secondary text-navy text-[10px] font-semibold">{children}</span>;
}
