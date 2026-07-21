import { Section } from "@/types/theme";
import { generateId } from "@/lib/id";

// Kiểu dữ liệu cho 1 template: giống Section nhưng chưa có "id" 
// (vì id sẽ được tạo mới mỗi lần thêm vào trang, không thể cố định sẵn)
export type SectionTemplate = {
    key: string; // định danh duy nhất cho loại template, dùng làm value trong dropdown
    label: string; // tên hiển thị cho người dùng chọn
    build: () => Omit<Section, "id">; // hàm tạo ra nội dung mặc định, gọi mỗi lần "+ Add"
}

export const sectionTemplates: SectionTemplate[] = [
  {
    key: "hero",
    label: "Hero Banner",
    build: () => ({
      type: "hero",
      title: "Hero Banner",
      settings: { backgroundColor: "#f5f5f5" },
      blocks: [
        { id: generateId("block"), type: "text", content: "Tiêu đề nổi bật" },
        { id: generateId("block"), type: "button", content: "Mua ngay" },
      ],
    }),
  },
  {
    key: "featured-products",
    label: "Sản phẩm nổi bật",
    build: () => ({
      type: "featured-products",
      title: "Sản phẩm nổi bật",
      settings: { backgroundColor: "#ffffff" },
      blocks: [
        { id: generateId("block"), type: "text", content: "Sản phẩm bán chạy" },
        { id: generateId("block"), type: "image", content: "" },
      ],
    }),
  },
  {
    key: "newsletter",
    label: "Đăng ký nhận tin",
    build: () => ({
      type: "hero", // tái dùng type "hero" cho đơn giản, vì Page type hiện chỉ có 3 loại
      title: "Đăng ký nhận tin",
      settings: { backgroundColor: "#fff7ed" },
      blocks: [
        { id: generateId("block"), type: "text", content: "Nhận ưu đãi mới nhất" },
        { id: generateId("block"), type: "button", content: "Đăng ký" },
      ],
    }),
  },
  {
    key: "footer",
    label: "Chân trang",
    build: () => ({
      type: "footer",
      title: "Chân trang",
      settings: { backgroundColor: "#222222" },
      blocks: [{ id: generateId("block"), type: "text", content: "© 2026 My Shop" }],
    }),
  },
];