interface SkeletonBaseProps {
  className?: string;
}

export function SkeletonBlock({ className = '' }: SkeletonBaseProps) {
  return (
    <div
      className={`animate-pulse rounded-[16px] bg-[#202020] ${className}`}
    />
  );
}

export function SkeletonText({ className = '' }: SkeletonBaseProps) {
  return (
    <div
      className={`animate-pulse h-3 rounded-full bg-[#202020] ${className}`}
    />
  );
}

export function SkeletonCircle({ className = '' }: SkeletonBaseProps) {
  return (
    <div
      className={`animate-pulse rounded-full bg-[#202020] ${className}`}
    />
  );
}

export function SplashScreenSkeleton() {
  return (
    <div className="h-full flex flex-col bg-[#0E0E0E]">
      <div className="flex-1 flex flex-col justify-between">
        <div className="pt-[52px] px-5 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[22px] bg-[#202020] animate-pulse mb-5 mx-auto" />
          <SkeletonBlock className="h-10 w-48 mx-auto mb-2" />
          <SkeletonText className="w-32 mx-auto" />
        </div>
        <div className="bg-[#171717] rounded-t-[30px] px-5 pt-6 pb-5 mt-8 border-t border-[#2C2C2C]/50">
          <SkeletonBlock className="h-7 w-3/4 mb-2" />
          <SkeletonText className="w-40 mb-6" />
          <SkeletonBlock className="h-14 w-full rounded-full mb-3" />
          <SkeletonBlock className="h-14 w-full rounded-full mb-3" />
          <SkeletonBlock className="h-14 w-full rounded-full mb-3" />
          <div className="border-t border-[#2C2C2C] pt-4 mt-2 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 px-3">
                <SkeletonCircle className="w-8 h-8 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <SkeletonText className="h-4 w-3/4" />
                  <SkeletonText className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AudioPlayerSkeleton() {
  return (
    <div className="h-full bg-[#0E0E0E] p-5 flex flex-col">
      <div className="flex items-center justify-between pt-[52px] mb-auto">
        <SkeletonCircle className="w-12 h-12" />
        <SkeletonBlock className="h-8 w-28 rounded-full" />
      </div>
      <div className="flex-1 flex flex-col justify-center -mt-12">
        <SkeletonText className="w-24 mb-2" />
        <SkeletonBlock className="h-8 w-3/4 mb-6" />
        <div className="h-16 flex items-end gap-[3px] mb-6">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 animate-pulse rounded-full bg-[#202020]"
              style={{ height: `${Math.random() * 60 + 20}%` }}
            />
          ))}
        </div>
        <SkeletonBlock className="h-1.5 w-full rounded-full mb-2" />
        <div className="flex justify-between mb-8">
          <SkeletonText className="w-10" />
          <SkeletonText className="w-10" />
        </div>
        <div className="flex items-center justify-center gap-5 mb-6">
          <SkeletonCircle className="w-12 h-12" />
          <SkeletonCircle className="w-12 h-12" />
          <SkeletonCircle className="w-20 h-20" />
          <SkeletonCircle className="w-12 h-12" />
          <SkeletonCircle className="w-12 h-12" />
        </div>
      </div>
      <SkeletonBlock className="h-14 w-full rounded-full" />
    </div>
  );
}

export function LocationModalSkeleton() {
  return (
    <div className="bg-[#171717] rounded-t-[30px] w-full h-[85vh] flex flex-col border-t border-[#2C2C2C]/50">
      <div className="flex justify-center pt-3 pb-2">
        <SkeletonBlock className="w-12 h-1.5 rounded-full" />
      </div>
      <div className="px-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SkeletonCircle className="w-5 h-5" />
          <SkeletonBlock className="h-5 w-32" />
        </div>
      </div>
      <div className="flex-1 bg-[#0E0E0E] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mx-auto mb-3" />
          <SkeletonText className="w-32 mx-auto" />
        </div>
      </div>
    </div>
  );
}
