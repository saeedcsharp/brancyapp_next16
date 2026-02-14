import React from "react";

type LinkifyTextProps = {
  text: string | null | undefined;
};

// Safely convert plain text URLs into clickable <a> elements.
// - Supports http/https, www., and bare domains like example.com
// - Preserves newlines as <br />
// - Avoids dangerouslySetInnerHTML to prevent XSS
export default function LinkifyText({ text }: LinkifyTextProps) {
  if (!text) return null;

  // Regex to find URL-like substrings
  const urlRegex = /((https?:\/\/|www\.)[^\s<]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s<]*)?)/gi;

  // Characters that shouldn't be part of a trailing URL (common punctuation)
  const trailingPunct = new Set([".", ",", ";", ":", "!", "?", ")", "]", "}", '"', "'"]);

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  const pushWithNewlines = (plain: string) => {
    const lines = plain.split(/\n/);
    lines.forEach((line, i) => {
      parts.push(line);
      if (i < lines.length - 1) parts.push(<br key={`br-${parts.length}`} />);
    });
  };

  for (const match of text.matchAll(urlRegex)) {
    const matchText = match[0];
    const index = match.index ?? 0;

    // Add text before the URL
    if (index > lastIndex) {
      pushWithNewlines(text.slice(lastIndex, index));
    }

    // Trim trailing punctuation from the detected URL
    let end = index + matchText.length;
    while (end > index && trailingPunct.has(text[end - 1])) {
      end--;
    }
    const rawUrl = text.slice(index, end);

    // Basic sanity check to avoid false positives like plain words
    const hasDot = rawUrl.includes(".");
    const hasSpace = /\s/.test(rawUrl);
    if (!hasDot || hasSpace) {
      // Not a valid URL candidate, push as plain text
      pushWithNewlines(text.slice(index, end));
    } else {
      const href =
        rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
          ? rawUrl
          : `https://${rawUrl.startsWith("www.") ? rawUrl : rawUrl}`;

      parts.push(
        <a
          key={`a-${index}-${end}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "inherit",
            textDecoration: "underline",
            fontSize: "inherit",
            fontFamily: "inherit",
            fontWeight: "inherit",
          }}>
          {rawUrl}
        </a>
      );
    }

    // If we trimmed punctuation, add it back as plain text
    if (end < index + matchText.length) {
      pushWithNewlines(text.slice(end, index + matchText.length));
    }

    lastIndex = index + matchText.length;
  }

  // Remainder after last URL
  if (lastIndex < text.length) {
    pushWithNewlines(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
