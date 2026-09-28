"use client";

import { useEffect, useRef, type ReactNode } from "react";

// A block that plays its entrance when it scrolls into view. The server
// renders it visible; only once the browser runs, and only for a block still
// below the fold, is it set aside to be revealed. Without JavaScript, or for
// a block already on screen, nothing is ever hidden. The styles decide what
// "hidden" and "shown" look like (and drop the motion for reduced motion).
export function Reveal({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const node = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = node.current;
    if (!element) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    element.dataset.reveal = "hidden";
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.dataset.reveal = "shown";
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={node} className={className}>
      {children}
    </div>
  );
}
