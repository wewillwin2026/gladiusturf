"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface FounderVideoProps {
  /** YouTube video ID (the part after `v=`). */
  youtubeId: string;
  /** Optional poster image path (under /public). If omitted, a CSS gradient + crest watermark renders instead. */
  posterSrc?: string;
  /** Alt / aria-label text for the play button. */
  label?: string;
}

/**
 * Lazy-load YouTube embed: renders a poster + play button until clicked,
 * then swaps in the iframe. Reserves a 16:9 box so CLS = 0.
 */
export function FounderVideo({
  youtubeId,
  posterSrc,
  label = "Play founder video",
}: FounderVideoProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-bone/10 bg-pitch shadow-[0_0_60px_-12px_rgba(0,0,0,0.6)]">
      <div className="relative aspect-video w-full">
        {loaded ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title="From the founder"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            aria-label={label}
            onClick={() => setLoaded(true)}
            className="group absolute inset-0 flex items-center justify-center"
          >
            {posterSrc ? (
              <Image
                src={posterSrc}
                alt=""
                fill
                sizes="(min-width: 1024px) 960px, 100vw"
                className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
                priority={false}
              />
            ) : (
              <>
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(127,226,122,0.10),transparent_60%),radial-gradient(circle_at_50%_85%,rgba(201,168,122,0.12),transparent_55%)]"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-15"
                >
                  <Image
                    src="/crest.png"
                    alt=""
                    width={240}
                    height={320}
                    className="h-[60%] w-auto"
                    priority={false}
                  />
                </div>
              </>
            )}
            <span className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-champagne-bright/50 bg-pitch/70 backdrop-blur-sm transition-all group-hover:scale-105 group-hover:border-champagne-bright group-hover:bg-pitch/85">
              <Play className="ml-1 h-7 w-7 fill-champagne-bright text-champagne-bright" />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
