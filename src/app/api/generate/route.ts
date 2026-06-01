import { NextResponse } from "next/server";

export const maxDuration = 10;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("user_input" in body) ||
    typeof (body as Record<string, unknown>).user_input !== "string"
  ) {
    return NextResponse.json({ error: "user_input 필드가 필요합니다." }, { status: 400 });
  }

  const userInput = ((body as Record<string, unknown>).user_input as string).trim();

  if (!userInput) {
    return NextResponse.json({ error: "이상형 조건을 입력해주세요." }, { status: 400 });
  }
  if (userInput.length > 500) {
    return NextResponse.json({ error: "입력은 500자 이하로 작성해주세요." }, { status: 400 });
  }

  try {
    // Pollinations Text API — 한국어 → 영문 프롬프트 변환 (5초 타임아웃, 실패 시 원문 사용)
    let prompt = userInput;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const textRes = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are a creative prompt engineer. Convert the Korean description of an ideal romantic partner into a detailed English prompt for image generation. Focus on physical appearance, facial features, expression, style, and atmosphere. Make it vivid and specific. Output only the English prompt, nothing else.",
            },
            { role: "user", content: userInput },
          ],
          model: "openai",
          seed: Math.floor(Math.random() * 10000),
        }),
      });
      clearTimeout(timeoutId);

      if (textRes.ok) {
        const converted = (await textRes.text()).trim();
        if (converted) prompt = converted;
      }
    } catch {
      // 텍스트 API 실패 시 원문(한국어)으로 이미지 생성 (FLUX는 한국어도 지원)
    }

    // 이미지 URL 반환 — 브라우저가 직접 로드 (Vercel Hobby 10초 제한 우회)
    const encodedPrompt = encodeURIComponent(prompt.slice(0, 300));
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;

    return NextResponse.json({ image_url: imageUrl, prompt });
  } catch (err) {
    console.error("Generate API error:", err);
    return NextResponse.json({ error: "이미지 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
