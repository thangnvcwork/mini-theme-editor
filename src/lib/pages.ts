import { promises as fs } from "fs";
import path from "path";
import { Page } from "@/types/theme";
import { mockPage } from "@/data/mockPage";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

const DATA_DIR = path.join(process.cwd(), "src/data/pages");

// export async function readPage(pageId: string): Promise<Page | null> {
//   try {
//     const content = await fs.readFile(path.join(DATA_DIR, `${pageId}.json`), "utf-8");
//     return JSON.parse(content) as Page;
//   } catch {
//     return null;
//   }
// }

export async function readPage(pageId: string): Promise<Page> {
  const record = await prisma.page.findUnique({ where: { id: pageId } });
  if (!record) return mockPage;
  return record.data as unknown as Page;
}

// export async function writePage(pageId: string, page: Page): Promise<void> {
//   await fs.mkdir(DATA_DIR, { recursive: true });
//   await fs.writeFile(path.join(DATA_DIR, `${pageId}.json`), JSON.stringify(page, null, 2), "utf-8");
// }

export async function writePage(pageId: string, page: Page): Promise<void> {
  const jsonData = page as unknown as Prisma.InputJsonValue;

  await prisma.page.upsert({
    where: { id: pageId },
    update: { data: jsonData },
    create: { id: pageId, data: jsonData },
  });
}