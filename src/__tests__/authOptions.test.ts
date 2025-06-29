import { authOptions } from "@/lib/auth";

describe("NextAuth Options", () => {
  it("should have Google Provider", () => {
    const google = authOptions.providers.find((p: any) => p.id === 'google');
    expect(google).toBeDefined();
  });

  it("should use JWT strategy", () => {
    expect(authOptions.session?.strategy).toBe("jwt");
  });
});
