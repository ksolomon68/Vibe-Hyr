"use client";

import { useState, ReactNode, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerTopbar } from "@/components/shared/PlayerTopbar";
import { PlayerVideoPlaceholder } from "@/components/shared/PlayerVideoPlaceholder";
import { PlayerNav } from "@/components/shared/PlayerNav";
import { AssumptionLab } from "@/components/shared/AssumptionLab";
import { useLessonNotes } from "@/hooks/useLessonNotes";
import { Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TRACKS, Track, Lesson, QuizQuestion } from "@/lib/business/curriculum";

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const T = {
  orange:  "#E8621A",
  gold:    "#C9A84C",
  dark:    "#0E0C08",
  darkMid: "#1A1208",
  panel:   "#141008",
  card:    "#1E1610",
  border:  "#2E2416",
  gray:    "#E2D9C8",
  muted:   "#A39785",
  cream:   "#F7F2EA",
  white:   "#FFFFFF",
  teal:    "#0F505A",
  purple:  "#A855F7",
  green:   "#22C55E",
  red:     "#EF4444",
};

// ─── Props ─────────────────────────────────────────────────────────────────────
export interface WorkplaceLessonPlayerProps {
  initialTrackId?: string;
  initialLessonId?: string;
  externalProgress?: Record<string, string[]>;
  allowedTracks?: string[];
  onLessonComplete?: (trackId: string, lessonId: string) => void;
  onNavigate?: (trackId: string, lessonId: string) => void;
  userTier?: string;
}

// ─── Progress ring ─────────────────────────────────────────────────────────────
function ProgressRing({
  progress, size = 36, stroke = 3, color = T.orange,
}: { progress: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * progress;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.border} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.4s ease" }} />
    </svg>
  );
}

// ─── Quiz component ────────────────────────────────────────────────────────────
function QuizGate({
  questions, color, onPass,
}: { questions: QuizQuestion[]; color: string; onPass: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  function submit() {
    let s = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correct) s++; });
    setScore(s);
    setSubmitted(true);
    if (s === questions.length) {
      setTimeout(onPass, 1400);
    }
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  }

  const passed = submitted && score === questions.length;
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div style={{ padding: "24px 28px", background: T.card, borderRadius: 12,
      border: `1px solid ${T.border}` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: "0.14em", marginBottom: 18 }}>
        MODULE QUIZ — PASS TO COMPLETE
      </div>

      {questions.map((q, qi) => (
        <div key={qi} style={{ marginBottom: 22 }}>
          <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: T.cream, lineHeight: 1.5 }}>
            {qi + 1}. {q.q}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi;
              let bg = selected ? `${color}22` : "transparent";
              let borderColor = selected ? color : T.border;
              let textColor = selected ? color : T.gray;
              if (submitted) {
                if (oi === q.correct) { bg = "#22C55E22"; borderColor = "#22C55E"; textColor = "#22C55E"; }
                else if (selected && oi !== q.correct) { bg = "#EF444422"; borderColor = "#EF4444"; textColor = "#EF4444"; }
              }
              return (
                <button key={oi} disabled={submitted}
                  onClick={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                    borderRadius: 8, border: `1px solid ${borderColor}`, background: bg,
                    color: textColor, fontSize: 13, cursor: submitted ? "default" : "pointer",
                    textAlign: "left", transition: "all 0.12s",
                  }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%",
                    border: `1.5px solid ${borderColor}`, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 10, flexShrink: 0 }}>
                    {submitted && oi === q.correct ? "✓" : submitted && selected ? "✗" : String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!submitted ? (
        <button onClick={submit} disabled={!allAnswered}
          style={{
            padding: "11px 28px", background: allAnswered ? color : T.muted,
            color: T.white, border: "none", borderRadius: 8, fontWeight: 700,
            fontSize: 12, cursor: allAnswered ? "pointer" : "not-allowed",
            letterSpacing: "0.1em",
          }}>
          SUBMIT ANSWERS
        </button>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {passed ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ fontSize: 13, fontWeight: 700, color: T.green, letterSpacing: "0.08em" }}>
              ✓ PASSED — {score}/{questions.length} correct. Marking complete...
            </motion.div>
          ) : (
            <>
              <span style={{ fontSize: 13, color: T.red, fontWeight: 700 }}>
                {score}/{questions.length} correct — review and retry
              </span>
              <button onClick={reset}
                style={{ padding: "9px 20px", background: T.card, border: `1px solid ${T.border}`,
                  color: T.gray, borderRadius: 8, fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
                RETRY
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main player ───────────────────────────────────────────────────────────────
export default function WorkplaceLessonPlayer({
  initialTrackId = "t1",
  initialLessonId = "t1l1",
  externalProgress = {},
  allowedTracks = ["t1"],
  onLessonComplete,
  onNavigate,
  userTier = "seeker",
}: WorkplaceLessonPlayerProps) {
  const [activeTrackId, setActiveTrackId] = useState(initialTrackId);
  const [activeLessonId, setActiveLessonId] = useState(initialLessonId);
  const [completedMap, setCompletedMap] = useState<Record<string, string[]>>(externalProgress);
  const [quizPassed, setQuizPassed] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, []);
  const [activeTab, setActiveTab] = useState<"lesson" | "notes">("lesson");
  const [tab, setTab] = useState<"content" | "quiz">("content");

  const { content: notes, handleChange: handleNotesChange, saving: notesSaving, saved: notesSaved } = useLessonNotes(activeLessonId);

  // Sync external progress
  useEffect(() => { setCompletedMap(externalProgress); }, [externalProgress]);

  const activeTrack = TRACKS.find(t => t.id === activeTrackId) ?? TRACKS[0];
  const activeLesson = activeTrack.lessons.find(l => l.id === activeLessonId) ?? activeTrack.lessons[0];
  const isCompleted = (tid: string, lid: string) => completedMap[tid]?.includes(lid) ?? false;
  const trackProgress = (tid: string) => {
    const track = TRACKS.find(t => t.id === tid);
    if (!track) return 0;
    const done = completedMap[tid]?.length ?? 0;
    return done / track.lessons.length;
  };

  function navigate(trackId: string, lessonId: string) {
    setActiveTrackId(trackId);
    setActiveLessonId(lessonId);
    setTab("content");
    if (window.innerWidth < 1024) setSidebarOpen(false);
    onNavigate?.(trackId, lessonId);
  }

  function handleComplete() {
    if (isCompleted(activeTrackId, activeLessonId)) return;
    setCompletedMap(prev => ({
      ...prev,
      [activeTrackId]: [...(prev[activeTrackId] ?? []), activeLessonId],
    }));
    onLessonComplete?.(activeTrackId, activeLessonId);

    // Auto-advance to next lesson
    const lessonIdx = activeTrack.lessons.findIndex(l => l.id === activeLessonId);
    const next = activeTrack.lessons[lessonIdx + 1];
    if (next) setTimeout(() => navigate(activeTrackId, next.id), 600);
  }

  function handleQuizPass() {
    setQuizPassed(prev => ({ ...prev, [activeLessonId]: true }));
    handleComplete();
  }

  const hasQuiz = activeLesson.quiz.length > 0;
  const alreadyCompleted = isCompleted(activeTrackId, activeLessonId);

  return (
    <div style={{
      display: "flex", height: "100vh", background: T.dark, color: T.cream,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif", overflow: "hidden",
      flexDirection: "row-reverse"
    }}>
      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: 320, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }} transition={{ duration: 0.2 }}
            style={{
              width: 320, background: T.darkMid, borderLeft: `1px solid ${T.border}`,
              display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto",
              position: "relative", zIndex: 40
            }}>
            {/* Logo */}
            <div style={{ padding: "24px 24px 20px", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: T.orange,
                fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.1em" }}>
                VIBE HYR
              </div>
              <div style={{ fontSize: 10, color: T.muted, letterSpacing: "0.16em", marginTop: 2, fontWeight: 700 }}>
                BUSINESS TRAINING SERIES
              </div>
            </div>

            {/* Track list */}
            <div style={{ padding: "16px 0", flex: 1 }}>
              {TRACKS.map(track => {
                const locked = !allowedTracks.includes(track.id);
                const prog = trackProgress(track.id);
                const activeT = track.id === activeTrackId;

                return (
                  <div key={track.id} style={{ marginBottom: 4 }}>
                    {/* Track header */}
                    <button
                      onClick={() => !locked && navigate(track.id, track.lessons[0].id)}
                      disabled={locked}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 20px", background: activeT ? `${track.color}10` : "transparent",
                        border: "none", cursor: locked ? "not-allowed" : "pointer",
                        borderLeft: `3px solid ${activeT ? track.color : "transparent"}`,
                        transition: "all 0.15s",
                      }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <ProgressRing progress={prog} size={34} stroke={2.5} color={track.color} />
                        <span style={{
                          position: "absolute", inset: 0, display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 9, fontWeight: 800,
                          color: locked ? T.muted : track.color,
                        }}>
                          {locked ? "🔒" : `${Math.round(prog * 100)}%`}
                        </span>
                      </div>
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div style={{ fontSize: 9, letterSpacing: "0.12em", fontWeight: 800,
                          color: locked ? T.muted : track.color, textTransform: "uppercase" }}>
                          TRACK {track.num} · {track.tag}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: locked ? T.muted : T.cream,
                          lineHeight: 1.3, marginTop: 2 }}>
                          {track.title}
                        </div>
                      </div>
                    </button>

                    {/* Lesson list (expanded when track active) */}
                    {activeT && (
                      <div style={{ paddingLeft: 64, marginTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>
                        {track.lessons.map(lesson => {
                          const done = isCompleted(track.id, lesson.id);
                          const active = lesson.id === activeLessonId;
                          return (
                            <button key={lesson.id}
                              onClick={() => navigate(track.id, lesson.id)}
                              style={{
                                width: "100%", display: "flex", alignItems: "center", gap: 10,
                                padding: "8px 12px 8px 0", background: "transparent", border: "none",
                                cursor: "pointer", textAlign: "left",
                                borderLeft: `2px solid ${active ? track.color : "transparent"}`,
                                paddingLeft: 12,
                              }}>
                              <span style={{
                                width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                                background: done ? track.color : "transparent",
                                border: `1.5px solid ${done ? track.color : active ? track.color : T.border}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 9, color: T.dark, fontWeight: 800
                              }}>
                                {done ? "✓" : ""}
                              </span>
                              <span style={{
                                fontSize: 13, color: active ? T.cream : done ? T.gray : T.muted,
                                fontWeight: active ? 600 : 400, lineHeight: 1.4,
                              }}>
                                {lesson.isLive && <span style={{ color: T.orange }}>⚡ </span>}
                                {lesson.num}. {lesson.title}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tier badge */}
            <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.border}`,
              fontSize: 10, letterSpacing: "0.14em", color: T.muted, textTransform: "uppercase" }}>
              Access: <span style={{ color: T.gold, fontWeight: 800 }}>{userTier.replace("_", " ")}</span>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <PlayerTopbar
          vertical="business"
          verticalLabel="BUSINESS"
          contentTitle={activeTrack.title}
          completionPct={Math.round(trackProgress(activeTrack.id) * 100)}
          onToggleSidebar={() => setSidebarOpen(o => !o)}
          breadcrumb={{
            label: "Business",
            href: "/business"
          }}
        />

        {/* Tab System */}
        <div style={{ 
          background: T.darkMid, 
          borderBottom: `1px solid ${T.border}`,
          padding: "0 40px",
          display: "flex",
          gap: 32
        }}>
          {(["lesson", "notes"] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                padding: "16px 0",
                background: "none",
                border: "none",
                color: activeTab === t ? T.orange : T.muted,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer",
                position: "relative",
                transition: "color 0.2s"
              }}
            >
              {t === "lesson" ? "The Lesson" : "My Notes"}
              {activeTab === t && (
                <motion.div
                  layoutId="activeTabUnderline"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: T.orange
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <AnimatePresence mode="wait">
            {activeTab === 'lesson' ? (
              <motion.div
                key="lesson"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ width: "100%" }}
              >
          {/* Video Placeholder at the top */}
          <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto", padding: "0 40px", marginTop: 40 }}>
             <PlayerVideoPlaceholder duration={activeLesson.duration} />
          </div>
          {/* Lesson header */}
          <div style={{
            padding: "32px 40px 28px",
            background: `linear-gradient(135deg, ${T.darkMid} 0%, ${T.dark} 100%)`,
            borderBottom: `1px solid ${T.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: activeTrack.color,
                letterSpacing: "0.16em", background: `${activeTrack.color}18`,
                padding: "3px 10px", borderRadius: 10 }}>
                {activeTrack.tag.toUpperCase()}
              </span>
              {activeLesson.isLive && (
                <span style={{ fontSize: 9, fontWeight: 700, color: T.orange,
                  background: `${T.orange}18`, padding: "3px 10px", borderRadius: 10,
                  letterSpacing: "0.1em" }}>
                  ⚡ LIVE SESSION
                </span>
              )}
              <span style={{ fontSize: 10, color: T.muted, marginLeft: "auto" }}>
                Module {activeLesson.num} of {activeTrack.lessons.length}
              </span>
            </div>

            <h1 style={{ margin: "0 0 10px", fontSize: "clamp(24px, 3vw, 36px)",
              fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em",
              fontWeight: 400, color: T.cream, lineHeight: 1.1 }}>
              {activeLesson.title}
            </h1>
            <p style={{ margin: 0, fontSize: 16, color: T.gray, lineHeight: 1.6, maxWidth: 640 }}>
              {activeLesson.description}
            </p>

            {/* Objectives */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.16em", color: T.muted,
                fontWeight: 700, marginBottom: 10 }}>LEARNING OBJECTIVES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {activeLesson.objectives.map((obj, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: activeTrack.color, fontSize: 12, lineHeight: 1.6,
                      flexShrink: 0 }}>◈</span>
                    <span style={{ fontSize: 15, color: T.gray, lineHeight: 1.6 }}>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs (content / quiz) */}
          {hasQuiz && (
            <div style={{ display: "flex", gap: 0, padding: "0 40px",
              borderBottom: `1px solid ${T.border}`, background: T.darkMid }}>
              {(["content", "quiz"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{
                    padding: "12px 20px", background: "none", border: "none",
                    borderBottom: `2px solid ${tab === t ? activeTrack.color : "transparent"}`,
                    color: tab === t ? T.cream : T.muted, fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.15s",
                    textTransform: "uppercase",
                  }}>
                  {t === "content" ? "📖 Module Content" : "✦ Quiz Gate"}
                </button>
              ))}
            </div>
          )}

          {/* Body */}
          <div style={{ padding: "32px 40px", maxWidth: 800 }}>
            <AnimatePresence mode="wait">
              {tab === "content" ? (
                <motion.div key="content" initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                  {/* Content blocks */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
                    {activeLesson.content.map((block, i) => (
                      <p key={i} style={{ margin: 0, fontSize: 17, color: T.gray,
                        lineHeight: 1.8, borderLeft: i === 0 ? `3px solid ${activeTrack.color}` : "none",
                        paddingLeft: i === 0 ? 18 : 0, fontStyle: i === 0 ? "italic" : "normal" }}>
                        {block}
                      </p>
                    ))}
                  </div>

                  {/* Tool / worksheet / Assumption Lab */}
                  {activeLesson.id === 'the-awareness-gap' ? (
                    <div className="my-12">
                      <AssumptionLab 
                        title="Awareness Gap Audit"
                        subtitle="Impact vs. Intent"
                        scenario="You gave 'direct feedback' to a subordinate, intending to be helpful. The subordinate seems crushed and has withdrawn for the rest of the day."
                        prompt="What 'threat signal' were you potentially broadcasting (tone, pace, posture) that you weren't aware of in the moment?"
                        accentColor={T.orange}
                        onComplete={handleComplete}
                      />
                    </div>
                  ) : activeLesson.id === 'the-reactivity-spectrum' ? (
                    <div className="my-12">
                      <AssumptionLab 
                        title="Reactivity Spectrum"
                        subtitle="The Sovereign Interrupt"
                        scenario="A disrespectful or accusatory email from a client or peer just arrived in your inbox. You feel your face heat up and your jaw tighten."
                        prompt="What is your pre-programmed (reactive) response sequence, and what is the 'Sovereign' interrupt you will apply right now?"
                        accentColor={T.gold}
                        onComplete={handleComplete}
                      />
                    </div>
                  ) : activeTrackId === "know-yourself-lead-yourself" && activeLesson.tool ? (
                    <div className="my-12">
                      <AssumptionLab 
                        title="Assumption Audit"
                        subtitle={activeLesson.tool}
                        prompt={`In the context of ${activeLesson.title}, examine your current assumption: "${activeLesson.objectives[0]}". How would your behavior shift if you assumed the opposite were true?`}
                        accentColor={T.purple}
                        onComplete={handleComplete}
                      />
                    </div>
                  ) : activeLesson.tool && (
                    <div style={{
                      background: `${activeTrack.color}0F`,
                      border: `1px solid ${activeTrack.color}44`,
                      borderRadius: 10, padding: "16px 20px", marginBottom: 28,
                    }}>
                      <div style={{ fontSize: 9, letterSpacing: "0.16em", fontWeight: 700,
                        color: activeTrack.color, marginBottom: 4 }}>MODULE TOOL</div>
                      <div style={{ fontSize: 13, color: T.cream, fontWeight: 600 }}>
                        {activeLesson.tool}
                      </div>
                      <p style={{ margin: "6px 0 0", fontSize: 12, color: T.gray }}>
                        Download or access in your workbook. Complete before the next module.
                      </p>
                    </div>
                  )}

                  {/* Live session booking */}
                  {activeLesson.isLive && (
                    <div style={{
                      background: `${T.orange}12`,
                      border: `1px solid ${T.orange}55`,
                      borderRadius: 12, padding: "20px 24px", marginBottom: 28,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.orange,
                        letterSpacing: "0.1em", marginBottom: 8 }}>⚡ LIVE SESSION REQUIRED</div>
                      <p style={{ margin: "0 0 14px", fontSize: 13, color: T.gray, lineHeight: 1.6 }}>
                        This module is a live facilitated session. Book your spot to complete this track.
                      </p>
                      <button style={{
                        padding: "10px 24px", background: T.orange, color: T.white,
                        border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12,
                        cursor: "pointer", letterSpacing: "0.08em",
                      }}
                        onClick={() => window.open("#book-live-session", "_blank")}>
                        BOOK SESSION →
                      </button>
                    </div>
                  )}

                  {/* Complete button */}
                  {!hasQuiz && (
                    <button
                      onClick={alreadyCompleted ? undefined : handleComplete}
                      style={{
                        padding: "13px 32px",
                        background: alreadyCompleted ? "#22C55E22" : activeTrack.color,
                        color: alreadyCompleted ? T.green : T.white,
                        border: `1px solid ${alreadyCompleted ? "#22C55E" : activeTrack.color}`,
                        borderRadius: 10, fontWeight: 700, fontSize: 13,
                        cursor: alreadyCompleted ? "default" : "pointer",
                        letterSpacing: "0.08em", transition: "all 0.2s",
                      }}>
                      {alreadyCompleted ? "✓ MODULE COMPLETE" : "MARK COMPLETE & CONTINUE →"}
                    </button>
                  )}

                  {hasQuiz && !alreadyCompleted && (
                    <button onClick={() => setTab("quiz")}
                      style={{
                        padding: "13px 32px", background: "transparent",
                        border: `1px solid ${activeTrack.color}`, color: activeTrack.color,
                        borderRadius: 10, fontWeight: 700, fontSize: 13,
                        cursor: "pointer", letterSpacing: "0.08em",
                      }}>
                      TAKE QUIZ TO COMPLETE →
                    </button>
                  )}
                </motion.div>

              ) : (
                <motion.div key="quiz" initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {alreadyCompleted ? (
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
                      <p style={{ color: T.green, fontSize: 14, fontWeight: 700 }}>
                        Module already completed. Well done.
                      </p>
                    </div>
                  ) : (
                    <QuizGate
                      questions={activeLesson.quiz}
                      color={activeTrack.color}
                      onPass={handleQuizPass}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

                {/* Bottom Nav */}
                <div style={{ padding: "0 40px 80px", maxWidth: 800 }}>
                  <PlayerNav
                    hasPrev={activeTrack.lessons.findIndex(l => l.id === activeLessonId) > 0 || TRACKS.findIndex(t => t.id === activeTrackId) > 0}
                    hasNext={activeTrack.lessons.findIndex(l => l.id === activeLessonId) < activeTrack.lessons.length - 1 || TRACKS.findIndex(t => t.id === activeTrackId) < TRACKS.length - 1}
                    isComplete={alreadyCompleted}
                    mode="module"
                    onPrev={() => {
                      const lIdx = activeTrack.lessons.findIndex(l => l.id === activeLessonId);
                      if (lIdx > 0) navigate(activeTrackId, activeTrack.lessons[lIdx - 1].id);
                      else {
                        const tIdx = TRACKS.findIndex(t => t.id === activeTrackId);
                        if (tIdx > 0) navigate(TRACKS[tIdx - 1].id, TRACKS[tIdx - 1].lessons[TRACKS[tIdx-1].lessons.length - 1].id);
                      }
                    }}
                    onNext={() => {
                      const lIdx = activeTrack.lessons.findIndex(l => l.id === activeLessonId);
                      if (lIdx < activeTrack.lessons.length - 1) navigate(activeTrackId, activeTrack.lessons[lIdx + 1].id);
                      else {
                        const tIdx = TRACKS.findIndex(t => t.id === activeTrackId);
                        if (tIdx < TRACKS.length - 1) navigate(TRACKS[tIdx + 1].id, TRACKS[tIdx + 1].lessons[0].id);
                      }
                    }}
                    onComplete={handleComplete}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ padding: "48px 40px", maxWidth: 1000 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                  <div>
                    <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: "0.04em", color: T.cream, margin: 0 }}>MY WORKPLACE NOTES</h2>
                    <p style={{ fontSize: 13, color: T.gray, fontStyle: "italic", marginTop: 4 }}>Capture your reflections for: {activeLesson.title}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {notesSaving && <Loader2 size={14} className="animate-spin text-orange-500" />}
                    {notesSaved && <span style={{ fontSize: 9, fontWeight: 800, color: T.orange, letterSpacing: "0.1em" }}>SAVED TO PROFILE</span>}
                  </div>
                </div>

                <textarea
                  value={notes || ''}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="What resonated with you? How will you apply this Sovereign lesson in your workplace?..."
                  style={{
                    width: "100%",
                    minHeight: "500px",
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${T.border}`,
                    borderRadius: 16,
                    padding: "32px",
                    color: T.cream,
                    fontSize: "18px",
                    lineHeight: "1.6",
                    outline: "none",
                    fontFamily: "inherit",
                    resize: "none",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = T.orange}
                  onBlur={(e) => e.target.style.borderColor = T.border}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
