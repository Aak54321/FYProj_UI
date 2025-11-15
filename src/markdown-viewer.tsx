import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SyntaxHighlighter } from "./syntax-highlighter";
import "./markdown-viewer.css";

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  // fixed serif + monospacing vars
  const containerStyle: React.CSSProperties = {
    ["--md-body-font" as any]: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
    ["--md-code-font" as any]:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
    ["--md-code-size" as any]: `14px`,
    ["--md-code-wrap" as any]: "pre",
  };

  return (
    <div className="markdown prose prose-sm dark:prose-invert max-w-none rounded-lg border border-border bg-card p-6 sm:prose-base"
      style={containerStyle}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h1 className="mb-4 mt-6 text-3xl font-bold text-foreground" {...p} />,
          h2: (p) => <h2 className="mb-3 mt-5 text-2xl font-bold text-foreground" {...p} />,
          h3: (p) => <h3 className="mb-2 mt-4 text-xl font-bold text-foreground" {...p} />,
          h4: (p) => <h4 className="mb-2 mt-3 text-lg font-bold text-foreground" {...p} />,
          h5: (p) => <h5 className="mb-2 mt-3 font-bold text-foreground" {...p} />,
          h6: (p) => <h6 className="mb-2 mt-3 font-bold text-muted-foreground" {...p} />,
          p: (p) => <p className="mb-4 leading-relaxed text-foreground" {...p} />,
          a: (p) => <a className="text-primary hover:underline" {...p} />,
          ul: (p) => <ul className="mb-4 ml-6 list-disc space-y-2 text-foreground" {...p} />,
          ol: (p) => <ol className="mb-4 ml-6 list-decimal space-y-2 text-foreground" {...p} />,
          li: (p) => <li className="text-foreground" {...p} />,
          blockquote: (p) => (
            <blockquote className="mb-4 border-l-4 border-primary bg-primary/5 py-2 pl-4 italic text-muted-foreground" {...p} />
          ),

          // ✅ inline code always pill
          code: ({ inline, className, children, ...props }: any) => {
            const raw = String(children);
            const isInline = inline || !raw.includes("\n");
            if (isInline) {
              return (
                <code className="mdv-code-pill" {...props}>
                  {raw}
                </code>
              );
            }
            const lang = /language-(\w+)/.exec(className || "")?.[1] || "text";
            return (
              <div className="mdv-code">
                <SyntaxHighlighter code={raw.replace(/\n$/, "")} language={lang} />
              </div>
            );
          },

          pre: (p) => <pre className="mb-4 overflow-auto" {...p} />,
          table: (p) => (
            <div className="mdv-table-wrap">
              <table className="mdv-table" {...p} />
            </div>
          ),
          thead: (p) => <thead className="mdv-thead" {...p} />,
          th: (p) => <th className="mdv-th" {...p} />,
          td: (p) => <td className="mdv-td" {...p} />,
          img: (p) => <img className="mb-4 max-w-full rounded-lg" {...p} />,
          hr: (p) => <hr className="mb-4 border-border" {...p} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
