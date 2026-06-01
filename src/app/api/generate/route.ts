import { NextResponse } from "next/server";

export const maxDuration = 60;

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
    // Pollinations Text API — 한국어 → 이미지 생성용 영문 프롬프트 변환 (무료, 키 불필요)
    const textRes = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

    if (!textRes.ok) {
      return NextResponse.json({ error: "프롬프트 변환에 실패했습니다." }, { status: 500 });
    }

    const prompt = (await textRes.text()).trim();
    if (!prompt) {
      return NextResponse.json({ error: "프롬프트 변환에 실패했습니다." }, { status: 500 });
    }

    // Pollinations Image API — 완전 무료, 키 불필요
    // 프롬프트가 길면 URL이 너무 길어져 실패하므로 서버에서 직접 fetch해 base64로 반환
    const encodedPrompt = encodeURIComponent(prompt.slice(0, 300));
    const seed = Math.floor(Math.random() * 1000000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;

    const imgRes = await fetch(pollinationsUrl);
    if (!imgRes.ok) {
      return NextResponse.json({ error: "이미지 생성에 실패했습니다." }, { status: 500 });
    }

    const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";
    const buffer = await imgRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const imageUrl = `data:${contentType};base64,${base64}`;

    return NextResponse.json({ image_url: imageUrl, prompt });
  } catch (err) {
    console.error("Generate API error:", err);
    return NextResponse.json({ error: "이미지 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
