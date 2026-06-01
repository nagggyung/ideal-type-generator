import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DeleteButton from "./DeleteButton";

interface Generation {
  id: string;
  user_input: string;
  prompt: string;
  image_url: string;
  created_at: string;
}

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: generations, error } = await supabase
    .from("generations")
    .select("id, user_input, prompt, image_url, created_at")
    .eq("is_saved", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">기록을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">💾 내 이상형 기록</h1>
          <a
            href="/"
            className="text-sm text-pink-500 hover:underline"
          >
            + 새로 생성하기
          </a>
        </div>

        {!generations || generations.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md p-12 text-center">
            <p className="text-4xl mb-4">🖼️</p>
            <p className="text-gray-500 mb-4">저장된 이상형이 없습니다.</p>
            <a
              href="/"
              className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-xl font-medium"
            >
              이상형 생성하러 가기
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {(generations as Generation[]).map((gen) => (
              <div key={gen.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gen.image_url}
                    alt={gen.user_input}
                    className="w-full object-cover max-h-80"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs text-gray-400 mb-2">
                    {new Date(gen.created_at).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-sm font-medium text-gray-800 mb-2">{gen.user_input}</p>
                  <details>
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                      프롬프트 보기
                    </summary>
                    <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2 leading-relaxed">
                      {gen.prompt}
                    </p>
                  </details>
                  <div className="mt-4 flex justify-end">
                    <DeleteButton id={gen.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
