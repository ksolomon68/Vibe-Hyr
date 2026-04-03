"use client";

// components/community/BridgeForum.tsx
//
// The Bridge Forum — four isolated vertical cohort spaces.
//
// Cohort isolation:
//   - Users see and post only in their own vertical cohort space.
//   - Super admins can switch between all four spaces.
//   - RLS on bridge_forum_posts enforces this at the database level.
//     The client filters match for UX; the DB is authoritative.
//
// Verticals:
//   personal   → Personal Reality Architects
//   educator   → Educators' Bridge
//   business   → Business Reality Lab
//   leadership → Leadership Circle
//
// Post types map to curriculum concepts across all verticals:
//   bridge_win           → Bridge of Incidents win
//   accountability_update → Commitment follow-through / clean miss
//   insight              → Any curriculum reflection
//   question             → Ask the cohort or Reality Architects

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const T = {
  orange: "#E8621A", gold: "#C9A84C", dark: "#0E0C08", darkMid: "#1A1208",
  panel: "#141008", card: "#1E1610", border: "#2E2416",
  gray: "#E2D9C8", muted: "#A39785", cream: "#F7F2EA",
  white: "#FFFFFF", teal: "#0F505A", purple: "#A855F7",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type AccountVertical = "personal" | "educator" | "business" | "leadership";
type PostType = "bridge_win" | "accountability_update" | "insight" | "question";

interface ForumSpace {
  vertical_cohort: AccountVertical;
  space_name: string;
  tag: string;
  description: string;
  weekly_prompt: string | null;
}

interface Post {
  id: string;
  user_id: string;
  track_id?: string;
  vertical_cohort: AccountVertical;
  title: string;
  body: string;
  post_type: PostType;
  upvotes: number;
  reply_count: number;
  is_pinned: boolean;
  created_at: string;
  profiles?: { display_name?: string; avatar_url?: string };
}

// ─── Config ───────────────────────────────────────────────────────────────────
const POST_TYPE_CONFIG: Record<PostType, { label: string; icon: string; color: string; placeholder: string }> = {
  bridge_win: {
    label: "Bridge Moment",
    icon: "✦",
    color: T.teal,
    placeholder: "Describe the incident — however small it seemed. What internal shift might it be echoing?",
  },
  accountability_update: {
    label: "Accountability Update",
    icon: "◻",
    color: "#22C55E",
    placeholder: "Commitment: ___ | What happened: ___ | Revised commitment: ___ OR I followed through on ___",
  },
  insight: {
    label: "Insight",
    icon: "◈",
    color: T.gold,
    placeholder: "Share a realization from the curriculum, practice, or your plan that others might benefit from.",
  },
  question: {
    label: "Question",
    icon: "?",
    color: T.orange,
    placeholder: "What are you working through? What would clarity from the cohort or a Reality Architect shift for you?",
  },
};

// Track/content filters per vertical
const VERTICAL_FILTERS: Record<AccountVertical, Array<{ id: string; label: string }>> = {
  personal: [
    { id: "all", label: "All Courses" },
    { id: "c1",  label: "Course 1" },
    { id: "c2",  label: "Course 2" },
    { id: "c3",  label: "Course 3" },
    { id: "c4",  label: "Course 4" },
  ],
  educator: [
    { id: "all", label: "All Programs" },
    { id: "p1",  label: "Program 1" },
    { id: "p2",  label: "Program 2" },
    { id: "p3",  label: "Program 3" },
    { id: "p4",  label: "Program 4" },
  ],
  business: [
    { id: "all", label: "All Tracks" },
    { id: "t1",  label: "Track 01" },
    { id: "t2",  label: "Track 02" },
    { id: "t3",  label: "Track 03" },
    { id: "t4",  label: "Track 04" },
  ],
  leadership: [
    { id: "all", label: "All Courses" },
    { id: "c1",  label: "Course 1" },
    { id: "c2",  label: "Course 2" },
    { id: "c3",  label: "Course 3" },
    { id: "c4",  label: "Course 4" },
  ],
};

const VERTICAL_LABELS: Record<AccountVertical, string> = {
  personal:   "Personal Reality Architects",
  educator:   "Educators' Bridge",
  business:   "Business Reality Lab",
  leadership: "Leadership Circle",
};

const VERTICAL_COLORS: Record<AccountVertical, string> = {
  personal:   T.orange,
  educator:   T.purple,
  business:   T.gold,
  leadership: T.teal,
};

const ALL_VERTICALS: AccountVertical[] = ["personal", "educator", "business", "leadership"];

// ─── Props ────────────────────────────────────────────────────────────────────
interface BridgeForumProps {
  defaultTrack?: string;
  compact?: boolean;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BridgeForum({ defaultTrack = "all", compact = false }: BridgeForumProps) {
  const supabase = createClient();

  // Auth / profile state
  const [userId,       setUserId]       = useState<string | null>(null);
  const [userVertical, setUserVertical] = useState<AccountVertical>("personal");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Active cohort (super admin can switch; normal users are locked to their vertical)
  const [activeCohort, setActiveCohort] = useState<AccountVertical>("personal");
  const [spaceInfo,    setSpaceInfo]    = useState<ForumSpace | null>(null);

  // Feed state
  const [posts,       setPosts]       = useState<Post[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [trackFilter, setTrackFilter] = useState(defaultTrack);
  const [view,        setView]        = useState<"feed" | "compose">("feed");

  // Compose state
  const [postType,  setPostType]  = useState<PostType>("bridge_win");
  const [postTitle, setPostTitle] = useState("");
  const [postBody,  setPostBody]  = useState("");
  const [postTrack, setPostTrack] = useState("");
  const [posting,   setPosting]   = useState(false);
  const [posted,    setPosted]    = useState(false);

  // ── Load user profile ────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("account_vertical, is_super_admin")
        .eq("id", user.id)
        .single();

      const vertical = (profile?.account_vertical ?? "personal") as AccountVertical;
      const superAdmin = profile?.is_super_admin ?? false;

      setUserVertical(vertical);
      setIsSuperAdmin(superAdmin);
      setActiveCohort(vertical); // start in the user's own space
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load space info when activeCohort changes ────────────────────────────────
  useEffect(() => {
    async function loadSpace() {
      const { data } = await supabase
        .from("forum_spaces")
        .select("*")
        .eq("vertical_cohort", activeCohort)
        .single();
      setSpaceInfo(data as ForumSpace | null);
    }
    if (userId || !loading) loadSpace();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCohort]);

  // ── Load posts ───────────────────────────────────────────────────────────────
  const loadPosts = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("bridge_forum_posts")
      .select("*, profiles(display_name, avatar_url)")
      .eq("vertical_cohort", activeCohort)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(compact ? 8 : 40);

    if (trackFilter !== "all") query = query.eq("track_id", trackFilter);

    const { data } = await query;
    setPosts((data as Post[]) ?? []);
    setLoading(false);
  }, [activeCohort, trackFilter, compact, supabase]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Reset track filter when cohort changes
  useEffect(() => {
    setTrackFilter("all");
  }, [activeCohort]);

  // ── Submit post ──────────────────────────────────────────────────────────────
  async function handlePost() {
    if (!postTitle.trim() || !postBody.trim() || !userId) return;
    setPosting(true);

    const { data, error } = await supabase.from("bridge_forum_posts").insert({
      user_id:         userId,
      track_id:        postTrack || null,
      title:           postTitle.trim(),
      body:            postBody.trim(),
      post_type:       postType,
      vertical_cohort: activeCohort,
    }).select("*, profiles(display_name, avatar_url)").single();

    setPosting(false);

    if (!error && data) {
      setPosts(prev => [data as Post, ...prev]);
      setPostTitle("");
      setPostBody("");
      setPosted(true);
      setTimeout(() => { setPosted(false); setView("feed"); }, 1800);
    }
  }

  // ── Upvote ───────────────────────────────────────────────────────────────────
  async function handleUpvote(post: Post) {
    if (!userId) return;
    const newCount = post.upvotes + 1;
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, upvotes: newCount } : p));
    await supabase.from("bridge_forum_posts").update({ upvotes: newCount }).eq("id", post.id);
  }

  function timeAgo(iso: string) {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  const typeOrder: PostType[] = ["bridge_win", "insight", "accountability_update", "question"];
  const cohortColor  = VERTICAL_COLORS[activeCohort];
  const cohortFilters = VERTICAL_FILTERS[activeCohort];

  return (
    <div style={{
      background: T.dark, color: T.cream,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      borderRadius: compact ? 12 : 0,
      border: compact ? `1px solid ${T.border}` : "none",
      overflow: "hidden",
    }}>

      {/* ── Super Admin: cohort space switcher ────────────────────────────────── */}
      {isSuperAdmin && !compact && (
        <div style={{
          padding: "10px 32px",
          background: T.darkMid,
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 9, letterSpacing: "0.18em", fontWeight: 700, color: T.muted }}>
            ✦ SUPER ADMIN — VIEWING COHORT:
          </span>
          {ALL_VERTICALS.map(v => (
            <button
              key={v}
              onClick={() => setActiveCohort(v)}
              style={{
                padding: "4px 12px", borderRadius: 14,
                border: `1px solid ${activeCohort === v ? VERTICAL_COLORS[v] : T.border}`,
                background: activeCohort === v ? `${VERTICAL_COLORS[v]}22` : "transparent",
                color: activeCohort === v ? VERTICAL_COLORS[v] : T.muted,
                fontSize: 10, fontWeight: 700, cursor: "pointer",
                letterSpacing: "0.08em",
              }}
            >
              {VERTICAL_LABELS[v]}
            </button>
          ))}
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div style={{
        padding: compact ? "16px 16px 12px" : "24px 32px 0",
        borderBottom: `1px solid ${T.border}`,
        paddingBottom: compact ? 12 : 18,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            {/* Cohort tag */}
            {!compact && (
              <div style={{
                fontSize: 9, letterSpacing: "0.2em", fontWeight: 700,
                color: cohortColor, marginBottom: 4,
              }}>
                ✦ {spaceInfo?.tag?.toUpperCase() ?? activeCohort.toUpperCase()}
              </div>
            )}
            <h3 style={{
              margin: 0, fontSize: compact ? 16 : 20, fontWeight: 800, color: T.cream,
              fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.06em",
            }}>
              {compact ? "BRIDGE FORUM" : (spaceInfo?.space_name ?? VERTICAL_LABELS[activeCohort]).toUpperCase()}
            </h3>
            {!compact && (
              <p style={{ margin: "3px 0 0", fontSize: 11, color: T.muted }}>
                {spaceInfo?.description ?? "Share Bridge Moments, accountability updates, and insights with your cohort."}
              </p>
            )}
          </div>
          <button
            onClick={() => setView(view === "compose" ? "feed" : "compose")}
            disabled={!userId}
            style={{
              padding: "8px 18px",
              background: view === "compose" ? T.card : cohortColor,
              color: T.white,
              border: `1px solid ${view === "compose" ? T.border : "transparent"}`,
              borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: userId ? "pointer" : "not-allowed",
              letterSpacing: "0.08em", opacity: userId ? 1 : 0.4,
            }}
          >
            {view === "compose" ? "← FEED" : "+ POST"}
          </button>
        </div>

        {/* Weekly prompt banner */}
        {!compact && spaceInfo?.weekly_prompt && view === "feed" && (
          <div style={{
            marginBottom: 14,
            padding: "10px 14px",
            background: `${cohortColor}12`,
            border: `1px solid ${cohortColor}30`,
            borderRadius: 8,
          }}>
            <span style={{ fontSize: 9, letterSpacing: "0.18em", fontWeight: 700, color: cohortColor }}>
              ✦ THIS WEEK — {" "}
            </span>
            <span style={{ fontSize: 11, color: T.gray, fontStyle: "italic" }}>
              {spaceInfo.weekly_prompt}
            </span>
          </div>
        )}

        {/* Track/content filter */}
        {view === "feed" && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {cohortFilters.map(f => (
              <button key={f.id} onClick={() => setTrackFilter(f.id)}
                style={{
                  padding: "5px 12px", borderRadius: 14,
                  border: `1px solid ${trackFilter === f.id ? cohortColor : T.border}`,
                  background: trackFilter === f.id ? `${cohortColor}22` : "transparent",
                  color: trackFilter === f.id ? cohortColor : T.muted,
                  fontSize: 10, fontWeight: 600, cursor: "pointer",
                }}>
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {view === "compose" ? (
          <motion.div key="compose" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} style={{ padding: compact ? "16px" : "24px 32px" }}>

            {/* Cohort context reminder */}
            {!compact && (
              <div style={{
                marginBottom: 18, padding: "8px 14px",
                background: `${cohortColor}12`,
                border: `1px solid ${cohortColor}30`,
                borderRadius: 8,
                fontSize: 11, color: T.muted,
              }}>
                <span style={{ color: cohortColor, fontWeight: 700 }}>
                  {spaceInfo?.space_name ?? VERTICAL_LABELS[activeCohort]}
                </span>
                {" "}— Only members of your cohort will see this post.
              </div>
            )}

            {/* Post type */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", fontWeight: 700, color: T.muted, marginBottom: 8 }}>
                POST TYPE
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {typeOrder.map(t => {
                  const c = POST_TYPE_CONFIG[t];
                  const active = postType === t;
                  return (
                    <button key={t} onClick={() => setPostType(t)}
                      style={{
                        padding: "6px 14px", borderRadius: 18,
                        border: `1px solid ${active ? c.color : T.border}`,
                        background: active ? `${c.color}22` : "transparent",
                        color: active ? c.color : T.muted,
                        fontSize: 11, fontWeight: 600, cursor: "pointer",
                      }}>
                      {c.icon} {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content / track tag */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", fontWeight: 700, color: T.muted, marginBottom: 8 }}>
                TAG CONTENT (optional)
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {cohortFilters.filter(f => f.id !== "all").map(f => (
                  <button key={f.id} onClick={() => setPostTrack(postTrack === f.id ? "" : f.id)}
                    style={{
                      padding: "5px 12px", borderRadius: 12,
                      border: `1px solid ${postTrack === f.id ? T.gold : T.border}`,
                      background: postTrack === f.id ? `${T.gold}22` : "transparent",
                      color: postTrack === f.id ? T.gold : T.muted,
                      fontSize: 10, fontWeight: 600, cursor: "pointer",
                    }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <input
              value={postTitle}
              onChange={e => setPostTitle(e.target.value)}
              placeholder="Title — brief and specific"
              maxLength={120}
              style={{
                width: "100%", background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 8, padding: "12px 16px", color: T.cream, fontSize: 14,
                fontFamily: "'DM Sans', sans-serif", outline: "none", marginBottom: 10,
                boxSizing: "border-box",
              }}
              onFocus={e => { e.target.style.borderColor = POST_TYPE_CONFIG[postType].color; }}
              onBlur={e => { e.target.style.borderColor = T.border; }}
            />

            {/* Body */}
            <textarea
              value={postBody}
              onChange={e => setPostBody(e.target.value)}
              placeholder={POST_TYPE_CONFIG[postType].placeholder}
              rows={5}
              style={{
                width: "100%", background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 8, padding: "12px 16px", color: T.cream, fontSize: 13,
                fontFamily: "'DM Sans', sans-serif", lineHeight: 1.65, resize: "vertical",
                outline: "none", marginBottom: 16, boxSizing: "border-box",
              }}
              onFocus={e => { e.target.style.borderColor = POST_TYPE_CONFIG[postType].color; }}
              onBlur={e => { e.target.style.borderColor = T.border; }}
            />

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={handlePost}
                disabled={!postTitle.trim() || !postBody.trim() || posting || !userId}
                style={{
                  padding: "11px 26px", background: cohortColor, color: T.white,
                  border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12,
                  cursor: "pointer", letterSpacing: "0.08em",
                  opacity: (!postTitle.trim() || !postBody.trim() || posting) ? 0.5 : 1,
                }}>
                {posting ? "POSTING..." : posted ? "✓ POSTED" : "SHARE WITH COHORT"}
              </button>
              <span style={{ fontSize: 11, color: T.muted }}>
                Visible only to {spaceInfo?.space_name ?? VERTICAL_LABELS[activeCohort]} members
              </span>
            </div>
          </motion.div>

        ) : (
          <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              padding: compact ? "12px 16px" : "20px 32px",
              maxHeight: compact ? 480 : "calc(100vh - 240px)",
              overflow: "auto",
            }}>

            {loading ? (
              <div style={{ padding: "24px 0", textAlign: "center", color: T.muted, fontSize: 12 }}>
                Loading the forum...
              </div>
            ) : !userId ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 28, marginBottom: 12, color: cohortColor }}>✦</div>
                <p style={{ color: T.muted, fontSize: 13 }}>
                  Sign in to access your cohort space.
                </p>
              </div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 28, marginBottom: 12, color: cohortColor }}>✦</div>
                <p style={{ color: T.muted, fontSize: 13 }}>
                  No posts yet{trackFilter !== "all" ? ` for this filter` : ""} in{" "}
                  <strong style={{ color: cohortColor }}>
                    {spaceInfo?.space_name ?? VERTICAL_LABELS[activeCohort]}
                  </strong>. Be the first to share a Bridge Moment.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {posts.map((post, i) => {
                  const c = POST_TYPE_CONFIG[post.post_type as PostType];
                  return (
                    <motion.div key={post.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{
                        background: post.is_pinned ? T.card : T.panel,
                        border: `1px solid ${post.is_pinned ? cohortColor + "66" : T.border}`,
                        borderRadius: 12, padding: "16px 20px",
                      }}>

                      {/* Post header */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: c?.color ?? cohortColor, letterSpacing: "0.1em" }}>
                          {c?.icon} {c?.label}
                        </span>
                        {post.track_id && post.track_id !== "all" && (
                          <span style={{
                            fontSize: 9, padding: "2px 7px",
                            background: `${T.gold}22`, color: T.gold,
                            borderRadius: 8, fontWeight: 700,
                          }}>
                            {cohortFilters.find(f => f.id === post.track_id)?.label ?? post.track_id.toUpperCase()}
                          </span>
                        )}
                        {post.is_pinned && (
                          <span style={{
                            fontSize: 9, padding: "2px 7px",
                            background: `${cohortColor}22`, color: cohortColor,
                            borderRadius: 8, fontWeight: 700,
                          }}>
                            PINNED
                          </span>
                        )}
                        <span style={{ marginLeft: "auto", fontSize: 10, color: T.muted }}>
                          {timeAgo(post.created_at)}
                        </span>
                      </div>

                      <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: T.cream }}>
                        {post.title}
                      </h4>
                      <p style={{
                        margin: "0 0 12px", fontSize: 13, color: T.gray, lineHeight: 1.6,
                        display: "-webkit-box", WebkitLineClamp: compact ? 2 : 4,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {post.body}
                      </p>

                      {/* Actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <button onClick={() => handleUpvote(post)}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: T.muted, fontSize: 12, display: "flex", alignItems: "center", gap: 4,
                            padding: 0,
                          }}>
                          ▲ <span style={{ color: cohortColor }}>{post.upvotes}</span>
                        </button>
                        <span style={{ fontSize: 11, color: T.muted }}>
                          ◻ {post.reply_count} replies
                        </span>
                        {post.profiles?.display_name && (
                          <span style={{ marginLeft: "auto", fontSize: 10, color: T.muted }}>
                            {post.profiles.display_name}
                          </span>
                        )}
                      </div>
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
