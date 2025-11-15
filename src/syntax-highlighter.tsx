import React, { useMemo, useState } from "react";

interface SyntaxHighlighterProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  wrap?: boolean;
}

/**
 * Lightweight highlighter with:
 * - language badge
 * - copy button
 * - optional line numbers
 * - wrap toggle controlled by parent
 *
 * Replace the `highlightCode` with Prism/Highlight.js if you prefer.
 */
function highlightCode(code: string, language: string): string {
  // escape
  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lang = language.toLowerCase();

  // very small tokenizers; good enough for demo
  if (["js", "jsx", "ts", "tsx", "javascript", "typescript"].includes(lang)) {
    html = html
      .replace(
        /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|class|extends|import|export|default|async|await|yield|this|super|static|get|set)\b/g,
        '<span class="hljs-keyword">$1</span>'
      )
      .replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g, '<span class="hljs-string">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="hljs-number">$1</span>')
      .replace(/(\/\/.*?$|\/\*[\s\S]*?\*\/)/gm, '<span class="hljs-comment">$1</span>')
      .replace(/\b([A-Za-z_$][A-Za-z0-9_$]*)\s*(?=\()/g, '<span class="hljs-function">$1</span>');
  } else if (["py", "python"].includes(lang)) {
    html = html
      .replace(/\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|lambda|yield|pass|break|continue|raise|assert|del|global|nonlocal|True|False|None)\b/g, '<span class="hljs-keyword">$1</span>')
      .replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|"""[\s\S]*?"""|'''[\s\S]*?''')/g, '<span class="hljs-string">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="hljs-number">$1</span>')
      .replace(/(#.*?$)/gm, '<span class="hljs-comment">$1</span>');
  } else if (["html", "xml"].includes(lang)) {
    html = html
      .replace(/(&lt;\/?[a-zA-Z][a-zA-Z0-9]*\b[^&]*?&gt;)/g, '<span class="hljs-tag">$1</span>')
      .replace(/([a-zA-Z-]+)=/g, '<span class="hljs-attr">$1</span>=')
      .replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, '<span class="hljs-string">$1</span>')
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="hljs-comment">$1</span>');
  } else if (lang === "css") {
    html = html
      .replace(/^([^{]*)/gm, '<span class="hljs-selector">$1</span>')
      .replace(/([a-z-]+):/g, '<span class="hljs-attr">$1</span>:')
      .replace(/(:\s*[^;]+)/g, '<span class="hljs-string">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="hljs-comment">$1</span>');
  } else if (lang === "json") {
    html = html
      .replace(/("(?:\\.|[^"\\])*")(\s*:)/g, '<span class="hljs-attr">$1</span>$2')
      .replace(/:\s*("(?:\\.|[^"\\])*")/g, ': <span class="hljs-string">$1</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="hljs-number">$1</span>')
      .replace(/\b(true|false|null)\b/g, '<span class="hljs-literal">$1</span>');
  }

  return html;
}

export function SyntaxHighlighter({
  code,
  language,
  showLineNumbers = false,
  wrap = false,
}: SyntaxHighlighterProps) {
  const [copied, setCopied] = useState(false);

  const lines = useMemo(() => code.split("\n"), [code]);
  const langLabel = useMemo(() => language?.toUpperCase?.() || "TEXT", [language]);

  const highlighted = useMemo(() => highlightCode(code, language), [code, language]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  if (showLineNumbers) {
    // wrap each line in a span so we can number via CSS counters
    const numbered = lines
      .map((ln) => `<span class="mdv-line">${ln.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>`)
      .join("\n");
    return (
      <div className="mdv-codeblock">
        <div className="mdv-codebar">
          <span className="mdv-lang">{langLabel}</span>
          <button onClick={copy} className="mdv-copy">{copied ? "Copied" : "Copy"}</button>
        </div>
        <pre className={`mdv-pre ${wrap ? "mdv-wrap" : ""}`}>
          <code className="mdv-code mdv-lines" dangerouslySetInnerHTML={{ __html: numbered }} />
        </pre>
      </div>
    );
  }

  return (
    <div className="mdv-codeblock">
      <div className="mdv-codebar">
        <span className="mdv-lang">{langLabel}</span>
        <button onClick={copy} className="mdv-copy">{copied ? "Copied" : "Copy"}</button>
      </div>
      <pre className={`mdv-pre ${wrap ? "mdv-wrap" : ""}`}>
        <code className="mdv-code" dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}
