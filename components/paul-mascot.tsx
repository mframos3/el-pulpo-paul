import { cn } from "@/lib/utils";

type Pose = "idle" | "focused" | "victorious";

/**
 * El Pulpo Paul — premium editorial mascot.
 * Purple brand gradient, amber eyes. Auto-adjusts to light/dark via Radix tokens.
 */
export function PaulMascot({
  pose = "idle",
  className,
}: {
  pose?: Pose;
  className?: string;
}) {
  const eyeY = pose === "focused" ? 90 : pose === "victorious" ? 86 : 88;
  const eyeShine = pose === "victorious";
  const browLift = pose === "victorious" ? -2 : pose === "focused" ? 1 : 0;

  return (
    <svg
      viewBox="0 0 200 200"
      className={cn("select-none", className)}
      role="img"
      aria-label="El Pulpo Paul"
    >
      <defs>
        <linearGradient id="paulHead" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="var(--purple-8)" />
          <stop offset="55%" stopColor="var(--purple-9)" />
          <stop offset="100%" stopColor="var(--purple-11)" />
        </linearGradient>
        <linearGradient id="paulTentacle" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--purple-9)" />
          <stop offset="100%" stopColor="var(--purple-11)" />
        </linearGradient>
        <radialGradient id="paulGlow" cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="var(--amber-9)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--amber-9)" stopOpacity="0" />
        </radialGradient>
        <filter id="paulShine">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      <circle cx="100" cy="90" r="78" fill="url(#paulGlow)" />

      {Array.from({ length: 8 }).map((_, i) => {
        const t = i / 7;
        const angle = -Math.PI * 0.85 + t * (Math.PI * 1.7);
        const baseX = 100 + Math.cos(angle) * 36;
        const baseY = 122 + Math.sin(angle) * 18;
        const tipX = 100 + Math.cos(angle) * 78;
        const tipY = 158 + Math.sin(angle) * 18;
        const cpX = 100 + Math.cos(angle) * 62 + (i % 2 === 0 ? 6 : -6);
        const cpY = 145 + Math.sin(angle) * 20;
        return (
          <path
            key={i}
            d={`M ${baseX} ${baseY} Q ${cpX} ${cpY} ${tipX} ${tipY}`}
            stroke="url(#paulTentacle)"
            strokeWidth={i === 3 || i === 4 ? 11 : 9}
            strokeLinecap="round"
            fill="none"
          />
        );
      })}

      <path
        d="M 36 96 C 36 60, 64 38, 100 38 C 136 38, 164 60, 164 96 L 164 116 C 164 124, 158 130, 150 130 L 50 130 C 42 130, 36 124, 36 116 Z"
        fill="url(#paulHead)"
      />

      <path
        d="M 56 62 C 70 52, 130 52, 144 62"
        stroke="var(--purple-7)"
        strokeOpacity="0.65"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        filter="url(#paulShine)"
      />

      <path
        d={`M 70 ${78 + browLift} L 88 ${82 + browLift}`}
        stroke="var(--purple-12)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d={`M 130 ${78 + browLift} L 112 ${82 + browLift}`}
        stroke="var(--purple-12)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <ellipse cx="80" cy={eyeY} rx="6.5" ry="9" fill="var(--gray-1)" />
      <ellipse cx="120" cy={eyeY} rx="6.5" ry="9" fill="var(--gray-1)" />
      <ellipse cx="80" cy={eyeY + 1} rx="3" ry="4" fill="var(--amber-9)" />
      <ellipse cx="120" cy={eyeY + 1} rx="3" ry="4" fill="var(--amber-9)" />
      {eyeShine ? (
        <>
          <circle cx="82" cy={eyeY - 3} r="1.5" fill="var(--amber-3)" />
          <circle cx="122" cy={eyeY - 3} r="1.5" fill="var(--amber-3)" />
        </>
      ) : (
        <>
          <circle cx="82" cy={eyeY - 2} r="1.2" fill="var(--gray-1)" />
          <circle cx="122" cy={eyeY - 2} r="1.2" fill="var(--gray-1)" />
        </>
      )}

      <path
        d={
          pose === "victorious"
            ? "M 86 112 Q 100 122 114 112"
            : pose === "focused"
              ? "M 90 113 L 110 113"
              : "M 88 112 Q 100 118 112 112"
        }
        stroke="var(--purple-12)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
