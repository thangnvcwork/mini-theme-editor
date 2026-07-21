import ThemeEditor from "@/components/ThemeEditor";
import { mockPage } from "@/data/mockPage";

type Props = {
  params: Promise<{ pageId: string }>;
};

export default async function EditorPage({ params }: Props) {
  const { pageId } = await params;

  return <ThemeEditor initialPage={mockPage} pageId={pageId} />;
}