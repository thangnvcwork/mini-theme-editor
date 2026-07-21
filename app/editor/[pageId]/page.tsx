import ThemeEditor from "@/components/ThemeEditor";
import { mockPage } from "@/data/mockPage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ pageId: string }>;
};

export default async function EditorPage({ params }: Props) {
  const session = await auth();
  if (!session) {
    redirect("/api/auth/signin"); // chưa đăng nhập → đá về trang đăng nhập
  }

  const { pageId } = await params;
  return <ThemeEditor initialPage={mockPage} pageId={pageId} />;
}