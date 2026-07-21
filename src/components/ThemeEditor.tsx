"use client";
//cascading render - lưu ý về hiện tượng render theo dây chuyền
//lifting state up - đưa state lên component cha chung
//prop drilling - truyền props xuống con
import { useState, useEffect, useRef } from "react";
import { Page, Section, Block } from "@/types/theme";
import SectionList from "./SectionList";
import PagePreview from "./PagePreview";
import SettingsPanel from "./SettingsPanel";
import { sectionTemplates } from "@/data/sectionTemplates";
import { useHistoryState } from "@/hooks/useHistoryState";
import { generateId } from "@/lib/id";
import { ThemeEditorSkeleton } from "./ThemeEditorSkeleton";
import { signOut } from "next-auth/react";

const STORAGE_KEY = "mini-theme-editor-page";

type Props = {
  initialPage: Page;
  pageId: string;
};

//window là môi trường trình duyệt, chỉ dùng được khi đang chạy ở phí client, không dùng được khi render phía server
export default function ThemeEditor({ initialPage, pageId }: Props) {
  // Lazy initializer: hàm này chỉ chạy đúng 1 lần, ngay khi component khởi tạo lần đầu
  const {
    state: page,
    setState: setPage,
    hydrate,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistoryState<Page>(() => {
    if (typeof window === "undefined") return initialPage; // an toàn khi chạy trên server - đang chạy trên server
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as Page;
      } catch {
        return initialPage;
      }
    }
    return initialPage;
  });

  //Generic Type dùng để định nghĩa các kiểu dữ liệu mà State - page có thể nhận, ở đây là Page (theo đúng type đã định nghĩa trong src/types/theme.ts)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const [isLoading, setIsloading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const justHydrated = useRef(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const selectedSection = page.sections.find(
    (section) => section.id === selectedSectionId,
  );
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  //1. lúc mount: gọi GET để lấy dữ liệu thật từ sever
  useEffect(() => {
    async function loadPage() {
      try {
        const res = await fetch(`/api/page/${pageId}`);
        const data: Page = await res.json();
        justHydrated.current = true; // đánh dấu: lần đổi `page` sắp tới là do hydrate, không phải user
        hydrate(data); // ĐỔI: dùng hydrate() thay vì setPage() ở đây
      } catch (err) {
        console.error(err);
      } finally {
        setIsloading(false);
      }
    }
    loadPage();
  }, [pageId]); // thêm pageId vào dependency — nếu pageId đổi (chuyển trang khác), load lại

  // Chạy mỗi khi `page` thay đổi và đã load xong lần đầu: gọi Post để lưu lên server
  useEffect(() => {
    if (isLoading) return;

    if (justHydrated.current) {
      justHydrated.current = false; // bỏ qua đúng 1 lần save này, reset lại cờ
      return;
    }

    // Huỷ timer cũ (nếu có) mỗi khi `page` đổi — "reset lại đồng hồ đếm"
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Đặt timer mới: chỉ thực sự lưu sau 800ms không có thay đổi tiếp theo
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await fetch(`/api/page/${pageId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(page),
        });
      } catch (err) {
        console.error("Không lưu được lên server:", err);
      } finally {
        setIsSaving(false);
      }
    }, 800);

    // Cleanup function: chạy khi component unmount HOẶC trước khi effect chạy lại lần sau
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [page, isLoading, pageId]);

  //hàm reset về mặc định
  function handleReset() {
    setPage(initialPage);
  }

  //thêm một section mới vào cuối danh sách
  function handleAddSection(templateKey: string) {
    const template = sectionTemplates.find((t) => t.key === templateKey);
    if (!template) return;

    const newSection: Section = {
      id: generateId("section"),
      ...template.build(),
    };

    setPage((prev) => ({ ...prev, sections: [...prev.sections, newSection] }));
  }

  // xóa section theo id
  function handleDeleteSection(sectionId: string) {
    setPage((prevPage) => ({
      ...prevPage,
      sections: prevPage.sections.filter((section) => section.id !== sectionId),
    }));

    // nếu section đang được chọn bị xóa, reset selectedSectionId
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }
  }

  // di chuyển section lên hoặc xuống trong danh sách
  function handleReorderSections(newSections: Page["sections"]) {
    setPage((prev) => ({ ...prev, sections: newSections }));
  }

  // hàm di chuyển block lên hoặc xuống trong danh sách
  function handleReorderBlocks(
    sectionId: string,
    newBlocks: Section["blocks"],
  ) {
    setPage((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, blocks: newBlocks } : s,
      ),
    }));
  }

  // Cập nhật 1 field bất kỳ trong settings của section đang chọn
  function handleUpdateSectionSettings(
    sectionId: string,
    newSettings: Partial<Section["settings"]>,
    //Partial<T> là 1 "utility type" có sẵn của TypeScript, biến tất cả field trong T thành tuỳ chọn (optional).
    //Ví dụ Section["settings"] là { backgroundColor: string } (bắt buộc), nhưng Partial<...> cho phép truyền vào object thiếu field cũng không lỗi
    //hữu ích vì sau này bạn có thể thêm nhiều field settings khác (font, padding...) mà hàm này không cần sửa lại.
  ) {
    setPage((prevPage) => ({
      ...prevPage,
      sections: prevPage.sections.map((section) =>
        section.id === sectionId
          ? { ...section, settings: { ...section.settings, ...newSettings } }
          : section,
      ),
      //duyệt qua từng section, nếu đúng section cần sửa thì trả về bản sao có cập nhật, còn không thì giữ nguyên
    }));
  }

  //Cập nhật content của một block trong section đang chọn
  function handleUpdateBlockContent(
    sectionId: string,
    blockId: string,
    newContent: string,
  ) {
    setPage((prevPage) => ({
      ...prevPage,
      sections: prevPage.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              blocks: section.blocks.map((block) =>
                block.id === blockId
                  ? { ...block, content: newContent }
                  : block,
              ),
            }
          : section,
      ),
    }));
  }

  //hàm thêm block
  function handleAddBlock(sectionId: string, blockType: Block["type"]) {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: blockType,
      content:
        blockType === "text"
          ? "Text mới"
          : blockType === "button"
            ? "Nút mới"
            : "",
    };

    setPage((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, blocks: [...s.blocks, newBlock] } : s,
      ),
    }));
  }

  //hàm xóa block
  function handleDeleteBlock(sectionId: string, blockId: string) {
    setPage((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? { ...s, blocks: s.blocks.filter((b) => b.id !== blockId) }
          : s,
      ),
    }));
  }

  // Tự động mở Settings khi chọn 1 section trên mobile (UX hợp lý hơn)
  function handleSelectSection(id: string) {
    setSelectedSectionId(id);
    setShowSettings(true);
  }

  //Hàm export
  function handleExport() {
    // Chuyển object `page` thành chuỗi JSON, format đẹp (thụt lề 2 space)
    const jsonString = JSON.stringify(page, null, 2);

    // Blob: gói dữ liệu thành "file ảo" nằm trong bộ nhớ trình duyệt
    // Blob (Binary Large Object) là cách trình duyệt biểu diễn 1 khối dữ liệu thô (text, ảnh, file...) trong bộ nhớ, chưa cần lưu ra ổ đĩa thật.
    const blob = new Blob([jsonString], { type: "application/json" });

    // Tạo 1 URL tạm trỏ tới Blob đó
    const url = URL.createObjectURL(blob);

    // Tạo 1 thẻ <a> ẩn, giả lập click để trigger tải file
    const link = document.createElement("a");
    link.href = url;
    link.download = `${pageId}.json`; // tên file khi tải về
    link.click();

    // Dọn dẹp URL tạm sau khi dùng xong, tránh rò rỉ bộ nhớ
    URL.revokeObjectURL(url);
  }

  // Hàm import
  function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const importedPage: Page = JSON.parse(text);

        // Kiểm tra sơ bộ cấu trúc file có hợp lệ không, tránh nạp rác vào app
        if (!importedPage.sections || !Array.isArray(importedPage.sections)) {
          alert("File không đúng định dạng Page hợp lệ.");
          return;
        }

        setPage(importedPage); // đây LÀ hành động của người dùng → nên dùng setPage (ghi lịch sử), không dùng hydrate
      } catch (err) {
        console.error("Lỗi đọc file:", err);
        alert("Không đọc được file JSON. Kiểm tra lại định dạng file.");
      }
    };

    reader.readAsText(file);

    // Reset value của input để có thể chọn LẠI cùng 1 file lần nữa (nếu cần import lại)
    event.target.value = "";
  }

  if (isLoading) {
    return <ThemeEditorSkeleton />;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Thanh Undo/Redo trên cùng */}
      <div className="flex items-center gap-2 border-b border-gray-300 bg-white px-4 py-2">
        {/* Nút toggle Sidebar - chỉ hiện trên mobile */}
        <button
          onClick={() => setShowSidebar((v) => !v)}
          className="md:hidden text-sm px-3 py-1 border border-gray-300 rounded"
        >
          ☰ Sections
        </button>

        <button
          onClick={undo}
          disabled={!canUndo}
          className="text-sm px-3 py-1 border border-gray-300 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          ↶ Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="text-sm px-3 py-1 border border-gray-300 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          ↷ Redo
        </button>

        <button
          onClick={handleExport}
          className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
        >
          ⬇ Export
        </button>

        {/* Input file thật bị ẩn, dùng <label> để style thành nút đẹp */}
        <label className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 cursor-pointer">
          ⬆ Import
          <input
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        <a
          href={`/preview/${pageId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 ml-auto"
        >
          👁 Xem trước
        </a>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
        >
          🚪 Đăng xuất
        </button>

        {/* Nút toggle Settings - chỉ hiện trên mobile, chỉ khi có section được chọn */}
        {selectedSectionId && (
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="md:hidden text-sm px-3 py-1 border border-gray-300 rounded"
          >
            ⚙ Settings
          </button>
        )}

        {isSaving && (
          <span className="text-xs text-gray-400 ml-2">Đang lưu...</span>
        )}
      </div>

      <div className="flex flex-1 overflow-hidde relative">
        {/* Overlay tối phía sau khi mở panel trên mobile */}
        {(showSidebar || showSettings) && (
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-10"
            onClick={() => {
              setShowSidebar(false);
              setShowSettings(false);
            }}
          />
        )}

        {/* Sidebar: trên mobile là overlay trượt ra, trên desktop luôn hiện cố định */}
        <div
          className={`${showSidebar ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 fixed md:static top-0 left-0 h-full z-20
          transition-transform duration-200`}
        >
          {/* sidebar - bên trái */}
          <SectionList
            sections={page.sections}
            selectedSectionId={selectedSectionId}
            onSelect={setSelectedSectionId}
            onAdd={handleAddSection}
            onDelete={handleDeleteSection}
            onReorder={handleReorderSections}
            onReset={handleReset}
          />
        </div>

        {/* Preview */}
        <PagePreview
          sections={page.sections}
          selectedSectionId={selectedSectionId}
          onSelect={setSelectedSectionId}
        />

        {/* Settings: tương tự Sidebar nhưng trượt từ bên phải */}
        <div
          className={`
          ${showSettings ? "translate-x-0" : "translate-x-full"}
          md:translate-x-0 fixed md:static top-0 right-0 h-full z-20
          transition-transform duration-200
          `}
        ></div>

        {/* Settings panel */}
        <SettingsPanel
          selectedSection={selectedSection}
          onUpdateSettings={handleUpdateSectionSettings}
          onUpdateBlockContent={handleUpdateBlockContent}
          onReorderBlocks={handleReorderBlocks}
          onAddBlock={handleAddBlock}
          onDeleteBlock={handleDeleteBlock}
        />
      </div>
    </div>
  );
}
