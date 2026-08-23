import Link from "next/link";
import type { InstructionalVideo as InstructionalVideoDefinition } from "../types";

export function InstructionalVideo({ video, onContinue, continueHref, continueLabel = "Start Interactive Lesson", secondaryHref, secondaryLabel }: { video: InstructionalVideoDefinition; onContinue?: () => void; continueHref?: string; continueLabel?: string; secondaryHref?: string; secondaryLabel?: string }) {
  return <section className="instructional-video" aria-labelledby="instructional-video-title">
    <header>
      <p className="eyebrow">Watch · Approx. {video.durationLabel}</p>
      <h1 id="instructional-video-title" tabIndex={-1}>{video.title}</h1>
      <p>{video.description}</p>
    </header>
    <div className="instructional-video-frame">
      <video controls playsInline preload="metadata" aria-label={video.title}>
        <source src={video.src} type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
    </div>
    <p className="instructional-video-note">AI-assisted instructional video.</p>
    <div className="instructional-video-actions">
      {continueHref ? <Link className="primary-button button-link" href={continueHref}>{continueLabel}</Link> : <button className="primary-button" type="button" onClick={() => onContinue?.()}>{continueLabel}</button>}
      {secondaryHref && secondaryLabel && <Link className="secondary-button button-link" href={secondaryHref}>{secondaryLabel}</Link>}
    </div>
  </section>;
}
