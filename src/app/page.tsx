"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLE_KEYWORDS = [
  "차분한 분위기",
  "강아지상",
  "다정한 느낌",
  "지적인 외모",
  "따뜻한 미소",
  "세련된 스타일",
];

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function addKeyword(keyword: string) {
    setInput((prev) => (prev ? `${prev}, ${keyword}` : keyword));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: input.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "이미지 생성에 실패했습니다.");
        return;
      }

      // URL 길이 제한 우회 — sessionStorage로 전달
      sessionStorage.setItem(
        "generation_result",
        JSON.stringify({ image_url: data.image_url, prompt: data.prompt, user_input: input.trim() })
      );
      router.push("/result");
    } catch {
      setError("서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">💕 이상형 이미지 생성기</h1>
          <p className="text-gray-500 text-sm">당신의 이상형을 자유롭게 표현해보세요</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="예) 차분하고 지적인 분위기의 강아지상, 다정하고 따뜻한 미소를 가진..."
            maxLength={500}
            rows={4}
            className="border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-700 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_KEYWORDS.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => addKeyword(kw)}
                className="text-xs bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 px-3 py-1 rounded-full transition-colors"
              >
                + {kw}
              </button>
            ))}
          </div>
          <div className="text-right text-xs text-gray-400">{input.length}/500</div>

          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 rounded-lg p-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-3 rounded-xl transition-all shadow-md disabled:shadow-none"
          >
            {loading ? "🎨 이상형을 그리는 중..." : "✨ 이미지 생성하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
