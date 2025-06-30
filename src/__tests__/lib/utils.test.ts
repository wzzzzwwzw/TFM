import { cn, formatTimeDelta, normalize, similarity } from "@/lib/utils";

describe("utils", () => {
  it("cn merges class names", () => {
    expect(cn("a", "b")).toContain("a");
    expect(cn("a", false, "b")).toContain("b");
  });

  it("formatTimeDelta formats seconds", () => {
    expect(formatTimeDelta(3661)).toBe("1h 1m 1s");
    expect(formatTimeDelta(60)).toBe("1m");
    expect(formatTimeDelta(0)).toBe("");
  });

  it("normalize lowercases and trims", () => {
    expect(normalize("Hello, World!")).toBe("hello world");
    expect(normalize("  Foo   Bar ")).toBe("foo bar");
  });

  it("similarity returns 1 for identical", () => {
    expect(similarity("abc", "abc")).toBe(1);
  });

  it("similarity returns 0 for completely different", () => {
    expect(similarity("abc", "")).toBe(0);
  });

  it("similarity is symmetric", () => {
    expect(similarity("abc", "ab")).toBe(similarity("ab", "abc"));
  });
});