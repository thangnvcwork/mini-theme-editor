import Link from "next/link";

const pages = [
  { id: "homepage", label: "Trang chủ" },
  { id: "summer-sale", label: "Khuyến mãi hè" },
  { id: "landing-01", label: "Landing Page 01" },
];

export default function Home() {
  return (
    <div className="max-w-md mx-auto mt-20 p-6">
      <h1 className="text-xl font-semibold mb-4">Chọn Theme để chỉnh sửa</h1>
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