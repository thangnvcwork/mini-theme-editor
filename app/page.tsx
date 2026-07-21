import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";

const pages = [
  { id: "homepage", label: "Trang chủ" },
  { id: "summer-sale", label: "Khuyến mãi hè" },
  { id: "landing-01", label: "Landing Page 01" },
];

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 text-center">
        <h1 className="text-xl font-semibold mb-4">Bạn cần đăng nhập</h1>
        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Đăng nhập với Google
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Chọn Theme để chỉnh sửa</h1>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button type="submit" className="text-sm text-gray-500 hover:underline">
            Đăng xuất
          </button>
        </form>
      </div>
      <ul className="space-y-2">
        {pages.map((p) => (
          <li key={p.id}>
            <Link
              href={`/editor/${p.id}`}
              className="block px-4 py-3 border border-gray-200 rounded hover:bg-gray-50"
            >
              {p.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}