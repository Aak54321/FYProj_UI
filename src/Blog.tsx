import { useEffect, useState } from "react";
import { MarkdownViewer } from "./markdown-viewer";
import React from "react";

type IndexItem = {
  title: string;
  url: string; // filename only
};

type IndexFile = { items: IndexItem[] };

type PostFile = {
  title?: string;
  content?: string;
};

export default function Blog() {
  const [items, setItems] = useState<IndexItem[]>([]);
  const [selected, setSelected] = useState<IndexItem | null>(null);
  const [post, setPost] = useState<PostFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // load index
  useEffect(() => {
    fetch("/posts/index.json")
      .then(r => r.json())
      .then((data: IndexFile) => {
        setItems(data.items);
        if (data.items.length > 0) setSelected(data.items[0]);
      })
      .catch(err => setError("failed loading index"));
  }, []);

  // load selected post
  useEffect(() => {
    if (!selected) return;
    setPost(null);
    setError(null);

    fetch(`/posts/${selected.url}`)
      .then(r => r.json())
      .then((data: PostFile) => {
        if (!data.content) throw new Error("missing content");
        setPost({
          title: data.title || selected.title,
          content: data.content
        });
      })
      .catch(() => setError("failed loading post"));
  }, [selected]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 16, padding: 16 }}>
      
      <aside style={{ borderRight: "1px solid #ddd", paddingRight: 12 }}>
        <h3>Posts</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map(item => (
            <li key={item.url}>
              <button
                onClick={() => setSelected(item)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "6px",
                  marginBottom: "4px",
                  background: selected?.url === item.url ? "#eef2ff" : "transparent",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main>
        {error && <div style={{ color: "red" }}>{error}</div>}
        {!post && !error && <div>Loading…</div>}
        {post && (
          <>
            <h1>{post.title}</h1>
            <MarkdownViewer content={post.content!} />
          </>
        )}
      </main>
    </div>
  );
}
