import { test, expect } from "@playwright/test";

test.describe("/api/generate — 입력 검증", () => {
  test("user_input 없이 POST 요청 시 400 반환", async ({ request }) => {
    const res = await request.post("/api/generate", {
      data: {},
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test("500자 초과 입력 시 400 반환", async ({ request }) => {
    const res = await request.post("/api/generate", {
      data: { user_input: "가".repeat(501) },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/500자/);
  });

  test("빈 문자열 입력 시 400 반환", async ({ request }) => {
    const res = await request.post("/api/generate", {
      data: { user_input: "   " },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("/api/save — 인증 검증", () => {
  test("비로그인 상태에서 저장 요청 시 401 반환", async ({ request }) => {
    const res = await request.post("/api/save", {
      data: {
        image_url: "https://example.com/image.png",
        prompt: "test prompt",
        user_input: "테스트",
      },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/로그인/);
  });
});
