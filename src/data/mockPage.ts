import {Page} from "@/types/theme";

export const mockPage: Page = {
    sections: [
    {
      id: "section-1",
      type: "hero",
      title: "Banner chính",
      settings: { backgroundColor: "#f5f5f5" },
      blocks: [
        { id: "block-1", type: "text", content: "Chào mừng đến cửa hàng!" },
        { id: "block-2", type: "button", content: "Mua ngay" },
      ],
    },
    {
      id: "section-2",
      type: "featured-products",
      title: "Sản phẩm nổi bật",
      settings: { backgroundColor: "#ffffff" },
      blocks: [
        { id: "block-3", type: "text", content: "Sản phẩm bán chạy" },
      ],
    },
    {
      id: "section-3",
      type: "footer",
      title: "Chân trang",
      settings: { backgroundColor: "#222222" },
      blocks: [
        { id: "block-4", type: "text", content: "© 2026 My Shop" },
      ],
    },
  ],
}