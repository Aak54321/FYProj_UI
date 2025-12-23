import React, { useEffect, useMemo, useState } from "react";
import { MarkdownViewer } from "./markdown-viewer";

type IndexItem = {
  title: string;
  url: string;      // filename in /public/posts/
  summary?: string; // optional
  author?: string;  // optional
  createdAt?: string;
};

type IndexFile = { items: IndexItem[] };
type PostFile = { title?: string; content?: string };

export default function App() {
  const [items, setItems] = useState<IndexItem[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<IndexItem | null>(null);
  const [post, setPost] = useState<PostFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);

  // load index
  useEffect(() => {
    fetch("/posts/index.json")
      .then((r) => r.json())
      .then((j: IndexFile) => setItems(j.items || []))
      .catch(() => setError("Failed to load index"));
  }, []);

  // load a post when selected
  useEffect(() => {
    if (!selected) return;
    setLoadingPost(true);
    setError(null);
    setPost(null);
    fetch(`/posts/${selected.url}`)
      .then((r) => r.json())
      .then((j: PostFile) => {
        if (!j?.content) throw new Error("missing content");
        setPost({ title: j.title || selected.title, content: j.content });
      })
      .catch(() => setError("Failed to load article"))
      .finally(() => setLoadingPost(false));
  }, [selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      [i.title, i.summary, i.author].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [items, query]);

  // Home list
  if (!selected) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", gridTemplateRows: "auto 1fr" }}>
        <Header />
        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles..."
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "white",
              }}
            />
            <span style={{ fontSize: 12, color: "#64748b" }}>
              {filtered.length}/{items.length}
            </span>
          </div>

          {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {filtered.map((it) => (
              <ArticleCard key={it.url} item={it} onOpen={() => setSelected(it)} />
            ))}
          </section>
        </main>
      </div>
    );
  }

  // Detail view
  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateRows: "auto 1fr" }}>
      <Header onHome={() => setSelected(null)} />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
        <button
          onClick={() => setSelected(null)}
          style={{
            border: "1px solid #e5e7eb",
            background: "white",
            padding: "6px 10px",
            borderRadius: 8,
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          ← Back
        </button>

        {loadingPost && <div>Loading…</div>}
        {error && <div style={{ color: "crimson" }}>{error}</div>}
        {post && (
          <>
            <div style={{ height: 12 }} />
            <MarkdownViewer content={post.content!} />
          </>
        )}
      </main>
    </div>
  );
}

function Header({ onHome }: { onHome?: () => void }) {
  return (
    <header
      style={{
        borderBottom: "1px solid #e5e7eb",
        background: "white",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <button
          onClick={onHome}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: "none",
            background: "transparent",
            cursor: onHome ? "pointer" : "default",
            padding: 0,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "#111827",
              color: "white",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              letterSpacing: 0.5,
            }}
            aria-hidden
          >
            A
          </div>
          <h1 style={{ margin: 0, fontSize: 22, letterSpacing: 0.3 }}>AUTONEWS</h1>
        </button>

        <div style={{ fontSize: 12, color: "#64748b" }}>Fast. Static. JSON-powered.</div>
      </div>
    </header>
  );
}

function ArticleCard({ item, onOpen }: { item: IndexItem; onOpen: () => void }) {
  return (
    <article
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        background: "white",
        padding: 16,
        display: "grid",
        gap: 8,
      }}
    >
      <h3 style={{ margin: 0, fontSize: 18, lineHeight: 1.25 }}>{item.title}</h3>
      <Metadata item={item} compact />
      {item.summary && (
        <p style={{ margin: 0, color: "#475569", fontSize: 14, lineHeight: 1.45 }}>
          {item.summary.length > 120
            ? `${item.summary.substring(0, 120)}...`
            : item.summary}
        </p>
      )}
      <button
        onClick={onOpen}
        style={{
          justifySelf: "start",
          marginTop: 4,
          border: "1px solid #0ea5e9",
          color: "#0ea5e9",
          background: "white",
          padding: "6px 10px",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Read
      </button>
    </article>
  );
}

function Metadata({ item, compact = false }: { item: IndexItem; compact?: boolean }) {
  const parts = [
    item.author ? `by ${item.author}` : null,
    item.createdAt ? new Date(item.createdAt).toLocaleDateString() : null,
  ].filter(Boolean);
  if (!parts.length) return null;
  return (
    <div style={{ color: "#64748b", fontSize: compact ? 12 : 13 }}>
      {parts.join(" • ")}
    </div>
  );
}
