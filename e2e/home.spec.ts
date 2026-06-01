import { test, expect } from "@playwright/test";

test.describe("홈 페이지 — 성별 선택 (Step 1)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("첫 화면에 성별 선택 버튼 3개가 표시된다", async ({ page }) => {
    await expect(page.getByText("이상형 이미지 생성기")).toBeVisible();
    await expect(page.getByText("어떤 성별의 이상형을 원하시나요?")).toBeVisible();
    await expect(page.getByTestId("gender-남성")).toBeVisible();
    await expect(page.getByTestId("gender-여성")).toBeVisible();
    await expect(page.getByTestId("gender-상관없음")).toBeVisible();
  });

  test("성별 선택 전에는 조건 입력 폼이 보이지 않는다", async ({ page }) => {
    await expect(page.getByTestId("input-step")).not.toBeVisible();
    await expect(page.getByPlaceholder(/예\)/)).not.toBeVisible();
  });

  test("남성 선택 시 조건 입력 단계로 이동한다", async ({ page }) => {
    await page.getByTestId("gender-남성").click();
    await expect(page.getByTestId("input-step")).toBeVisible();
    await expect(page.getByText("남성")).toBeVisible();
  });

  test("여성 선택 시 조건 입력 단계로 이동한다", async ({ page }) => {
    await page.getByTestId("gender-여성").click();
    await expect(page.getByTestId("input-step")).toBeVisible();
    await expect(page.getByText("여성")).toBeVisible();
  });

  test("상관없음 선택 시 조건 입력 단계로 이동한다", async ({ page }) => {
    await page.getByTestId("gender-상관없음").click();
    await expect(page.getByTestId("input-step")).toBeVisible();
    await expect(page.getByText("상관없음")).toBeVisible();
  });
});

test.describe("홈 페이지 — 이상형 조건 입력 (Step 2)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("gender-여성").click();
  });

  test("조건 입력 폼과 생성 버튼이 표시된다", async ({ page }) => {
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

  test("다시 선택 버튼으로 성별 선택 화면으로 돌아간다", async ({ page }) => {
    await page.getByRole("button", { name: "성별 선택으로 돌아가기" }).click();
    await expect(page.getByTestId("gender-step")).toBeVisible();
    await expect(page.getByTestId("input-step")).not.toBeVisible();
  });
});
