This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
dnd-kit - là thư viện drag-drop phổ biến nhất trong hệ sinh thái React hiện nay (nhẹ, accessible, không thao túng DOM thô bạo như 1 số lib cũ).

Khái niệm cốt lõi của dnd-kit

DndContext — component bọc ngoài cùng, quản lý toàn bộ vùng có thể kéo-thả, lắng nghe sự kiện kéo.
SortableContext — bọc quanh 1 danh sách các phần tử có thể sắp xếp lại thứ tự với nhau (đúng use case của mình).
useSortable — hook dùng trong từng phần tử của danh sách, cung cấp props để gắn vào DOM (vị trí, hiệu ứng kéo, listener).
npm install uuid
npm install -D @types/uuid
npm install prisma @prisma/client
npx prisma init
npx prisma db push
npx prisma generate
npm install @prisma/adapter-pg pg
npm install -D @types/pg
npm install next-auth@beta
console.cloud.google.com
npx auth secret
npm install @vercel/blob