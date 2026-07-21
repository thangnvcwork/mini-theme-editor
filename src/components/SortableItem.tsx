"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";

type Props = {
  id: string;
  children: ReactNode;
};

export default function SortableItem({ id, children }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef, //dnd-kit cần 1 tham chiếu (ref) tới phần tử DOM thật để tính toán vị trí kéo-thả.
    transform, //dnd-kit tự tính toán độ dịch chuyển khi kéo;
    transition, //dnd-kit tự tính toán độ dịch chuyển khi kéo;
    isDragging,
  } = useSortable({ id });
  //id phải trùng với id của section, để dnd-kit biết phần tử này tương ứng với item nào trong danh sách.

  const style = {
    transform: CSS.Transform.toString(transform), //biến nó thành chuỗi CSS transform hợp lệ.
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* spread 2 object chứa các thuộc tính HTML (như aria-* cho accessibility) và sự kiện chuột/cảm ứng cần thiết để kích hoạt kéo 
        Đây là lý do bạn không cần tự viết onMouseDown, onDragStart thủ công.*/}
      {children}
    </div>
  );
}
