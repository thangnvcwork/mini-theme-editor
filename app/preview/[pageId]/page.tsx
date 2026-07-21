import { promises as fs } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { Page } from "@/types/theme";
import { mockPage } from "@/data/mockPage";
import { readPage } from "@/lib/pages";
import PagePreview from "@/components/PagePreview";

type Props = {
  params: Promise<{ pageId: string }>;
};

// async function getPage(pageId: string): Promise<Page> {
//   const filePath = path.join(process.cwd(), "src/data/pages", `${pageId}.json`);
//   try {
//     const fileContent = await fs.readFile(filePath, "utf-8");
//     return JSON.parse(fileContent) as Page;
//   } catch {
//     return mockPage; // chưa có dữ liệu lưu cho pageId này → dùng mock mặc định
//   }
// }

export default async function PreviewPage({ params }: Props) {
  const { pageId } = await params;
  const page = await readPage(pageId);

  if(!page){
    notFound();
  }

  return (
    <PagePreview
      sections={page.sections}
      selectedSectionId={null}
      
    />
  );
}