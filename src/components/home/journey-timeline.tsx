const journeyPoints = [
  {
    period: '2020.09 - 2024.06',
    title: '元智大學 (YZU)',
    description: '資訊工程學系 學士',
    achievement: '→ 修習資訊工程學系，實習取代畢業專題',
  },
  {
    period: '2023.01 - 2024.01',
    title: '兆勤科技 (Zyxel)',
    description: '產品測試開發實習生',
    achievement: '→ 測試 AP / AC / Nebula 整合場景，模擬網路條件並評估 AP Thoughput',
  },
  {
    period: '2025.09 - Present',
    title: '陽明交通大學 (NYCU)',
    description: '多媒體工程研究所 碩士生',
    achievement: '→ 碩士研究方向：Social Media Analysis',
  },
];

export default function JourneyTimeline() {
  return (
    <section aria-label="技術歷程時間軸" className="py-8 md:py-10">
      <div className="hidden md:block">
        <div className="relative">
          <div className="absolute left-0 right-0 top-[58px] h-px bg-zinc-800" />

          <div className="grid grid-cols-3 gap-8">
            {journeyPoints.map((point) => (
              <div key={point.period} className="group relative text-center">
                <p className="mb-7 font-mono text-sm text-zinc-500 transition-colors duration-300 group-hover:text-blue-200">
                  {point.period}
                </p>

                <div className="relative z-10 flex justify-center">
                  <span className="h-4 w-4 rounded-full border border-blue-200/40 bg-zinc-950 shadow-[0_0_0_6px_rgba(9,9,11,0.95),0_0_18px_rgba(59,130,246,0.32)] transition-all duration-300 group-hover:scale-125 group-hover:border-cyan-200 group-hover:bg-cyan-200 group-hover:shadow-[0_0_0_7px_rgba(8,47,73,0.7),0_0_28px_rgba(34,211,238,0.72)]" />
                </div>

                <div className="mt-6">
                  <h3 className="text-base font-bold text-white transition-colors duration-300 group-hover:text-cyan-100">
                    {point.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">{point.description}</p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">{point.achievement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative space-y-7 md:hidden">
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-zinc-800" />

        {journeyPoints.map((point) => (
          <div key={point.period} className="group relative flex gap-4">
            <span className="relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border border-blue-200/40 bg-zinc-950 shadow-[0_0_0_6px_rgba(9,9,11,0.95),0_0_18px_rgba(59,130,246,0.32)] transition-all duration-300 group-hover:scale-125 group-hover:border-cyan-200 group-hover:bg-cyan-200 group-hover:shadow-[0_0_0_7px_rgba(8,47,73,0.7),0_0_28px_rgba(34,211,238,0.72)]" />

            <div className="min-w-0 pb-1">
              <p className="font-mono text-xs text-zinc-500 transition-colors duration-300 group-hover:text-blue-200">
                {point.period}
              </p>
              <h3 className="mt-2 text-base font-bold text-white transition-colors duration-300 group-hover:text-cyan-100">
                {point.title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-zinc-400">{point.description}</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">{point.achievement}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
