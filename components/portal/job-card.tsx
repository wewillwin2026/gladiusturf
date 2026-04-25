"use client";

import { CheckCircle2, Clock, Image as ImageIcon, Users } from "lucide-react";
import { cn } from "@/lib/cn";

type JobCardProps = {
  date: string;
  service: string;
  crew: string;
  duration: string;
  notes: string;
  photoCount: number;
  signedBy: string;
  className?: string;
};

/**
 * A completed-job card for the customer portal demo. Shows the job header,
 * a strip of placeholder photo tiles, the crew note, and the signature
 * confirmation. Pure visual — no real data or upload paths.
 */
export function JobCard({
  date,
  service,
  crew,
  duration,
  notes,
  photoCount,
  signedBy,
  className,
}: JobCardProps) {
  const tiles = Array.from({ length: Math.min(photoCount, 4) });

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-forest/10 bg-white p-5 shadow-card transition-shadow hover:shadow-pop",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone">
            {date}
          </div>
          <h3 className="mt-1 font-serif text-lg font-semibold tracking-[-0.01em] text-forest">
            {service}
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-moss/10 px-2.5 py-1 text-[11px] font-semibold text-forest">
          <CheckCircle2 className="h-3 w-3 text-forest" />
          Completed
        </span>
      </div>

      {/* Photo strip — placeholder tiles styled like a real gallery */}
      <div className="mt-4 grid grid-cols-4 gap-1.5">
        {tiles.map((_, i) => (
          <div
            key={i}
            aria-hidden
            className="relative aspect-square overflow-hidden rounded-md bg-gradient-to-br from-bone to-paper"
          >
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 30%, rgba(127,226,122,0.35), transparent 55%), radial-gradient(circle at 70% 70%, rgba(15,61,46,0.18), transparent 60%)",
              }}
            />
            <div className="absolute bottom-1 right-1 inline-flex items-center gap-0.5 rounded bg-white/80 px-1 py-0.5 text-[8px] font-semibold text-forest">
              <ImageIcon className="h-2.5 w-2.5" />
              {i + 1}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[13px] leading-[1.6] text-forest/80">{notes}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-forest/10 pt-3 text-[12px] text-stone">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {crew}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {duration}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5" />
          {photoCount} photos
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 font-medium text-forest">
          <CheckCircle2 className="h-3.5 w-3.5 text-honey-deep" />
          Signed by {signedBy}
        </span>
      </div>
    </article>
  );
}
