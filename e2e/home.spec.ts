import { test, expect } from "@playwright/test";

test.describe("홈 페이지 — 이상형 조건 입력 폼", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("홈 페이지 타이틀과 입력 폼이 보인다", async ({ page }) => {
    await expect(page.getByText("이상형 이미지 생성기")).toBeVisible();
    await expect(page.getByPlaceholder(/예\)/)).toBeVisible();
    await expect(page.getByRole("button", { name: /이미지 생성하기/ })).toBeVisible();
  });

  test("예시 키워드를 클릭하면 입력창에 추가된다", async ({ page }) => {
    await page.getByRole("button", { name: "+ 차분한 분위기" }).click();
    const textarea = page.getByPlaceholder(/예\)/);
    await expect(textarea).toHaveValue("차분한 분위기");

    await page.getByRole("button", { name: "+ 강아지상" }).click();
    await expect(textarea).toHaveValue("차분한 분위기, 강아지상");
  });

  test("입력 없이 생성 버튼을 클릭할 수 없다", async ({ page }) => {
    const btn = page.getByRole("button", { name: /이미지 생성하기/ });
    await expect(btn).toBeDisabled();
  });

  test("글자 수 카운터가 표시된다", async ({ page }) => {
    await expect(page.getByText("0/500")).toBeVisible();
    const textarea = page.getByPlaceholder(/예\)/);
    await textarea.fill("테스트 입력");
    await expect(page.getByText("6/500")).toBeVisible();
  });

  test("500자 초과 입력 시 textarea가 제한된다", async ({ page }) => {
    const textarea = page.getByPlaceholder(/예\)/);
    const longText = "가".repeat(510);
    await textarea.fill(longText);
    const value = await textarea.inputValue();
    expect(value.length).toBeLessThanOrEqual(500);
  });
});
