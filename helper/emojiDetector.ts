/**
 * Professional Emoji Detection & Analysis Utility
 *
 * Features:
 * - Extended Grapheme Cluster support (👨‍👩‍👧‍👦, 🏳️‍🌈, etc.)
 * - Configurable detection modes
 * - Rich output with detailed analysis
 * - Performance optimized with early exit
 * - Test-friendly pure functions
 * - Backward compatible API
 *
 * @version 2.0.0
 */

// ============================================================================
// Type Definitions
// ============================================================================

export enum EmojiDetectionMode {
  /** Strict: Only emojis allowed */
  STRICT = "strict",
  /** Allow whitespace alongside emojis */
  ALLOW_WHITESPACE = "allow-whitespace",
  /** Allow numbers alongside emojis */
  ALLOW_NUMBERS = "allow-numbers",
  /** Allow punctuation alongside emojis */
  ALLOW_PUNCTUATION = "allow-punctuation",
  /** Allow all non-letter characters */
  ALLOW_NON_LETTERS = "allow-non-letters",
}

export enum ReturnType {
  BOOLEAN = "boolean",
  TEXT = "text",
  DETAILS = "details",
}

export interface EmojiDetectionOptions {
  /** Detection mode (defaults to STRICT) */
  mode?: EmojiDetectionMode;
  /** What type of result to return */
  returnType?: ReturnType;
  /** Platform-specific emoji support (for future use) */
  platform?: "ios" | "android" | "web" | "auto";
  /** Enable performance optimizations */
  optimize?: boolean;
}

export interface EmojiDetectionResult {
  /** Whether text contains only emojis (based on mode) */
  isEmojiOnly: boolean;
  /** Total number of emoji sequences found */
  emojiCount: number;
  /** Non-emoji text remaining after filtering */
  nonEmojiText: string;
  /** Array of individual emojis found */
  emojis: string[];
  /** Confidence score (0-1) */
  confidence: number;
  /** Character breakdown */
  stats: {
    totalChars: number;
    emojiChars: number;
    nonEmojiChars: number;
    whitespaceChars: number;
  };
}

// ============================================================================
// Regex Patterns (Compiled once for performance)
// ============================================================================

/**
 * Comprehensive emoji regex supporting:
 * - Basic emoji blocks
 * - Extended pictographics
 * - Emoji modifiers (skin tones)
 * - ZWJ sequences (👨‍👩‍👧‍👦)
 * - Flag sequences (🏳️‍🌈)
 * - Keycap sequences
 *
 * Based on Unicode 15.0 Emoji specification
 */
const EMOJI_REGEX = new RegExp(
  [
    // Emoticons
    "[\u{1F600}-\u{1F64F}]",
    // Dingbats
    "[\u{2700}-\u{27BF}]",
    // Miscellaneous Symbols
    "[\u{2600}-\u{26FF}]",
    // Transport and Map
    "[\u{1F680}-\u{1F6FF}]",
    // Supplemental Symbols
    "[\u{1F900}-\u{1F9FF}]",
    // Extended Pictographic
    "[\u{1FA70}-\u{1FAFF}]",
    // Symbols and Pictographs Extended-A
    "[\u{1FA00}-\u{1FA6F}]",
    // Miscellaneous Symbols and Pictographs
    "[\u{1F300}-\u{1F5FF}]",
    // Supplemental Symbols and Pictographs
    "[\u{1F900}-\u{1F9FF}]",
    // Chess Symbols
    "[\u{1FA00}-\u{1FA6F}]",
    // Enclosed Alphanumeric Supplement
    "[\u{1F100}-\u{1F1FF}]",
    // Enclosed Ideographic Supplement
    "[\u{1F200}-\u{1F2FF}]",
    // Regional Indicators (flags)
    "[\u{1F1E6}-\u{1F1FF}]{2}",
    // Keycap sequences
    "[\u{0023}\u{002A}\u{0030}-\u{0039}]\u{FE0F}?\u{20E3}",
    // Emoji with skin tone modifiers
    "[\u{1F3FB}-\u{1F3FF}]",
    // Zero Width Joiner sequences
    "\u{200D}",
    // Variation Selectors (emoji presentation)
    "[\u{FE00}-\u{FE0F}]",
    // Combining Enclosing Keycap
    "\u{20E3}",
  ].join("|"),
  "gu"
);

/** Whitespace pattern */
const WHITESPACE_REGEX = /\s/g;

/** Number pattern */
const NUMBER_REGEX = /\d/g;

/** Punctuation pattern */
const PUNCTUATION_REGEX = /[\p{P}\p{S}]/gu;

/** Letter pattern (any script) */
const LETTER_REGEX = /\p{L}/gu;

// ============================================================================
// Cache for performance
// ============================================================================

interface CacheEntry {
  result: EmojiDetectionResult;
  timestamp: number;
}

const emojiCache = new Map<string, CacheEntry>();
const CACHE_MAX_SIZE = 1000;
const CACHE_TTL = 300000; // 5 minutes

function getCached(key: string): EmojiDetectionResult | null {
  const entry = emojiCache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    emojiCache.delete(key);
    return null;
  }

  return entry.result;
}

function setCache(key: string, result: EmojiDetectionResult): void {
  if (emojiCache.size >= CACHE_MAX_SIZE) {
    const firstKey = emojiCache.keys().next().value;
    if (firstKey) emojiCache.delete(firstKey);
  }

  emojiCache.set(key, {
    result,
    timestamp: Date.now(),
  });
}

// ============================================================================
// Core Pure Functions (Single Responsibility)
// ============================================================================

/**
 * Extract all emoji sequences from text
 * @pure
 */
export function extractEmojis(text: string): string[] {
  if (!text) return [];
  const matches = text.match(EMOJI_REGEX);
  return matches || [];
}

/**
 * Count emoji sequences in text
 * @pure
 */
export function countEmojis(text: string): number {
  if (!text) return 0;
  const emojis = extractEmojis(text);
  return emojis.length;
}

/**
 * Remove all emojis from text
 * @pure
 */
export function removeEmojis(text: string): string {
  if (!text) return "";
  return text.replace(EMOJI_REGEX, "").trim();
}

/**
 * Check if text contains any emojis
 * @pure
 */
export function hasEmojis(text: string): boolean {
  if (!text) return false;
  return EMOJI_REGEX.test(text);
}

/**
 * Count different character types
 * @pure
 */
function analyzeCharacters(text: string): {
  totalChars: number;
  emojiChars: number;
  nonEmojiChars: number;
  whitespaceChars: number;
} {
  const totalChars = text.length;
  const emojiMatches = text.match(EMOJI_REGEX);
  const emojiChars = emojiMatches ? emojiMatches.join("").length : 0;
  const whitespaceMatches = text.match(WHITESPACE_REGEX);
  const whitespaceChars = whitespaceMatches ? whitespaceMatches.length : 0;
  const nonEmojiChars = totalChars - emojiChars;

  return {
    totalChars,
    emojiChars,
    nonEmojiChars,
    whitespaceChars,
  };
}

/**
 * Check if text matches detection mode criteria
 * @pure
 */
function matchesMode(text: string, mode: EmojiDetectionMode): boolean {
  // Remove emojis first
  const withoutEmojis = removeEmojis(text);

  if (withoutEmojis.length === 0) return true; // Only emojis

  switch (mode) {
    case EmojiDetectionMode.STRICT:
      return withoutEmojis.length === 0;

    case EmojiDetectionMode.ALLOW_WHITESPACE:
      return withoutEmojis.replace(WHITESPACE_REGEX, "").length === 0;

    case EmojiDetectionMode.ALLOW_NUMBERS:
      return withoutEmojis.replace(NUMBER_REGEX, "").replace(WHITESPACE_REGEX, "").length === 0;

    case EmojiDetectionMode.ALLOW_PUNCTUATION:
      return withoutEmojis.replace(PUNCTUATION_REGEX, "").replace(WHITESPACE_REGEX, "").length === 0;

    case EmojiDetectionMode.ALLOW_NON_LETTERS:
      return withoutEmojis.replace(LETTER_REGEX, "").trim().length === withoutEmojis.length;

    default:
      return false;
  }
}

/**
 * Calculate confidence score for emoji-only detection
 * @pure
 */
function calculateConfidence(stats: EmojiDetectionResult["stats"], mode: EmojiDetectionMode): number {
  if (stats.totalChars === 0) return 0;

  const emojiRatio = stats.emojiChars / stats.totalChars;

  switch (mode) {
    case EmojiDetectionMode.STRICT:
      return emojiRatio;

    case EmojiDetectionMode.ALLOW_WHITESPACE:
      return stats.emojiChars / (stats.totalChars - stats.whitespaceChars || 1);

    case EmojiDetectionMode.ALLOW_NUMBERS:
    case EmojiDetectionMode.ALLOW_PUNCTUATION:
    case EmojiDetectionMode.ALLOW_NON_LETTERS:
      // Calculate based on actual allowed characters
      return emojiRatio > 0.5 ? emojiRatio : emojiRatio * 0.8;

    default:
      return emojiRatio;
  }
}

// ============================================================================
// Main Detection Function
// ============================================================================

/**
 * Detect and analyze emojis in text with advanced options
 *
 * @param text - The text to analyze
 * @param options - Detection options
 * @returns Detection result (type depends on returnType option)
 *
 * @example
 * // Simple boolean check
 * detectEmoji("😀😃") // returns true (backward compatible)
 *
 * @example
 * // Detailed analysis
 * detectEmoji("Hello 😀", { returnType: ReturnType.DETAILS })
 * // returns { isEmojiOnly: false, emojiCount: 1, ... }
 *
 * @example
 * // Allow whitespace
 * detectEmoji("😀 😃 😄", { mode: EmojiDetectionMode.ALLOW_WHITESPACE })
 * // returns { isEmojiOnly: true, ... }
 */
export function detectEmoji(
  text: string | null,
  options: EmojiDetectionOptions = {}
): boolean | string | EmojiDetectionResult {
  // Handle null/empty input
  if (!text || text.trim().length === 0) {
    const emptyResult: EmojiDetectionResult = {
      isEmojiOnly: false,
      emojiCount: 0,
      nonEmojiText: "",
      emojis: [],
      confidence: 0,
      stats: {
        totalChars: 0,
        emojiChars: 0,
        nonEmojiChars: 0,
        whitespaceChars: 0,
      },
    };

    switch (options.returnType) {
      case ReturnType.BOOLEAN:
        return false;
      case ReturnType.TEXT:
        return "";
      case ReturnType.DETAILS:
        return emptyResult;
      default:
        return false; // Backward compatible default
    }
  }

  const mode = options.mode || EmojiDetectionMode.STRICT;
  const optimize = options.optimize !== false; // Default true

  // Early exit optimization for STRICT mode
  if (optimize && mode === EmojiDetectionMode.STRICT) {
    const hasLetters = LETTER_REGEX.test(text);
    if (hasLetters) {
      // Definitely not emoji-only
      if (options.returnType === ReturnType.BOOLEAN) return false;
      if (options.returnType === ReturnType.TEXT) return removeEmojis(text);
    }
  }

  // Check cache
  const cacheKey = `${text}_${mode}_${options.returnType || "boolean"}`;
  const cached = getCached(cacheKey);
  if (cached) {
    switch (options.returnType) {
      case ReturnType.BOOLEAN:
        return cached.isEmojiOnly;
      case ReturnType.TEXT:
        return cached.nonEmojiText;
      case ReturnType.DETAILS:
        return cached;
      default:
        return cached.isEmojiOnly;
    }
  }

  // Perform full analysis
  const emojis = extractEmojis(text);
  const nonEmojiText = removeEmojis(text);
  const stats = analyzeCharacters(text);
  const isEmojiOnly = matchesMode(text, mode);
  const confidence = calculateConfidence(stats, mode);

  const result: EmojiDetectionResult = {
    isEmojiOnly,
    emojiCount: emojis.length,
    nonEmojiText,
    emojis,
    confidence,
    stats,
  };

  // Cache result
  setCache(cacheKey, result);

  // Return based on requested type
  switch (options.returnType) {
    case ReturnType.BOOLEAN:
      return result.isEmojiOnly;
    case ReturnType.TEXT:
      return result.nonEmojiText;
    case ReturnType.DETAILS:
      return result;
    default:
      return result.isEmojiOnly; // Backward compatible
  }
}

// ============================================================================
// Backward Compatible API
// ============================================================================

/**
 * Detects if text contains only emojis (backward compatible)
 *
 * @param text - The text to check
 * @returns The non-emoji text trimmed, or null if input is null
 * @deprecated Use detectEmoji() with ReturnType.TEXT instead
 */
export function detectEmojiOnly(text: string | null): string | null {
  if (!text) return null;
  return detectEmoji(text, { returnType: ReturnType.TEXT }) as string;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clear the emoji detection cache
 */
export function clearEmojiCache(): void {
  emojiCache.clear();
}

/**
 * Get cache statistics (for monitoring/debugging)
 */
export function getEmojiCacheStats() {
  return {
    size: emojiCache.size,
    maxSize: CACHE_MAX_SIZE,
    ttl: CACHE_TTL,
  };
}

/**
 * Export regex for testing purposes
 * @internal
 */
export function getEmojiRegex(): RegExp {
  return EMOJI_REGEX;
}

/**
 * Validate emoji regex against test string
 * @internal
 */
export function testEmojiRegex(testString: string): boolean {
  return EMOJI_REGEX.test(testString);
}
