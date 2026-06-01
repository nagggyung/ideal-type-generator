import { NextResponse } from "next/server";

export const maxDuration = 10;

// 한국어 얼굴형 슬랭 → 영문 설명 매핑 (텍스트 API 없이 항상 동작)
const FACE_TYPE_MAP: [RegExp, string][] = [
  [/강아지상/g, "puppy-like facial features (soft round face, droopy gentle eyes, cute small nose, warm innocent expression)"],
  [/고양이상/g, "cat-like facial features (sharp almond-shaped eyes, defined cheekbones, mysterious alluring look)"],
  [/토끼상/g, "bunny-like facial features (large bright eyes, small button nose, soft round cheeks)"],
  [/사슴상/g, "deer-like facial features (large doe eyes, slim elegant face, long lashes, innocent delicate expression)"],
  [/여우상/g, "fox-like facial features (sharp sophisticated eyes, high cheekbones, sexy alluring expression)"],
  [/곰상/g, "bear-like facial features (soft round face, friendly warm eyes, gentle cozy expression)"],
  [/늑대상/g, "wolf-like facial features (sharp intense eyes, strong jawline, fierce yet handsome look)"],
  [/한국인/g, "Korean"],
  [/동양인/g, "East Asian"],
  [/서양인/g, "Western European"],
  [/차분한/g, "calm serene"],
  [/다정한/g, "warm gentle caring"],
  [/지적인/g, "intelligent sophisticated"],
  [/세련된/g, "stylish refined"],
  [/귀여운/g, "cute adorable"],
  [/섹시한/g, "attractive confident"],
  [/청순한/g, "pure innocent fresh"],
  [/강렬한/g, "intense captivating"],
  [/분위기/g, "atmosphere vibe"],
  [/느낌/g, "feeling style"],
  [/외모/g, "appearance looks"],
  [/미소/g, "smile"],
  [/스타일/g, "style fashion"],
  [/젊은/g, "young"],
  [/어린/g, "young youthful"],
  [/성숙한/g, "mature sophisticated"],
  [/슬림한/g, "slim slender"],
  [/보조개/g, "dimples"],
  [/쌍꺼풀/g, "double eyelids"],
];

function buildLocalPrompt(userInput: string, genderContext: string): string {
  let translated = userInput;
  for (const [pattern, replacement] of FACE_TYPE_MAP) {
    translated = translated.replace(pattern, replacement);
  }

  return [
    `Photorealistic portrait of a beautiful ${genderContext},`,
    translated,
    "Human face and body only — absolutely no animals.",
    "Ultra-detailed face, professional studio photography, soft natural lighting, 8k resolution.",
  ].join(" ");
}

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
    gender === "남성" ? "Korean man"
    : gender === "여성" ? "Korean woman"
    : "Korean person";

  // 로컬 변환으로 기본 프롬프트 생성 (항상 동작, 동물 생성 방지 보장)
  let prompt = buildLocalPrompt(userInput, genderContext);

  // 텍스트 API로 외모 묘사를 더 풍부하게 보완
  // 반환값은 항상 로컬 프롬프트의 앞뒤 "인간 강제" 구조 안에 삽입 → 어떤 내용이 와도 인간 포트레이트
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
            content: `You are a creative prompt engineer.
Based on the description below, write a vivid English description of a person's appearance only.
Focus on: face shape, eye shape, nose, lips, expression, hair style and color, outfit, skin tone, atmosphere.
Output only the descriptive text (no "photorealistic", no "portrait", no "human" — just the appearance details).
Keep it under 100 words.`,
          },
          { role: "user", content: prompt },
        ],
        model: "openai",
        seed: Math.floor(Math.random() * 10000),
      }),
    });
    clearTimeout(timeoutId);

    if (textRes.ok) {
      const appearance = (await textRes.text()).trim();
      if (appearance) {
        // 외모 묘사를 항상 "인간 포트레이트" 구조로 감싸서 사용
        prompt = [
          `Photorealistic portrait of a beautiful ${genderContext},`,
          appearance,
          "Human person only. Ultra-detailed face, professional studio photography, soft natural lighting.",
        ].join(" ");
      }
    }
  } catch {
    // 텍스트 API 실패 — 로컬 변환 결과 그대로 사용
  }

  const encodedPrompt = encodeURIComponent(prompt.slice(0, 400));
  const seed = Math.floor(Math.random() * 1000000);
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;
  const imageUrl = `/api/image-proxy?url=${encodeURIComponent(pollinationsUrl)}`;

  return NextResponse.json({ image_url: imageUrl, prompt });
}
