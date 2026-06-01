import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const { image_url, prompt, user_input } = body as {
    image_url?: string;
    prompt?: string;
    user_input?: string;
  };

  if (!image_url || !prompt || !user_input) {
    return NextResponse.json(
      { error: "image_url, prompt, user_input 필드가 필요합니다." },
      { status: 400 }
    );
  }

  // DALL·E URL에서 이미지를 Supabase Storage에 업로드
  let storedImageUrl = image_url;
  try {
    const imageRes = await fetch(image_url);
    if (imageRes.ok) {
      const blob = await imageRes.blob();
      const fileName = `${user.id}/${Date.now()}.png`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("generation-images")
        .upload(fileName, blob, { contentType: "image/png", upsert: false });

      if (!uploadError && uploadData) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("generation-images").getPublicUrl(uploadData.path);
        storedImageUrl = publicUrl;
      }
    }
  } catch {
    // Storage 업로드 실패 시 원본 URL 사용
  }

  const { error: insertError } = await supabase.from("generations").insert({
    user_id: user.id,
    user_input,
    prompt,
    image_url: storedImageUrl,
    is_saved: true,
  });

  if (insertError) {
    console.error("Insert error:", insertError);
    return NextResponse.json({ error: "저장에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
