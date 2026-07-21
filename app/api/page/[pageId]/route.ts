import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Page } from "@/types/theme";
// import { mockPage } from "@/data/mockPage";
import { readPage, writePage } from "@/lib/pages";
import { mockPage } from "@/data/mockPage";

const DATA_DIR = path.join(process.cwd(), "src/data/pages");

// Đảm bảo thư mục lưu tồn tại trước khi đọc/ghi
async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

// GET /api/page/[pageId]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  const page = await readPage(pageId);
  return NextResponse.json(page ?? mockPage); 
}

// POST /api/page/[pageId]
export async function POST(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  await ensureDataDir();
  const newPage: Page = await request.json();
  await writePage(pageId, newPage);
  return NextResponse.json({ success: true });
}