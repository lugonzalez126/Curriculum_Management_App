export function SkeletonCard() {
    return (
      <div className="animate-pulse">
        <div
          className="rounded-[14px] bg-stone-200"
          style={{ aspectRatio: '16 / 10' }}
        />
        <div className="mt-3 flex items-start gap-2.5">
          <div className="w-[26px] h-[26px] rounded-full bg-stone-200 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="h-3.5 w-3/4 bg-stone-200 rounded mb-2" />
            <div className="h-2.5 w-1/2 bg-stone-200 rounded" />
          </div>
        </div>
      </div>
    )
  }
  
  export function SkeletonLine({ width = '100%', height = '14px', className = '' }) {
    return (
      <div
        className={`animate-pulse bg-stone-200 rounded ${className}`}
        style={{ width, height }}
      />
    )
  }
  
  export function SkeletonBuilder() {
    return (
      <div className="max-w-[820px] mx-auto px-12 py-10 animate-pulse">
        <div className="h-3 w-32 bg-stone-200 rounded mb-8" />
        <div className="h-8 w-2/3 bg-stone-200 rounded mb-4" />
        <div className="h-20 w-full bg-stone-200 rounded-lg mb-4" />
        <div className="h-10 w-full bg-stone-200 rounded-lg mb-10" />
        <div className="h-14 w-full bg-stone-200 rounded-xl mb-3" />
        <div className="h-14 w-full bg-stone-200 rounded-xl mb-3" />
        <div className="h-14 w-full bg-stone-200 rounded-xl" />
      </div>
    )
  }
  
  export function SkeletonLessonViewer() {
    return (
      <div className="flex min-h-[calc(100vh-56px)]">
        <aside className="w-[260px] shrink-0 bg-white animate-pulse" style={{ borderRight: '0.5px solid #E7E5E4' }}>
          <div className="px-4 py-4">
            <div className="h-4 w-3/4 bg-stone-200 rounded mb-2" />
            <div className="h-3 w-1/2 bg-stone-200 rounded" />
          </div>
          <div className="px-4 py-2 flex flex-col gap-3">
            <div className="h-3 w-full bg-stone-200 rounded" />
            <div className="h-3 w-4/5 bg-stone-200 rounded ml-4" />
            <div className="h-3 w-3/5 bg-stone-200 rounded ml-4" />
            <div className="h-3 w-4/5 bg-stone-200 rounded ml-4" />
            <div className="h-3 w-full bg-stone-200 rounded mt-2" />
            <div className="h-3 w-3/5 bg-stone-200 rounded ml-4" />
          </div>
        </aside>
        <main className="flex-1 px-12 py-10 animate-pulse">
          <div className="max-w-[820px] mx-auto">
            <div className="h-3 w-24 bg-stone-200 rounded mb-3" />
            <div className="h-8 w-2/3 bg-stone-200 rounded mb-8" />
            <div className="h-4 w-full bg-stone-200 rounded mb-3" />
            <div className="h-4 w-full bg-stone-200 rounded mb-3" />
            <div className="h-4 w-4/5 bg-stone-200 rounded mb-6" />
            <div className="h-4 w-full bg-stone-200 rounded mb-3" />
            <div className="h-4 w-3/4 bg-stone-200 rounded" />
          </div>
        </main>
      </div>
    )
  }