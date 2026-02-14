/**
 * Text direction detection utilities with advanced features
 * Supports Arabic, Hebrew, Syriac, Thaana, N'Ko and other RTL scripts
 */

// ============================================================================
// Type Definitions
// ============================================================================

export enum TextDirection {
  LTR = "ltr",
  RTL = "rtl",
  AUTO = "auto",
}

export enum DetectionStrategy {
  /** Based on first meaningful character */
  FIRST_STRONG = "first-strong",
  /** Based on majority of characters */
  MAJORITY = "majority",
}

export interface DirectionOptions {
  /** Detection strategy to use */
  strategy?: DetectionStrategy;
  /** Force a specific direction regardless of content */
  forceDirection?: TextDirection.LTR | TextDirection.RTL;
  /** Threshold for majority detection (0-1) */
  majorityThreshold?: number;
}

export interface DirectionResult {
  direction: TextDirection;
  confidence: number; // 0-1
  rtlCharCount: number;
  ltrCharCount: number;
  totalChars: number;
}

export interface DirectionStyles {
  direction: "ltr" | "rtl";
  textAlign: "left" | "right";
  unicodeBidi?: "normal" | "embed" | "bidi-override";
}

// ============================================================================
// Regex Patterns (Compiled once for performance)
// ============================================================================

/**
 * Comprehensive RTL character ranges:
 * - Hebrew: U+0590–U+05FF
 * - Arabic: U+0600–U+06FF
 * - Arabic Supplement: U+0750–U+077F
 * - Syriac: U+0700–U+074F
 * - Thaana: U+0780–U+07BF
 * - N'Ko: U+07C0–U+07FF
 * - Arabic Extended-A: U+08A0–U+08FF
 * - Arabic Presentation Forms-A: U+FB50–U+FDFF
 * - Arabic Presentation Forms-B: U+FE70–U+FEFF
 */
const RTL_CHARS_REGEX =
  /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * LTR character ranges (Latin, Cyrillic, Greek, etc.)
 */
const LTR_CHARS_REGEX = /[A-Za-z\u0400-\u04FF\u0370-\u03FF\u0100-\u017F\u0180-\u024F]/;

/**
 * Neutral characters (numbers, punctuation, spaces)
 */
const NEUTRAL_CHARS_REGEX = /[\s\d\p{P}\p{S}]/u;

// ============================================================================
// Cache for performance
// ============================================================================

interface CacheEntry {
  result: DirectionResult;
  timestamp: number;
}

const directionCache = new Map<string, CacheEntry>();
const CACHE_MAX_SIZE = 500;
const CACHE_TTL = 60000; // 1 minute

/**
 * Clear expired cache entries
 */
function cleanCache(): void {
  const now = Date.now();
  for (const [key, entry] of directionCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      directionCache.delete(key);
    }
  }
}

/**
 * Get from cache with TTL check
 */
function getCached(key: string): DirectionResult | null {
  const entry = directionCache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    directionCache.delete(key);
    return null;
  }

  return entry.result;
}

/**
 * Save to cache with size limit
 */
function setCache(key: string, result: DirectionResult): void {
  if (directionCache.size >= CACHE_MAX_SIZE) {
    cleanCache();
    // If still full after cleaning, remove oldest entries
    if (directionCache.size >= CACHE_MAX_SIZE) {
      const firstKey = directionCache.keys().next().value;
      if (firstKey) directionCache.delete(firstKey);
    }
  }

  directionCache.set(key, {
    result,
    timestamp: Date.now(),
  });
}

// ============================================================================
// Core Detection Functions
// ============================================================================

/**
 * Count RTL and LTR characters in text
 */
function countDirectionalChars(text: string): { rtl: number; ltr: number; total: number } {
  let rtl = 0;
  let ltr = 0;
  let total = 0;

  for (const char of text) {
    if (NEUTRAL_CHARS_REGEX.test(char)) continue;

    total++;
    if (RTL_CHARS_REGEX.test(char)) {
      rtl++;
    } else if (LTR_CHARS_REGEX.test(char)) {
      ltr++;
    }
  }

  return { rtl, ltr, total };
}

/**
 * Detect direction using "first strong character" strategy
 */
function detectFirstStrong(text: string): DirectionResult {
  for (const char of text) {
    if (NEUTRAL_CHARS_REGEX.test(char)) continue;

    if (RTL_CHARS_REGEX.test(char)) {
      const counts = countDirectionalChars(text);
      return {
        direction: TextDirection.RTL,
        confidence: 1.0,
        rtlCharCount: counts.rtl,
        ltrCharCount: counts.ltr,
        totalChars: counts.total,
      };
    }

    if (LTR_CHARS_REGEX.test(char)) {
      const counts = countDirectionalChars(text);
      return {
        direction: TextDirection.LTR,
        confidence: 1.0,
        rtlCharCount: counts.rtl,
        ltrCharCount: counts.ltr,
        totalChars: counts.total,
      };
    }
  }

  // No strong characters found
  return {
    direction: TextDirection.LTR,
    confidence: 0.0,
    rtlCharCount: 0,
    ltrCharCount: 0,
    totalChars: 0,
  };
}

/**
 * Detect direction using "majority" strategy
 */
function detectMajority(text: string, threshold: number = 0.5): DirectionResult {
  const counts = countDirectionalChars(text);

  if (counts.total === 0) {
    return {
      direction: TextDirection.LTR,
      confidence: 0.0,
      rtlCharCount: 0,
      ltrCharCount: 0,
      totalChars: 0,
    };
  }

  const rtlRatio = counts.rtl / counts.total;
  const ltrRatio = counts.ltr / counts.total;

  if (rtlRatio > threshold) {
    return {
      direction: TextDirection.RTL,
      confidence: rtlRatio,
      rtlCharCount: counts.rtl,
      ltrCharCount: counts.ltr,
      totalChars: counts.total,
    };
  }

  if (ltrRatio > threshold) {
    return {
      direction: TextDirection.LTR,
      confidence: ltrRatio,
      rtlCharCount: counts.rtl,
      ltrCharCount: counts.ltr,
      totalChars: counts.total,
    };
  }

  // Mixed content - use first strong as tiebreaker
  const firstStrongResult = detectFirstStrong(text);
  return {
    ...firstStrongResult,
    confidence: Math.max(rtlRatio, ltrRatio),
  };
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Detect text direction with advanced options and caching
 * @param text - The text to analyze
 * @param options - Detection options
 * @returns Direction result with confidence
 */
export function detectDirection(text: string | null, options: DirectionOptions = {}): DirectionResult {
  if (!text || text.trim().length === 0) {
    return {
      direction: TextDirection.LTR,
      confidence: 0.0,
      rtlCharCount: 0,
      ltrCharCount: 0,
      totalChars: 0,
    };
  }

  // Force direction if specified
  if (options.forceDirection) {
    const counts = countDirectionalChars(text);
    return {
      direction: options.forceDirection,
      confidence: 1.0,
      rtlCharCount: counts.rtl,
      ltrCharCount: counts.ltr,
      totalChars: counts.total,
    };
  }

  // Check cache
  const cacheKey = `${text}_${options.strategy || "first-strong"}_${options.majorityThreshold || 0.5}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Detect based on strategy
  const strategy = options.strategy || DetectionStrategy.FIRST_STRONG;
  let result: DirectionResult;

  if (strategy === DetectionStrategy.MAJORITY) {
    result = detectMajority(text, options.majorityThreshold || 0.5);
  } else {
    result = detectFirstStrong(text);
  }

  // Cache result
  setCache(cacheKey, result);

  return result;
}

/**
 * Simple RTL check (backward compatible)
 * @param text - The text to check
 * @returns true if text contains any RTL characters
 */
export function isRTL(text: string): boolean {
  return RTL_CHARS_REGEX.test(text);
}

/**
 * Advanced RTL check with strategy
 * @param text - The text to check
 * @param options - Detection options
 * @returns true if detected direction is RTL
 */
export function isRTLAdvanced(text: string | null, options?: DirectionOptions): boolean {
  const result = detectDirection(text, options);
  return result.direction === TextDirection.RTL;
}

/**
 * Get CSS class with direction (backward compatible)
 * @param text - The text to check for direction
 * @param baseClass - The base CSS class name
 * @returns Base class with direction appended (e.g., "message rtl")
 */
export function getMessageDirectionClass(text: string | null, baseClass: string): string {
  if (!text) return baseClass;
  const direction = isRTL(text) ? "rtl" : "ltr";
  return `${baseClass} ${direction}`;
}

/**
 * Get CSS class with advanced direction detection
 * @param text - The text to check for direction
 * @param baseClass - The base CSS class name
 * @param options - Detection options
 * @returns Base class with direction appended
 */
export function getDirectionClass(text: string | null, baseClass: string, options?: DirectionOptions): string {
  if (!text) return baseClass;
  const result = detectDirection(text, options);
  return `${baseClass} ${result.direction}`;
}

/**
 * Get complete CSS direction styles
 * @param text - The text to analyze
 * @param options - Detection options
 * @returns CSS direction properties
 */
export function getDirectionStyles(text: string | null, options?: DirectionOptions): DirectionStyles {
  const result = detectDirection(text, options);
  const isRtl = result.direction === TextDirection.RTL;

  return {
    direction: isRtl ? "rtl" : "ltr",
    textAlign: isRtl ? "right" : "left",
    unicodeBidi: "normal",
  };
}

/**
 * Get inline style object for React/Vue
 * @param text - The text to analyze
 * @param options - Detection options
 * @returns Style object compatible with React/Vue
 */
export function getDirectionStyleObject(text: string | null, options?: DirectionOptions): React.CSSProperties {
  const styles = getDirectionStyles(text, options);
  return {
    direction: styles.direction,
    textAlign: styles.textAlign,
    unicodeBidi: styles.unicodeBidi,
  };
}

/**
 * Clear the direction detection cache
 */
export function clearDirectionCache(): void {
  directionCache.clear();
}

/**
 * Get cache statistics (for debugging/monitoring)
 */
export function getCacheStats() {
  return {
    size: directionCache.size,
    maxSize: CACHE_MAX_SIZE,
    ttl: CACHE_TTL,
  };
}
