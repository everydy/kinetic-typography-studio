import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  SpringConfig,
} from "remotion";

// ---------------------------------------------------------------------------
// 🇰🇷 한글 자음/모음 분해 유틸리티 (초성, 중성, 종성)
// ---------------------------------------------------------------------------
const CHOSUNG = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const JUNGSUNG = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
const JONGSUNG = ["", "ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

export interface HangulJasoDecomp {
  cho: string;
  jung: string;
  jong: string | null;
  original: string;
  isHangul: boolean;
}

export function decomposeHangulChar(char: string): HangulJasoDecomp {
  const code = char.charCodeAt(0);
  if (code >= 0xAC00 && code <= 0xD7A3) {
    const index = code - 0xAC00;
    const cho = CHOSUNG[Math.floor(index / 588)];
    const jung = JUNGSUNG[Math.floor((index % 588) / 28)];
    const jong = JONGSUNG[index % 28];
    return { cho, jung, jong: jong || null, original: char, isHangul: true };
  }
  return { cho: char, jung: "", jong: null, original: char, isHangul: false };
}

export type KineticEffectType =
  // 🇰🇷 1. Hangul Jaso & Assembly (한글 자모 조합 특화)
  | "hangul-assembly"
  | "hangul-typing"
  | "hangul-morph"
  // 2. 3D & Perspective
  | "3d-flip"
  | "origami-fold"
  | "domino-tilt"
  | "tunnel-zoom"
  // 3. Mask & Slice
  | "mask-reveal"
  | "mask-drop"
  | "split-collision"
  | "diagonal-slice"
  // 4. Bounce & Elastic
  | "velocity-stretch"
  | "bubble-pop"
  | "rubber-bounce"
  | "wave-cascade"
  // 5. Impact & Weight
  | "impact-slam"
  | "weight-morph"
  | "magnetic-snap"
  | "stagger-drop"
  // 6. Cinematic & Atmosphere
  | "fog-blur"
  | "spotlight-cast"
  | "smoke-drift"
  | "neon-ignition"
  // 7. Tech & Digital
  | "glitch-shutter"
  | "matrix-assemble"
  | "slot-machine"
  | "typewriter";

export interface KineticTextProps {
  /** 렌더링할 텍스트 문구 (한국어 / 영문 완벽 지원) */
  text: string;
  /** 키네틱 모션 효과 프리셋 (총 27종) */
  effect?: KineticEffectType;
  /** 애니메이션 시작 프레임 */
  startFrame?: number;
  /** 글자/단어 간 시차 프레임 (기본 2) */
  staggerFrames?: number;
  /** 분할 방식: 글자별('char'), 단어별('word'), 또는 통째('none') */
  splitBy?: "char" | "word" | "none";
  /** 폰트 크기 (px 또는 CSS 단위) */
  fontSize?: number | string;
  /** 폰트 두께 (100~900, bold 등) */
  fontWeight?: number | string;
  /** 텍스트 기본 색상 */
  color?: string;
  /** 특정 단어 강조 지정 */
  highlightText?: string | string[];
  /** 강조 색상 */
  highlightColor?: string;
  /** 커스텀 Remotion 스프링 물리 설정 */
  springConfig?: Partial<SpringConfig>;
  /** 전체 컨테이너 CSS 스타일 */
  containerStyle?: React.CSSProperties;
  /** 개별 글자 CSS 스타일 */
  style?: React.CSSProperties;
  /** 폰트 서체 (기본 Pretendard Variable) */
  fontFamily?: string;
  /** 텍스트 정렬 */
  textAlign?: "left" | "center" | "right";
  /** 행간 (lineHeight) */
  lineHeight?: number | string;
  /** 자간 (letterSpacing) */
  letterSpacing?: number | string;
  /** 대소문자 변환 */
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  /** 텍스트 그라데이션 (옵션) */
  textGradient?: string;
}

/**
 * 🎬 KineticText: 한글 자모 결합 & 범용 키네틱 타이포그래피 Remotion 엔진
 */
export const KineticText: React.FC<KineticTextProps> = ({
  text,
  effect = "hangul-assembly",
  startFrame = 0,
  staggerFrames = 2,
  splitBy = "char",
  fontSize = 72,
  fontWeight = 900,
  color = "#0066FF",
  highlightText,
  highlightColor = "#15B2F5",
  springConfig,
  containerStyle,
  style,
  fontFamily = "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
  textAlign = "center",
  lineHeight = 1.15,
  letterSpacing = "-0.02em",
  textTransform = "none",
  textGradient,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const highlights = React.useMemo(() => {
    if (!highlightText) return [];
    return Array.isArray(highlightText) ? highlightText : [highlightText];
  }, [highlightText]);

  const tokens = React.useMemo(() => {
    if (
      splitBy === "none" ||
      effect === "mask-reveal" ||
      effect === "mask-drop" ||
      effect === "velocity-stretch" ||
      effect === "weight-morph" ||
      effect === "diagonal-slice"
    ) {
      return splitBy === "word" ? text.split(" ") : [text];
    }
    if (splitBy === "word") {
      return text.split(" ");
    }
    return text.split("");
  }, [text, splitBy, effect]);

  return (
    <div
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        justifyContent:
          textAlign === "left"
            ? "flex-start"
            : textAlign === "right"
            ? "flex-end"
            : "center",
        alignItems: "center",
        fontFamily,
        fontSize: typeof fontSize === "number" ? `${fontSize}px` : fontSize,
        fontWeight,
        lineHeight,
        letterSpacing,
        textTransform,
        perspective: "1200px",
        ...containerStyle,
      }}
    >
      {tokens.map((token, index) => {
        const tokenDelay = startFrame + index * staggerFrames;
        const relativeFrame = frame - tokenDelay;

        if (token === " ") {
          return (
            <span
              key={`space-${index}`}
              style={{ display: "inline-block", width: "0.3em" }}
            >
              &nbsp;
            </span>
          );
        }

        const isHighlighted = highlights.some((h) => token.includes(h));
        const tokenColor = isHighlighted ? highlightColor : color;

        // 🇰🇷 한글 자소 결합 특수 렌더링
        if (effect === "hangul-assembly") {
          const decomp = decomposeHangulChar(token);
          if (decomp.isHangul) {
            return (
              <HangulAssemblyChar
                key={`hangul-${index}-${token}`}
                decomp={decomp}
                relativeFrame={relativeFrame}
                fps={fps}
                color={tokenColor}
                springConfig={springConfig}
                style={style}
              />
            );
          }
        }

        const tokenTransformStyle = getEffectTransform({
          effect,
          relativeFrame,
          fps,
          index,
          total: tokens.length,
          springConfig,
        });

        const gradientStyle: React.CSSProperties = textGradient
          ? {
              backgroundImage: textGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }
          : {
              color: tokenColor,
            };

        return (
          <span
            key={`token-${index}-${token}`}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              ...gradientStyle,
              ...tokenTransformStyle,
              ...style,
            }}
          >
            {token}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// 🇰🇷 한글 자소 결합 렌더러 컴포넌트 (초성/중성/종성이 사방에서 날아와 완성 글자로 결합)
// ---------------------------------------------------------------------------
interface HangulAssemblyCharProps {
  decomp: HangulJasoDecomp;
  relativeFrame: number;
  fps: number;
  color: string;
  springConfig?: Partial<SpringConfig>;
  style?: React.CSSProperties;
}

const HangulAssemblyChar: React.FC<HangulAssemblyCharProps> = ({
  decomp,
  relativeFrame,
  fps,
  color,
  springConfig,
  style,
}) => {
  const spr = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.7, ...springConfig },
  });

  // 0 -> 0.7 구간: 초성/중성/종성이 각자 날아옴
  // 0.7 -> 1.0 구간: 완성 글자로 합체되며 탄성 바운스
  const mergeProgress = interpolate(spr, [0, 0.75, 1], [0, 0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const choX = interpolate(spr, [0, 0.75], [-45, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const jungY = interpolate(spr, [0, 0.75], [-40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const jongY = interpolate(spr, [0, 0.75], [45, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const jamoOpacity = interpolate(spr, [0, 0.2, 0.7, 0.85], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const completedOpacity = interpolate(mergeProgress, [0, 0.2, 1], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const completedScale = interpolate(mergeProgress, [0, 0.5, 1], [1.35, 0.95, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <span
      style={{
        display: "inline-block",
        position: "relative",
        color,
        ...style,
      }}
    >
      {/* 1. 자음/모음 날아오는 단계 */}
      {jamoOpacity > 0.01 && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: jamoOpacity,
            pointerEvents: "none",
          }}
        >
          <span style={{ position: "absolute", transform: `translateX(${choX}px)`, color: "#15B2F5" }}>{decomp.cho}</span>
          <span style={{ position: "absolute", transform: `translateY(${jungY}px)`, color: "#38BDF8" }}>{decomp.jung}</span>
          {decomp.jong && (
            <span style={{ position: "absolute", transform: `translateY(${jongY}px)`, color: "#0066FF" }}>{decomp.jong}</span>
          )}
        </span>
      )}

      {/* 2. 결합 완성 글자 */}
      <span
        style={{
          display: "inline-block",
          opacity: completedOpacity,
          transform: `scale(${completedScale})`,
        }}
      >
        {decomp.original}
      </span>
    </span>
  );
};

// ---------------------------------------------------------------------------
// 🧮 Physics & Keyframe Computation for Kinetic Typography Styles
// ---------------------------------------------------------------------------
interface EffectParams {
  effect: KineticEffectType;
  relativeFrame: number;
  fps: number;
  index: number;
  total: number;
  springConfig?: Partial<SpringConfig>;
}

function getEffectTransform({
  effect,
  relativeFrame,
  fps,
  index,
  total,
  springConfig,
}: EffectParams): React.CSSProperties {
  switch (effect) {
    // 🇰🇷 한글 자모 조합 타이핑
    case "hangul-typing": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 10, stiffness: 220, mass: 0.5, ...springConfig },
      });
      const scale = interpolate(spr, [0, 0.5, 1], [0.5, 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.2, 1], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `scale(${scale})`,
        opacity,
      };
    }

    // 🇰🇷 한글 자모 팝 & 재조합
    case "hangul-morph": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 9, stiffness: 190, mass: 0.6, ...springConfig },
      });
      const rotate = interpolate(spr, [0, 0.6, 1], [-25, 6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const scale = interpolate(spr, [0, 0.6, 1], [0.3, 1.25, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.2, 1], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        opacity,
      };
    }

    // 3D Flip
    case "3d-flip": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 12, stiffness: 140, mass: 0.8, ...springConfig },
      });
      const rotateX = interpolate(spr, [0, 1], [-90, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const translateY = interpolate(spr, [0, 1], [-40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.4, 1], [0, 0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `perspective(800px) translateY(${translateY}px) rotateX(${rotateX}deg)`,
        opacity,
        transformOrigin: "50% 100%",
      };
    }

    // Origami Fold
    case "origami-fold": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 14, stiffness: 130, mass: 0.9, ...springConfig },
      });
      const rotateY = interpolate(spr, [0, 1], [-90, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.3, 1], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `perspective(1000px) rotateY(${rotateY}deg)`,
        opacity,
        transformOrigin: "0% 50%",
      };
    }

    // Domino Tilt
    case "domino-tilt": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 10, stiffness: 160, mass: 0.7, ...springConfig },
      });
      const rotateZ = interpolate(spr, [0, 1], [-45, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const translateY = interpolate(spr, [0, 1], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.3, 1], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `translateY(${translateY}px) rotate(${rotateZ}deg)`,
        opacity,
        transformOrigin: "bottom left",
      };
    }

    // Tunnel Zoom
    case "tunnel-zoom": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 15, stiffness: 180, mass: 0.8, ...springConfig },
      });
      const scale = interpolate(spr, [0, 1], [4.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.4, 1], [0, 0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `scale(${scale})`,
        opacity,
        transformOrigin: "center center",
      };
    }

    // Mask Reveal
    case "mask-reveal": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 15, stiffness: 130, mass: 0.9, ...springConfig },
      });
      const translateY = interpolate(spr, [0, 1], [110, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.2, 1], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `translateY(${translateY}%)`,
        opacity,
      };
    }

    // Mask Drop
    case "mask-drop": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 14, stiffness: 140, mass: 0.85, ...springConfig },
      });
      const translateY = interpolate(spr, [0, 1], [-110, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.2, 1], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `translateY(${translateY}%)`,
        opacity,
      };
    }

    // Split Collision
    case "split-collision": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 12, stiffness: 200, mass: 0.75, ...springConfig },
      });
      const isEven = index % 2 === 0;
      const startOffset = isEven ? -100 : 100;
      const translateY = interpolate(spr, [0, 1], [startOffset, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.3, 1], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `translateY(${translateY}px)`,
        opacity,
      };
    }

    // Diagonal Slice
    case "diagonal-slice": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 13, stiffness: 150, mass: 0.8, ...springConfig },
      });
      const translateX = interpolate(spr, [0, 1], [-50, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const translateY = interpolate(spr, [0, 1], [50, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.2, 1], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `translate(${translateX}px, ${translateY}px)`,
        opacity,
      };
    }

    // Velocity Stretch
    case "velocity-stretch": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 10, stiffness: 170, mass: 0.65, ...springConfig },
      });
      const scaleX = interpolate(spr, [0, 0.5, 0.8, 1], [2.2, 1.35, 0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const scaleY = interpolate(spr, [0, 0.5, 0.8, 1], [0.55, 0.82, 1.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.3, 1], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `scaleX(${scaleX}) scaleY(${scaleY})`,
        opacity,
        transformOrigin: "center center",
      };
    }

    // Bubble Pop
    case "bubble-pop": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 8, stiffness: 190, mass: 0.5, ...springConfig },
      });
      const scale = interpolate(spr, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.2, 1], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `scale(${scale})`,
        opacity,
        transformOrigin: "center bottom",
      };
    }

    // Rubber Bounce
    case "rubber-bounce": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 7, stiffness: 210, mass: 0.6, ...springConfig },
      });
      const translateY = interpolate(spr, [0, 0.6, 0.85, 1], [-80, 12, -4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const scaleY = interpolate(spr, [0, 0.6, 0.85, 1], [1.4, 0.85, 1.05, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.2, 1], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `translateY(${translateY}px) scaleY(${scaleY})`,
        opacity,
        transformOrigin: "bottom center",
      };
    }

    // Wave Cascade
    case "wave-cascade": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 9, stiffness: 160, mass: 0.6, ...springConfig },
      });
      const waveOffset = Math.sin((relativeFrame / fps) * 6 + index * 0.4) * 8 * (1 - spr);
      const translateY = interpolate(spr, [0, 1], [60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) + waveOffset;
      const scale = interpolate(spr, [0, 0.6, 1], [0.6, 1.15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.3, 1], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
      };
    }

    // Impact Slam
    case "impact-slam": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 14, stiffness: 220, mass: 1.1, ...springConfig },
      });
      const scale = interpolate(spr, [0, 1], [2.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.3, 1], [0, 0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const blur = interpolate(spr, [0, 0.6, 1], [20, 3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `scale(${scale})`,
        opacity,
        filter: `blur(${blur}px)`,
        transformOrigin: "center center",
      };
    }

    // Weight Morph
    case "weight-morph": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 11, stiffness: 160, mass: 0.8, ...springConfig },
      });
      const scale = interpolate(spr, [0, 0.6, 1], [0.75, 1.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const letterSpacing = interpolate(spr, [0, 1], [0.35, -0.02], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.25, 1], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `scale(${scale})`,
        letterSpacing: `${letterSpacing}em`,
        opacity,
      };
    }

    // Magnetic Snap
    case "magnetic-snap": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 12, stiffness: 240, mass: 0.5, ...springConfig },
      });
      const center = (total - 1) / 2;
      const dir = index - center;
      const translateX = interpolate(spr, [0, 1], [dir * 30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const scale = interpolate(spr, [0, 0.7, 1], [0.5, 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.2, 1], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `translateX(${translateX}px) scale(${scale})`,
        opacity,
      };
    }

    // Stagger Drop
    case "stagger-drop": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 11, stiffness: 180, mass: 0.7, ...springConfig },
      });
      const translateY = interpolate(spr, [0, 1], [-120, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.3, 1], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `translateY(${translateY}px)`,
        opacity,
      };
    }

    // Fog Blur
    case "fog-blur": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 16, stiffness: 110, mass: 1.0, ...springConfig },
      });
      const blur = interpolate(spr, [0, 1], [28, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const scale = interpolate(spr, [0, 1], [1.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        filter: `blur(${blur}px)`,
        transform: `scale(${scale})`,
        opacity,
      };
    }

    // Spotlight Cast
    case "spotlight-cast": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 13, stiffness: 140, mass: 0.8, ...springConfig },
      });
      const shadowSpread = interpolate(spr, [0, 1], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        opacity,
        textShadow: `0 0 ${shadowSpread}px rgba(0, 102, 255, 0.8)`,
      };
    }

    // Smoke Drift
    case "smoke-drift": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 18, stiffness: 90, mass: 1.2, ...springConfig },
      });
      const translateY = interpolate(spr, [0, 1], [45, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const blur = interpolate(spr, [0, 1], [14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `translateY(${translateY}px)`,
        filter: `blur(${blur}px)`,
        opacity,
      };
    }

    // Neon Ignition
    case "neon-ignition": {
      const isFlicker = relativeFrame >= 0 && relativeFrame <= 15;
      const flickerPattern = [0.1, 0.9, 0.2, 1, 0.4, 0.1, 0.95, 1];
      const step = Math.floor(relativeFrame / 2);
      const flickerOpacity = isFlicker ? (flickerPattern[step % flickerPattern.length] ?? 1) : relativeFrame < 0 ? 0 : 1;
      const glow = isFlicker && flickerOpacity > 0.5 ? "0 0 16px #0066FF, 0 0 32px #15B2F5" : "none";
      return {
        opacity: flickerOpacity,
        textShadow: glow,
      };
    }

    // Glitch Shutter
    case "glitch-shutter": {
      const isTrigger = relativeFrame >= 0 && relativeFrame <= 12;
      const flicker = isTrigger ? ((relativeFrame % 3) === 0 ? 0.3 : 1) : relativeFrame < 0 ? 0 : 1;
      const offsetX = isTrigger ? Math.sin(relativeFrame * 4.2) * 8 : 0;
      const redShadow = isTrigger ? `${-offsetX * 1.5}px 0 rgba(255, 0, 80, 0.7)` : "none";
      const cyanShadow = isTrigger ? `${offsetX * 1.5}px 0 rgba(0, 220, 255, 0.7)` : "none";
      return {
        transform: `translateX(${offsetX}px)`,
        opacity: flicker,
        textShadow: isTrigger ? `${redShadow}, ${cyanShadow}` : "none",
      };
    }

    // Matrix Assemble
    case "matrix-assemble": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 12, stiffness: 200, mass: 0.6, ...springConfig },
      });
      const translateY = interpolate(spr, [0, 1], [-60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const blur = interpolate(spr, [0, 0.6, 1], [10, 2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.2, 1], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `translateY(${translateY}px)`,
        filter: `blur(${blur}px)`,
        opacity,
      };
    }

    // Slot Machine
    case "slot-machine": {
      const spr = spring({
        frame: relativeFrame,
        fps,
        config: { damping: 13, stiffness: 150, mass: 0.7, ...springConfig },
      });
      const offsetRoll = interpolate(spr, [0, 0.4, 0.8, 1], [140, -40, 12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const opacity = interpolate(spr, [0, 0.25, 1], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const blur = interpolate(spr, [0, 0.5, 1], [12, 4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return {
        transform: `translateY(${offsetRoll}px)`,
        opacity,
        filter: `blur(${blur}px)`,
      };
    }

    // Typewriter
    case "typewriter": {
      const isVisible = relativeFrame >= 0;
      return {
        opacity: isVisible ? 1 : 0,
      };
    }

    default:
      return { opacity: relativeFrame >= 0 ? 1 : 0 };
  }
}
