"use client";

import { useState } from "react";
import { Page } from "@/types/theme";
import { sectionTemplates } from "@/data/sectionTemplates";
import {
  DndContext,//bao bọc vùng không gian muốn kéo thả, theo dõi phần tử nào đang được kéo và quản lí sự kiện
  closestCenter,//thuật toán phát hiện va chạm, tính toán xem tâm phần tử nằm đâu
  PointerSensor,//bộ phận cảm biến lắng nghe sự kiện người dùng
  useSensor,//bộ phận cảm biến
  useSensors,//bộ phận cảm biến
  DragEndEvent,//mô tả cấu trúc khi người dùng buông chuột
} from "@dnd-kit/core";
import {
  SortableContext,//lớp bọc nằm bên trong DndContext, cung cấp dữ liệu cần thiết
  verticalListSortingStrategy,//chiến lược định hình không gian (danh sách sắp xếp theo chiều dọc)
  arrayMove,//hàm của js, nhận vào mảng vị trí cũ, vị trí mới và trả về mảng mới tinh.
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

type Props = {
  sections: Page["sections"];
  //Thay vì định nghĩa lại kiểu Section[] thủ công
  //Page["sections"] lấy đúng type của field sections trong Page
  // /nếu sau này bạn đổi cấu trúc Page, type ở đây tự cập nhật theo, không cần sửa tay ở nhiều nơi.
  selectedSectionId: string | null;
  onSelect: (sectionId: string) => void;
  onAdd: (templateKey: string) => void; // đổi kiểu
  onDelete: (sectionId: string) => void;
  onReorder: (newSections: Page["sections"]) => void;
  onReset: () => void;
};

export default function SectionList({
  sections,
  selectedSectionId,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
  onReset,
}: Props) {
  const [templateKey, setTemplateKey] = useState(sectionTemplates[0].key);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // phải kéo tối thiểu 5px mới tính là "kéo", tránh nhầm với click
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    //active — phần tử đang được kéo (bạn đang cầm nó).
    //over - phần tử đang được thả lên trên (vị trí con trỏ đang ở khi buông chuột)
    if (!over || active.id === over.id) return; // thả ra ngoài, hoặc thả đúng chỗ cũ thì bỏ qua

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    //chính là các id bạn đã gán qua useSortable({ id }) ở SortableItem

    onReorder(arrayMove(sections, oldIndex, newIndex));
    //arrayMove - lấy phần tử ở vị trí oldIndex, chuyển nó tới vị trí newIndex, các phần tử khác tự dịch chuyển theo
  }
  return (
    <aside className="w-64 border-r border-gray-300 bg-gray-50 p-4">
      <h2 className="text-sm font-semibold text-gray-500">SECTIONS</h2>
      <div className="flex items-center justify-between mb-3">
        {/* Thanh chọn + thêm template */}
        <div className="flex items-center gap-2">
          <select
            value={templateKey}
            onChange={(e) => setTemplateKey(e.target.value)}
            className="flex-1 text-xs border border-gray-300 rounded py-1.5"
          >
            {sectionTemplates.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => onAdd(templateKey)}
          className="text-xs px-2 py-1 bg-black text-white rounded hover:bg-gray-800"
        >
          Add
        </button>
        <button
          onClick={onReset}
          className="text-xs px-1 py-1 bg-red-500 text-white rounded hover:bg-red-700 ml-2"
        >
          Reset
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-1">
            {sections.map((section) => (
              <SortableItem key={section.id} id={section.id}>
                <li
                  onClick={() => onSelect(section.id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded cursor-grab active:cursor-grabbing text-sm ${
                    selectedSectionId === section.id
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <span>{section.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(section.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs px-1"
                  >
                    ✕
                  </button>
                </li>
              </SortableItem>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </aside>
  );
}
