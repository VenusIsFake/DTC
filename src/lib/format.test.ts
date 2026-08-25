import { describe, expect, it } from "vitest";
import {
  escapeHtml,
  formatRelative,
  initials,
  isoDurationToClock,
  parseYouTubeId,
  youtubeWatchUrl,
} from "@/lib/format";

describe("parseYouTubeId", () => {
  it("accepts a bare 11-char id", () => {
    expect(parseYouTubeId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts from watch URLs with extra params", () => {
    expect(parseYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s&list=x")).toBe(
      "dQw4w9WgXcQ"
    );
  });

  it("extracts from youtu.be short links", () => {
    expect(parseYouTubeId("https://youtu.be/dQw4w9WgXcQ?si=abc")).toBe("dQw4w9WgXcQ");
  });

  it("extracts from shorts, embed and live URLs", () => {
    expect(parseYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(parseYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(parseYouTubeId("https://www.youtube.com/live/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("rejects garbage and wrong-length ids", () => {
    expect(parseYouTubeId("bonjour")).toBeNull();
    expect(parseYouTubeId("https://vimeo.com/12345")).toBeNull();
    expect(parseYouTubeId("dQw4w9WgXc")).toBeNull(); // 10 chars
    expect(parseYouTubeId("")).toBeNull();
  });
});

describe("youtubeWatchUrl", () => {
  it("builds the canonical watch URL", () => {
    expect(youtubeWatchUrl("abc12345678")).toBe("https://www.youtube.com/watch?v=abc12345678");
  });
});

describe("isoDurationToClock (YouTube import)", () => {
  it("formats hours, minutes and seconds", () => {
    expect(isoDurationToClock("PT1H2M3S")).toBe("1:02:03");
  });

  it("formats sub-hour durations without the hour part", () => {
    expect(isoDurationToClock("PT42M30S")).toBe("42:30");
    expect(isoDurationToClock("PT5M")).toBe("5:00");
    expect(isoDurationToClock("PT15S")).toBe("0:15");
  });

  it("returns an empty string for malformed input", () => {
    expect(isoDurationToClock("")).toBe("");
    expect(isoDurationToClock("1h30")).toBe("");
  });
});

describe("initials", () => {
  it("takes the first two name parts, uppercased", () => {
    expect(initials("el guerraoui hatim")).toBe("EG");
    expect(initials("Maryam Saber")).toBe("MS");
  });

  it("handles null/empty gracefully", () => {
    expect(initials(null)).toBe("?");
    expect(initials("   ")).toBe("");
  });
});

describe("escapeHtml (email broadcast)", () => {
  it("neutralizes markup-significant characters", () => {
    expect(escapeHtml(`<img src=x onerror="a('b')">`)).toBe(
      "&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;"
    );
  });

  it("escapes ampersands first to avoid double-encoding vectors", () => {
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });
});

describe("formatRelative", () => {
  it("returns an empty string for null/invalid dates", () => {
    expect(formatRelative(null)).toBe("");
    expect(formatRelative("not-a-date")).toBe("");
  });
});
