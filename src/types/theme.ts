// một block là một đơn vị nhỏ nhất, ví dụ: 1 dòng text, 1 nút bấm, 1 hình ảnh
export type Block = {
  id: string;
  type: "text" | "image" | "button";
  content: string; // nội dung text, url ảnh, hoặc label của nút
};

// một section chứa nhiều Block, có settings riêng (màu nền, vv..)
export type Section = {
    id: string;
    type: "hero" | "featured-products" | "footer" | "newsletter"; // thêm "newsletter"
    title: string; // tên hiển thị trong sidebar, ví dụ "Banner chính"
    settings: {
        backgroundColor: string;
    };
    blocks: Block[];
} 

//Toàn bộ trang là 1 mảng section, theo đúng thứ tự hiển thị
export type Page = {
    sections: Section[];
} 