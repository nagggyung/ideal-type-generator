"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface GenerationResult {
  image_url: string;
  prompt: string;
  user_input: string;
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("generation_result");
    if (!raw) {
      router.push("/");
      return;
    }
    try {
      setResult(JSON.parse(raw));
    } catch {
      router.push("/");
    }
  }, [router]);

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    setSaveMessage("");

    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: result.image_url,
          prompt: result.prompt,
          user_input: result.user_input,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      setSaveMessage(res.ok ? "저장되었습니다! 기록에서 확인할 수 있어요." : data.error || "저장에 실패했습니다.");
    } catch {
      setSaveMessage("서버와 연결할 수 없습니다.");
    } finally {
      setSaving(false);
    }
  }

  function handleRegenerate() {
    sessionStorage.removeItem("generation_result");
    router.push("/");
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">✨ 생성된 이상형</h1>
          <p className="text-sm text-gray-500">당신의 이상형이 완성되었어요!</p>
        </div>

        {/* 이미지 영역 */}
        <div className="rounded-2xl overflow-hidden mb-6 shadow-md bg-gray-100 min-h-64 flex items-center justify-center">
          {!imageLoaded && !imageError && (
            <div className="flex flex-col items-center gap-3 py-16">
              <div className="w-10 h-10 border-4 border-pink-300 border-t-pink-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">이미지를 불러오는 중...</p>
            </div>
          )}
          {imageError && (
            <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
              <p className="text-3xl">😢</p>
              <p className="text-sm">이미지를 불러오지 못했습니다.</p>
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.image_url}
            alt="생성된 이상형 이미지"
            className={`w-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0 absolute"}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </div>

        {/* 입력 조건 */}
        <div className="mb-4 p-3 bg-pink-50 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">입력한 조건</p>
          <p className="text-sm text-gray-700">{result.user_input}</p>
        </div>

        {/* 변환된 프롬프트 */}
        <details className="mb-4">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
            변환된 프롬프트 보기
          </summary>
          <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3 leading-relaxed">
            {result.prompt}
          </p>
        </details>

        {saveMessage && (
          <p className={`text-sm text-center mb-4 p-3 rounded-lg ${saveMessage.includes("저장되었습니다") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
            {saveMessage}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleRegenerate}
            className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium py-3 rounded-xl transition-colors"
          >
            🔄 다시 생성하기
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saveMessage.includes("저장되었습니다")}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-3 rounded-xl transition-all shadow-md"
          >
            {saving ? "저장 중..." : "💾 저장하기"}
          </button>
        </div>

        <button
          onClick={() => router.push("/history")}
          className="mt-3 w-full text-sm text-purple-500 hover:underline text-center"
        >
          내 저장 기록 보기 →
        </button>
      </div>
    </div>
  );
}
