export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get("prompt");
  const seed = searchParams.get("seed") ?? String(Math.floor(Math.random() * 1000000));

  if (!prompt) {
    return new Response(JSON.stringify({ error: "prompt 파라미터가 필요합니다." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 프록시가 직접 URL 조립 → 이중 인코딩 없음
  const pollinationsUrl =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=1024&height=1024&nologo=true&seed=${seed}`;

  const response = await fetch(pollinationsUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: "이미지 생성에 실패했습니다." }), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";

  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
