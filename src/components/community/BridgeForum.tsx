"use client";

// components/community/BridgeForum.tsx
//
// The Bridge Forum — Track 04's community layer.
// Participants share Bridge Moments, accountability updates, insights,
// and questions within their cohort or the broader Vibe Hyr community.
//
// Post types map to curriculum concepts:
//   bridge_win        → Bridge of Incidents (Track 04)
//   accountability_update → Clean Miss / commitment follow-through (Track 04)
//   insight           → Any track reflection
//   question          → Ask the community or Reality Architects

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const T = {
  orange: "#E8621A", gold: "#C9A84C", dark: "#0E0C08", darkMid: "#1A1208",
  panel: "#141008", card: "#1E1610", border: "#2E2416",
  gray: "#8C7A60", muted: "#5A4A34", cream: "#F7F2EA",
  white: "#FFFFFF", teal: "#0F505A",
};

type PostType = "bridge_win" | "accountability_update" | "insight" | "question";

interface Post {
  id: string;
  user_id: string;
  track_id?: string;
  title: string;
  body: string;
  post_type: PostType;
  upvotes: number;
  reply_count: number;
  is_pinned: boolean;
  created_at: string;
  profiles?: { display_name?: string; avatar_url?: string };
}

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
    placeholder: "Share a realization from the curriculum, practice, or your 90-day plan that others might benefit from.",
  },
  question: {
    label: "Question",
    icon: "?",
    color: T.orange,
    placeholder: "What are you working through? What would clarity from a Reality Architect or peer shift for you?",
  },
};

const TRACK_FILTERS = [
  { id: "all", label: "All Tracks" },
  { id: "t1", label: "Track 01" },
  { id: "t2", label: "Track 02" },
  { id: "t3", label: "Track 03" },
  { id: "t4", label: "Track 04" },
];

interface BridgeForumProps {
  defaultTrack?: string;
  compact?: boolean;
}

export default function BridgeForum({ defaultTrack = "all", compact = false }: BridgeForumProps) {
  const supabase = createClient();

  const [posts,       setPosts]       = useState<Post[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [userId,      setUserId]      = useState<string | null>(null);
  const [trackFilter, setTrackFilter] = useState(defaultTrack);
  const [view,        setView]        = useState<"feed" | "compose">("feed");

  // Compose state
  const [postType,  setPostType]  = useState<PostType>("bridge_win");
  const [postTitle, setPostTitle] = useState("");
  const [postBody,  setPostBody]  = useState("");
  const [postTrack, setPostTrack] = useState<string>("");
  const [posting,   setPosting]   = useState(false);
  const [posted,    setPosted]    = useState(false);

  // ── Load posts ───────────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      let query = supabase
        .from("bridge_forum_posts")
        .select("*, profiles(display_name, avatar_url)")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(compact ? 8 : 40);

      if (trackFilter !== "all") query = query.eq("track_id", trackFilter);

      const { data } = await query;
      setPosts((data as Post[]) ?? []);
      setLoading(false);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackFilter]);

  // ── Submit post ──────────────────────────────────────────────────────────────
  async function handlePost() {
    if (!postTitle.trim() || !postBody.trim() || !userId) return;
    setPosting(true);

    const { data, error } = await supabase.from("bridge_forum_posts").insert({
      user_id:   userId,
      track_id:  postTrack || null,
      title:     postTitle.trim(),
      body:      postBody.trim(),
      post_type: postType,
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

  function trackLabel(id?: string) {
    const map: Record<string, string> = { t1: "Track 01", t2: "Track 02", t3: "Track 03", t4: "Track 04" };
    return id ? map[id] : null;
  }

  const typeOrder: PostType[] = ["bridge_win", "insight", "accountability_update", "question"];

  return (
    <div style={{
      background: T.dark, color: T.cream,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      borderRadius: compact ? 12 : 0,
      border: compact ? `1px solid ${T.border}` : "none",
      overflow: "hidden",
    }}>
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div style={{
        padding: compact ? "16px 16px 12px" : "24px 32px 0",
        borderBottom: `1px solid ${T.border}`,
        paddingBottom: compact ? 12 : 18,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: compact ? 16 : 20, fontWeight: 800, color: T.cream,
              fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.06em" }}>
              THE BRIDGE FORUM
            </h3>
            {!compact && (
              <p style={{ margin: "3px 0 0", fontSize: 11, color: T.muted }}>
                Share Bridge Moments, accountability updates, and insights with your cohort.
              </p>
            )}
          </div>
          <button onClick={() => setView(view === "compose" ? "feed" : "compose")}
            style={{
              padding: "8px 18px", background: view === "compose" ? T.card : T.orange,
              color: T.white, border: `1px solid ${view === "compose" ? T.border : "transparent"}`,
              borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: "pointer",
              letterSpacing: "0.08em",
            }}>
            {view === "compose" ? "← FEED" : "+ POST"}
          </button>
        </div>

        {/* Track filter */}
        {view === "feed" && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {TRACK_FILTERS.map(f => (
              <button key={f.id} onClick={() => setTrackFilter(f.id)}
                style={{
                  padding: "5px 12px", borderRadius: 14,
                  border: `1px solid ${trackFilter === f.id ? T.orange : T.border}`,
                  background: trackFilter === f.id ? `${T.orange}22` : "transparent",
                  color: trackFilter === f.id ? T.orange : T.muted,
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

            {/* Post type */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", fontWeight: 700,
                color: T.muted, marginBottom: 8 }}>POST TYPE</div>
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

            {/* Track tag */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", fontWeight: 700,
                color: T.muted, marginBottom: 8 }}>TAG A TRACK (optional)</div>
              <div style={{ display: "flex", gap: 5 }}>
                {["t1","t2","t3","t4"].map(t => (
                  <button key={t} onClick={() => setPostTrack(postTrack === t ? "" : t)}
                    style={{
                      padding: "5px 12px", borderRadius: 12,
                      border: `1px solid ${postTrack === t ? T.gold : T.border}`,
                      background: postTrack === t ? `${T.gold}22` : "transparent",
                      color: postTrack === t ? T.gold : T.muted,
                      fontSize: 10, fontWeight: 600, cursor: "pointer",
                    }}>
                    {t.toUpperCase()}
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
              <button onClick={handlePost}
                disabled={!postTitle.trim() || !postBody.trim() || posting || !userId}
                style={{
                  padding: "11px 26px", background: T.orange, color: T.white,
                  border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12,
                  cursor: "pointer", letterSpacing: "0.08em",
                  opacity: (!postTitle.trim() || !postBody.trim() || posting) ? 0.5 : 1,
                }}>
                {posting ? "POSTING..." : posted ? "✓ POSTED" : "SHARE WITH COHORT"}
              </button>
              <span style={{ fontSize: 11, color: T.muted }}>
                Visible to all Vibe Hyr members
              </span>
            </div>
          </motion.div>

        ) : (
          <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ padding: compact ? "12px 16px" : "20px 32px",
              maxHeight: compact ? 480 : "calc(100vh - 200px)", overflow: "auto" }}>

            {loading ? (
              <div style={{ padding: "24px 0", textAlign: "center", color: T.muted, fontSize: 12 }}>
                Loading the forum...
              </div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>✦</div>
                <p style={{ color: T.muted, fontSize: 13 }}>
                  No posts yet{trackFilter !== "all" ? ` for ${trackFilter.toUpperCase()}` : ""}. Be the first to share a Bridge Moment.
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
                        border: `1px solid ${post.is_pinned ? T.orange + "66" : T.border}`,
                        borderRadius: 12, padding: "16px 20px",
                      }}>

                      {/* Post header */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: c?.color ?? T.orange,
                          letterSpacing: "0.1em" }}>
                          {c?.icon} {c?.label}
                        </span>
                        {trackLabel(post.track_id) && (
                          <span style={{ fontSize: 9, padding: "2px 7px", background: `${T.gold}22`,
                            color: T.gold, borderRadius: 8, fontWeight: 700 }}>
                            {trackLabel(post.track_id)}
                          </span>
                        )}
                        {post.is_pinned && (
                          <span style={{ fontSize: 9, padding: "2px 7px", background: `${T.orange}22`,
                            color: T.orange, borderRadius: 8, fontWeight: 700 }}>
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
                      <p style={{ margin: "0 0 12px", fontSize: 13, color: T.gray, lineHeight: 1.6,
                        display: "-webkit-box", WebkitLineClamp: compact ? 2 : 4,
                        WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {post.body}
                      </p>

                      {/* Actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <button onClick={() => handleUpvote(post)}
                          style={{ background: "none", border: "none", cursor: "pointer",
                            color: T.muted, fontSize: 12, display: "flex", alignItems: "center", gap: 4,
                            padding: 0 }}>
                          ▲ <span style={{ color: T.orange }}>{post.upvotes}</span>
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
