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
  const gender = (body as Record<string, unknown>).gender as string | undefined;

  if (!userInput) {
    return NextResponse.json({ error: "이상형 조건을 입력해주세요." }, { status: 400 });
  }
  if (userInput.length > 500) {
    return NextResponse.json({ error: "입력은 500자 이하로 작성해주세요." }, { status: 400 });
  }

  const genderContext =
    gender === "남성" ? "male man"
    : gender === "여성" ? "female woman"
    : "person";

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
                `You are a creative prompt engineer specializing in Korean beauty concepts. Convert the Korean description of an ideal romantic partner into a detailed English prompt for image generation of a HUMAN ${genderContext.toUpperCase()}.

CRITICAL: Korean "상(相)" terms describe human facial types, NOT animals:
- 강아지상 = puppy-like face: round soft face, droopy gentle eyes, cute small nose, innocent warm expression
- 토끼상 = bunny-like face: big bright eyes, small cute nose, slightly prominent front teeth, soft round cheeks
- 사슴상 = deer-like face: large doe eyes, slim elegant face, innocent delicate features, long eyelashes
- 고양이상 = cat-like face: sharp almond eyes, defined cheekbones, mysterious alluring look
- 여우상 = fox-like face: sharp sexy eyes, high cheekbones, sophisticated expression

The subject MUST be a ${genderContext}. Always generate a HUMAN with these facial characteristics. Never draw actual animals.
Focus on: face shape, eye shape, nose, lips, expression, hair, outfit, atmosphere.
Output only the English prompt, nothing else.`,
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
      // 텍스트 API 실패 시 사람 포트레이트 맥락만 명시 (동물 생성 방지)
      prompt = `Realistic portrait photo of a beautiful ${genderContext}. Description: ${userInput}. Draw a human face only, not animals.`;
    }

    // Pollinations URL을 서버 프록시로 감싸서 반환
    // 브라우저가 직접 요청하면 사용자 IP가 rate limit 걸림 → 서버 IP로 우회
    const encodedPrompt = encodeURIComponent(prompt.slice(0, 300));
    const seed = Math.floor(Math.random() * 1000000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;
    const imageUrl = `/api/image-proxy?url=${encodeURIComponent(pollinationsUrl)}`;

    return NextResponse.json({ image_url: imageUrl, prompt });
  } catch (err) {
    console.error("Generate API error:", err);
    return NextResponse.json({ error: "이미지 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
