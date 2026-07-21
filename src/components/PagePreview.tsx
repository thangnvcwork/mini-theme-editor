"use client";

import { Page } from "@/types/theme";
import Image from "next/image";

type Props = {
  sections: Page["sections"];
  //Thay vì định nghĩa lại kiểu Section[] thủ công
  //Page["sections"] lấy đúng type của field sections trong Page
  // /nếu sau này bạn đổi cấu trúc Page, type ở đây tự cập nhật theo, không cần sửa tay ở nhiều nơi.
  selectedSectionId: string | null;
  onSelect?: (id: string) => void; // thêm dấu ? — giờ là optional
};

function isValidImageUrl(value: unknown): boolean {
  console.log("isValidImageUrl:", value, typeof value);

  if (typeof value !== "string") {
    return false;
  }

  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  );
}

export default function PagePreview({
  sections,
  selectedSectionId,
  onSelect,
}: Props) {
  return (
    <main className="flex-1 overflow-y-auto">
      {sections.map((section) => (
        <section
          key={section.id}
          onClick={() => onSelect?.(section.id)} // dùng ?. — chỉ gọi nếu onSelect thực sự tồn tại
          style={{ backgroundColor: section.settings.backgroundColor }}
          className={`p-10 border-b border-gray-200 cursor-pointer transition ${
            selectedSectionId === section.id
              ? "ring-2 ring-blue-500 ring-inset"
              : ""
          }`}
        >
          {section.blocks.map((block) => (
            <div key={block.id} className="mb-3">
              {block.type === "text" && (
                <p className="text-lg">{block.content}</p>
              )}
              {block.type === "button" && (
                <button className="px-4 py-2 bg-black text-white rounded">
                  {block.content}
                </button>
              )}
              {block.type === "image" &&
                (isValidImageUrl(block.content) ? (
                  <div className="relative w-full h-64">
                    <Image
                      src={block.content}
                      alt=""
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gray-300 flex items-center justify-center text-gray-500">
                    Chưa có ảnh
                  </div>
                ))}
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
