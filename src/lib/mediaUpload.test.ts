import { describe, expect, it } from "vitest";
import {
  MAX_CLUB_IMAGE_BYTES,
  assertValidClubImage,
  clubUploadErrorMessage,
  sanitizeFileName,
} from "@/lib/mediaUpload";

describe("sanitizeFileName", () => {
  it("keeps word characters and collapses the rest", () => {
    expect(sanitizeFileName("Bureau 2026 — Photo.JPG")).toBe("Bureau-2026-Photo.JPG");
  });

  it("uses only the last path segment", () => {
    expect(sanitizeFileName("uploads/2026/poster.png")).toBe("poster.png");
  });

  it("never returns an empty string", () => {
    expect(sanitizeFileName("???")).not.toBe("");
  });
});

describe("assertValidClubImage", () => {
  const image = (type: string, size: number) => new File(["x"], "img", { type }) as File;

  it("accepts the four policy image types", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp", "image/gif"]) {
      expect(() => assertValidClubImage(image(type, 1024))).not.toThrow();
    }
  });

  it("rejects non-image mime types", () => {
    expect(() => assertValidClubImage(image("video/mp4", 1024))).toThrow(/format/i);
    expect(() => assertValidClubImage(image("", 1024))).toThrow(/format/i);
  });

  it("rejects files above the storage policy limit", () => {
    const oversized = { type: "image/png", size: MAX_CLUB_IMAGE_BYTES + 1 } as unknown as File;
    expect(() => assertValidClubImage(oversized)).toThrow(/25 Mo/);
  });
});

describe("clubUploadErrorMessage", () => {
  it("maps storage policy rejections to a friendly size/format message", () => {
    expect(clubUploadErrorMessage(new Error("Payload too large: size exceeded"))).toMatch(/25 Mo/);
    expect(clubUploadErrorMessage(new Error("new row violates policy mimetype"))).toMatch(/JPG/);
  });

  it("passes other messages through", () => {
    expect(clubUploadErrorMessage(new Error("Stockage non configuré."))).toBe("Stockage non configuré.");
    expect(clubUploadErrorMessage("boom")).toBe("Upload impossible.");
  });
});
