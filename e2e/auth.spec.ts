import { test, expect } from "@playwright/test";

test.describe("인증 — 로그인 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
  });

  test("로그인 페이지가 정상적으로 렌더링된다", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();
    await expect(page.getByPlaceholder("이메일")).toBeVisible();
    await expect(page.getByPlaceholder("비밀번호")).toBeVisible();
    await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
  });

  test("회원가입 모드로 전환된다", async ({ page }) => {
    await page.getByRole("button", { name: /계정이 없으신가요/ }).click();
    await expect(page.getByRole("heading", { name: "회원가입" })).toBeVisible();
    await expect(page.getByRole("button", { name: "가입하기" })).toBeVisible();
  });

  test("회원가입에서 로그인 모드로 다시 전환된다", async ({ page }) => {
    await page.getByRole("button", { name: /계정이 없으신가요/ }).click();
    await page.getByRole("button", { name: /이미 계정이 있으신가요/ }).click();
    await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();
  });

  test("잘못된 자격증명으로 로그인 시 오류 메시지를 표시한다", async ({ page }) => {
    await page.getByPlaceholder("이메일").fill("wrong@test.com");
    await page.getByPlaceholder("비밀번호").fill("wrongpassword");
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page.locator("p").filter({ hasText: /.+/ })).toBeVisible({ timeout: 10000 });
  });
});

test.describe("인증 — 히스토리 페이지 보호", () => {
  test("비로그인 상태에서 /history 접근 시 로그인 페이지로 리다이렉트된다", async ({ page }) => {
    await page.goto("/history");
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
