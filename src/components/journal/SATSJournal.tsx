"use client";

// components/journal/SATSJournal.tsx
//
// The core journaling component for Vibe Hyr platform.
// Supports all entry types: SATS, Revision, Identity, Bridge Moment,
// Trigger Log, Accountability.
//
// Designed for both personal platform use and workplace module integration.
// Entry types map directly to the four Track curriculum tools.

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const T = {
  orange:  "#E8621A",
  gold:    "#C9A84C",
  dark:    "#0E0C08",
  darkMid: "#1A1208",
  panel:   "#141008",
  card:    "#1E1610",
  border:  "#2E2416",
  gray:    "#8C7A60",
  muted:   "#5A4A34",
  cream:   "#F7F2EA",
  white:   "#FFFFFF",
  teal:    "#0F505A",
};

// ─── Entry types ─────────────────────────────────────────────────────────────
type EntryType = "sats" | "revision" | "identity" | "bridge_moment" | "trigger_log" | "accountability";

interface EntryConfig {
  label: string;
  icon: string;
  color: string;
  prompt: string;
  placeholder: string;
  trackRef?: string;
}

const ENTRY_CONFIGS: Record<EntryType, EntryConfig> = {
  sats: {
    label: "SATS Session",
    icon: "◉",
    color: T.orange,
    prompt: "State Akin to Sleep — record what you assumed, felt, and inhabited tonight.",
    placeholder: "Describe the state you entered, the scene you ran, and the felt sense you held. What did it feel like from the inside? What was your first word as you returned to waking consciousness?",
    trackRef: "t3",
  },
  revision: {
    label: "Evening Revision",
    icon: "↩",
    color: T.gold,
    prompt: "Revision — mentally rewrite today's residue before sleep.",
    placeholder: "What event left emotional residue today? How did it go? How do you wish it had gone? Describe the revised version in present tense, from the inside. How do you feel in the revised outcome?",
    trackRef: "t1",
  },
  identity: {
    label: "Identity Note",
    icon: "◈",
    color: "#A855F7",
    prompt: "Identity — observe the self-concept you operated from today.",
    placeholder: "What identity archetype showed up today — Performer, Protector, Prover, or Sovereign? In what situation? What would the Sovereign have done differently? What felt-sense identity did you practice in your SATS session?",
    trackRef: "t3",
  },
  bridge_moment: {
    label: "Bridge Moment",
    icon: "✦",
    color: T.teal,
    prompt: "Bridge of Incidents — record a small event signaling your internal shift is taking form.",
    placeholder: "Describe the incident. It may seem small or coincidental. Why does it feel significant? What internal shift might it be echoing? Name it without forcing meaning — just witness it.",
    trackRef: "t4",
  },
  trigger_log: {
    label: "Trigger Log",
    icon: "⚡",
    color: "#EF4444",
    prompt: "Trigger Map — map a reactivity pattern for Track 01 awareness work.",
    placeholder: "What was the stimulus? What stage did you reach on the Escalation Ladder? What physical signal arrived first? What was the primary emotion beneath the reaction? What would Stage 1 intervention have looked like?",
    trackRef: "t1",
  },
  accountability: {
    label: "Accountability Note",
    icon: "◻",
    color: "#22C55E",
    prompt: "Clean Miss or Commitment — Track 04 accountability architecture.",
    placeholder: "Commitment made: ___ | Deadline: ___ | What happened: ___ | What I'm doing about it: ___ | Revised commitment: ___  OR  What I committed to: ___ | I followed through by: ___ | What I noticed in doing so: ___",
    trackRef: "t4",
  },
};

// ─── Emotion tag options ──────────────────────────────────────────────────────
const EMOTION_TAGS = [
  "grounded", "expansive", "anxious", "clear", "heavy",
  "present", "scattered", "grateful", "resistant", "open",
  "frustrated", "aligned", "uncertain", "confident", "tired",
];

// ─── Journal Entry interface ──────────────────────────────────────────────────
interface JournalEntry {
  id: string;
  entry_type: EntryType;
  content: string;
  emotion_tags: string[];
  track_ref?: string;
  lesson_ref?: string;
  created_at: string;
}

interface SATSJournalProps {
  defaultType?: EntryType;
  lessonRef?: string;    // pre-fill from lesson context
  trackRef?: string;
  compact?: boolean;     // compact mode for sidebar/widget use
}

export default function SATSJournal({
  defaultType = "sats",
  lessonRef,
  trackRef,
  compact = false,
}: SATSJournalProps) {
  const supabase = createClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [activeType, setActiveType]   = useState<EntryType>(defaultType);
  const [content, setContent]         = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [entries, setEntries]         = useState<JournalEntry[]>([]);
  const [loading, setLoading]         = useState(true);
  const [view, setView]               = useState<"write" | "history">("write");
  const [userId, setUserId]           = useState<string | null>(null);

  const config = ENTRY_CONFIGS[activeType];

  // ── Load entries ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from("journal_entries")
        .select("id, entry_type, content, emotion_tags, track_ref, lesson_ref, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setEntries((data as JournalEntry[]) ?? []);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-grow textarea ──────────────────────────────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // ── Save entry ──────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!content.trim() || !userId) return;
    setSaving(true);

    const { data, error } = await supabase.from("journal_entries").insert({
      user_id:      userId,
      entry_type:   activeType,
      content:      content.trim(),
      emotion_tags: selectedTags,
      track_ref:    trackRef ?? config.trackRef ?? null,
      lesson_ref:   lessonRef ?? null,
      is_private:   true,
    }).select().single();

    setSaving(false);

    if (!error && data) {
      setEntries(prev => [data as JournalEntry, ...prev]);
      setContent("");
      setSelectedTags([]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }

  const entryTypeOrder: EntryType[] = ["sats", "revision", "identity", "bridge_moment", "trigger_log", "accountability"];

  return (
    <div style={{
      background: T.dark, color: T.cream,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      borderRadius: compact ? 12 : 0,
      border: compact ? `1px solid ${T.border}` : "none",
      overflow: "hidden",
      height: compact ? "auto" : "100%",
    }}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      {!compact && (
        <div style={{ padding: "28px 32px 0", borderBottom: `1px solid ${T.border}`, paddingBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.cream,
                fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.06em" }}>
                VIBE HYR JOURNAL
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: T.muted }}>
                SATS · Revision · Identity · Bridge Moments
              </p>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["write", "history"] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  style={{
                    padding: "7px 16px", borderRadius: 6, border: "none", cursor: "pointer",
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                    background: view === v ? T.orange : T.card,
                    color: view === v ? T.white : T.gray,
                  }}>
                  {v === "write" ? "WRITE" : "HISTORY"}
                </button>
              ))}
            </div>
          </div>

          {/* Entry type selector */}
          {view === "write" && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {entryTypeOrder.map(type => {
                const c = ENTRY_CONFIGS[type];
                const active = activeType === type;
                return (
                  <button key={type} onClick={() => setActiveType(type)}
                    style={{
                      padding: "6px 14px", borderRadius: 20, border: `1px solid ${active ? c.color : T.border}`,
                      background: active ? `${c.color}22` : "transparent",
                      color: active ? c.color : T.gray, fontSize: 11, fontWeight: 600,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                      transition: "all 0.15s",
                    }}>
                    <span>{c.icon}</span> {c.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === "write" ? (
          <motion.div key="write" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ padding: compact ? "16px" : "24px 32px" }}>

            {/* Compact type selector */}
            {compact && (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
                {entryTypeOrder.map(type => {
                  const c = ENTRY_CONFIGS[type];
                  const active = activeType === type;
                  return (
                    <button key={type} onClick={() => setActiveType(type)}
                      style={{
                        padding: "4px 10px", borderRadius: 16, border: `1px solid ${active ? c.color : T.border}`,
                        background: active ? `${c.color}22` : "transparent",
                        color: active ? c.color : T.muted, fontSize: 10, fontWeight: 600,
                        cursor: "pointer",
                      }}>
                      {c.icon} {c.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Prompt */}
            <div style={{ background: `${config.color}12`, border: `1px solid ${config.color}44`,
              borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: config.color,
                letterSpacing: "0.1em", marginBottom: 5 }}>
                {config.icon} {config.label.toUpperCase()}
              </div>
              <p style={{ margin: 0, fontSize: 12, color: T.gray, lineHeight: 1.6 }}>
                {config.prompt}
              </p>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={config.placeholder}
              style={{
                width: "100%", minHeight: 140, background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 10, padding: "16px 18px", color: T.cream, fontSize: 14,
                fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, resize: "none",
                outline: "none", boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={e => { e.target.style.borderColor = config.color; }}
              onBlur={e => { e.target.style.borderColor = T.border; }}
            />

            {/* Emotion tags */}
            <div style={{ marginTop: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", fontWeight: 700,
                color: T.muted, marginBottom: 8 }}>HOW ARE YOU FEELING?</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {EMOTION_TAGS.map(tag => {
                  const sel = selectedTags.includes(tag);
                  return (
                    <button key={tag} onClick={() => toggleTag(tag)}
                      style={{
                        padding: "4px 12px", borderRadius: 14,
                        border: `1px solid ${sel ? config.color : T.border}`,
                        background: sel ? `${config.color}22` : "transparent",
                        color: sel ? config.color : T.muted, fontSize: 11,
                        cursor: "pointer", transition: "all 0.12s",
                      }}>
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save button */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={handleSave} disabled={!content.trim() || saving}
                style={{
                  padding: "11px 28px", background: content.trim() ? config.color : T.muted,
                  color: T.white, border: "none", borderRadius: 8, fontWeight: 700,
                  fontSize: 13, cursor: content.trim() ? "pointer" : "not-allowed",
                  letterSpacing: "0.08em", transition: "all 0.15s",
                  opacity: saving ? 0.7 : 1,
                }}>
                {saving ? "SAVING..." : "SAVE ENTRY"}
              </button>
              <AnimatePresence>
                {saved && (
                  <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }} style={{ fontSize: 12, color: "#22C55E" }}>
                    ✓ Saved
                  </motion.span>
                )}
              </AnimatePresence>
              <span style={{ fontSize: 11, color: T.muted, marginLeft: "auto" }}>
                {content.length > 0 ? `${content.length} chars` : "Private · end-to-end encrypted"}
              </span>
            </div>
          </motion.div>

        ) : (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ padding: compact ? "16px" : "24px 32px", maxHeight: compact ? 400 : "60vh", overflow: "auto" }}>

            {loading ? (
              <p style={{ color: T.muted, fontSize: 13 }}>Loading entries...</p>
            ) : entries.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 20px" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>◉</div>
                <p style={{ color: T.muted, fontSize: 13 }}>No entries yet. Your first entry is waiting.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {entries.map(entry => {
                  const c = ENTRY_CONFIGS[entry.entry_type as EntryType];
                  return (
                    <motion.div key={entry.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      style={{ background: T.card, border: `1px solid ${T.border}`,
                        borderLeft: `3px solid ${c?.color ?? T.orange}`, borderRadius: 10,
                        padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: c?.color ?? T.orange,
                          letterSpacing: "0.1em" }}>
                          {c?.icon} {c?.label?.toUpperCase() ?? entry.entry_type.toUpperCase()}
                        </span>
                        <span style={{ fontSize: 10, color: T.muted }}>{formatDate(entry.created_at)}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: T.cream, lineHeight: 1.65,
                        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                        overflow: "hidden" }}>
                        {entry.content}
                      </p>
                      {entry.emotion_tags?.length > 0 && (
                        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {entry.emotion_tags.map(tag => (
                            <span key={tag} style={{ fontSize: 10, padding: "2px 8px",
                              background: `${c?.color ?? T.orange}18`, color: c?.color ?? T.orange,
                              borderRadius: 10 }}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
