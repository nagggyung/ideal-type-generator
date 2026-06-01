export const runtime = "edge";

const ALLOWED_HOST = "image.pollinations.ai";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const encodedUrl = searchParams.get("url");

  if (!encodedUrl) {
    return new Response(JSON.stringify({ error: "url 파라미터가 필요합니다." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(encodedUrl);
  } catch {
    return new Response(JSON.stringify({ error: "잘못된 URL입니다." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Pollinations 도메인만 허용
  if (targetUrl.hostname !== ALLOWED_HOST) {
    return new Response(JSON.stringify({ error: "허용되지 않는 도메인입니다." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const response = await fetch(targetUrl.toString(), {
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
