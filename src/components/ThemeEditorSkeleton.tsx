export function ThemeEditorSkeleton() {
  return (
    <div className="flex flex-col h-screen animate-pulse">
      {/* Thanh toolbar skeleton */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-2">
        <div className="h-7 w-16 bg-gray-200 rounded" />
        <div className="h-7 w-16 bg-gray-200 rounded" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar skeleton */}
        <aside className="w-64 border-r border-gray-200 bg-gray-50 p-4 space-y-2">
          <div className="h-8 w-full bg-gray-200 rounded mb-3" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-full bg-gray-200 rounded" />
          ))}
        </aside>

        {/* Preview skeleton */}
        <main className="flex-1 p-10 space-y-6">
          <div className="h-40 w-full bg-gray-200 rounded" />
          <div className="h-40 w-full bg-gray-100 rounded" />
        </main>

        {/* Settings panel skeleton */}
        <aside className="w-72 border-l border-gray-200 bg-gray-50 p-4 space-y-3">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-9 w-full bg-gray-200 rounded" />
          <div className="h-16 w-full bg-gray-200 rounded" />
        </aside>
      </div>
    </div>
  );
}