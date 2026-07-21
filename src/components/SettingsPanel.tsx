"use client";

import { Section, Block } from "@/types/theme";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import { useState } from "react";
import Image from "next/image";

type Props = {
  selectedSection: Section | undefined;
  onUpdateSettings: (
    sectionId: string,
    settings: Partial<Section["settings"]>,
  ) => void;
  //onUpdateSettings nhận 2 tham số: sectionId (string) và settings (object chứa các thuộc tính cần cập nhật)
  //Partial<Section["settings"]> là kiểu dữ liệu cho phép chỉ định một phần của object settings, không cần phải cung cấp đầy đủ tất cả các thuộc tính.
  onUpdateBlockContent: (
    sectionId: string,
    blockId: string,
    content: string,
  ) => void;
  onReorderBlocks: (sectionId: string, newBlocks: Section["blocks"]) => void;
  onAddBlock: (sectionId: string, blockType: Block["type"]) => void;
  onDeleteBlock: (sectionId: string, blockId: string) => void;
};

export default function SettingsPanel({
  selectedSection,
  onUpdateSettings,
  onUpdateBlockContent,
  onReorderBlocks,
  onAddBlock,
  onDeleteBlock,
}: Props) {
  const [newBlockType, setNewBlockType] = useState<Block["type"]>("text");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleBlockDragEnd(event: DragEndEvent) {
    if (!selectedSection) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = selectedSection.blocks.findIndex(
      (b) => b.id === active.id,
    );
    const newIndex = selectedSection.blocks.findIndex((b) => b.id === over.id);

    onReorderBlocks(
      selectedSection.id,
      arrayMove(selectedSection.blocks, oldIndex, newIndex),
    );
  }

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    blockId: string,
  ) {
    const file = e.target.files?.[0];
    if (!file || !selectedSection) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const { url } = await res.json();

    onUpdateBlockContent(selectedSection.id, blockId, url); // content của block giờ là URL ảnh thật
  }

  function isValidImageUrl(value?: string): boolean {
    if (!value) return false;

    return (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("/")
    );
  }

  return (
    <aside className="w-72 border-l border-gray-300 bg-gray-50 p-4">
      {selectedSection ? (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-4">
            SETTINGS — {selectedSection.title}
          </h2>

          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">Màu nền</label>
            <input
              type="color"
              value={selectedSection.settings.backgroundColor}
              onChange={(e) =>
                onUpdateSettings(selectedSection.id, {
                  backgroundColor: e.target.value,
                })
              }
              className="w-full h-9 rounded cursor-pointer"
            />
          </div>

          {/* Thanh thêm block mới */}
          <div className="flex items-center gap-2 mb-3">
            <select
              value={newBlockType}
              onChange={(e) => setNewBlockType(e.target.value as Block["type"])}
              className="flex-1 text-sm border border-gray-300 rounded px-2 py-1.5"
            >
              <option value="text">Text</option>
              <option value="button">Button</option>
              <option value="image">Image</option>
            </select>
            <button
              onClick={() => onAddBlock(selectedSection.id, newBlockType)}
              className="text-xs px-3 py-1.5 bg-black text-white rounded hover:bg-gray-800"
            >
              + Add block
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleBlockDragEnd}
          >
            <SortableContext
              items={selectedSection.blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {selectedSection.blocks.map((block) => (
                  <SortableItem key={block.id} id={block.id}>
                    <div className="cursor-grab active:cursor-grabbing bg-white border border-gray-200 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-gray-500">
                          ⠿{" "}
                          {block.type === "text"
                            ? "Text"
                            : block.type === "button"
                              ? "Button"
                              : "Image"}
                        </label>
                        <button
                          onClick={() =>
                            onDeleteBlock(selectedSection.id, block.id)
                          }
                          onPointerDown={(e) => e.stopPropagation()}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      {block.type === "image" ? (
                        <div onPointerDown={(e) => e.stopPropagation()}>
                          {isValidImageUrl(block.content) && (
                            <div className="relative w-full h-24 mb-2">
                              <Image
                                src={block.content}
                                alt=""
                                fill
                                className="object-cover rounded border border-gray-200"
                              />
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, block.id)}
                            className="w-full text-xs"
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={block.content}
                          onChange={(e) =>
                            onUpdateBlockContent(
                              selectedSection.id,
                              block.id,
                              e.target.value,
                            )
                          }
                          onPointerDown={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        />
                      )}
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <p className="text-sm text-gray-400">Chọn 1 section để chỉnh sửa</p>
      )}
    </aside>
  );
}

//SortableItem (Bước 9b) gắn {...listeners} lên toàn bộ div bao ngoài
//nghĩa là bất kỳ chỗ nào bên trong cũng kích hoạt kéo khi nhấn giữ
//kể cả khi bạn chỉ muốn click vào ô input để gõ chữ
//Nếu không chặn, việc gõ text vào ô input sẽ bị dnd-kit "cướp" sự kiện chuột
//gây trải nghiệm khó chịu (click vào input không focus được, hoặc bị lag)
//stopPropagation() ở onPointerDown ngăn sự kiện lan lên SortableItem cha
//đảm bảo input hoạt động bình thường độc lập với vùng kéo-thả.
