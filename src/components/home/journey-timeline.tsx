const journeyPoints = [
  {
    period: '2020.09 - 2024.06',
    title: '元智大學',
    code: 'YZU / 01',
    description: '資訊工程學系 學士',
    achievement: '修習資訊工程核心課程，並以業界實習取代畢業專題。',
  },
  {
    period: '2023.01 - 2024.01',
    title: '兆勤科技',
    code: 'ZYXEL / 02',
    description: '產品測試開發實習生',
    achievement: '測試 AP、AC 與 Nebula 整合場景，模擬網路條件並評估 AP Throughput。',
  },
  {
    period: '2025.09 - PRESENT',
    title: '陽明交通大學',
    code: 'NYCU / 03',
    description: '多媒體工程研究所 碩士生',
    achievement: '研究 Affect Labeling 如何影響使用者在線上討論中的留言反思、改寫與情緒理解。',
  },
];

export default function JourneyTimeline() {
  return (
    <section aria-labelledby="journey-heading" className="bg-[#f2f0e9] text-[#111]">
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid gap-8 border-b border-black/20 pb-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="font-mono text-xs font-semibold uppercase text-[#e6401a]">Background / 2020 - Now</p>
            <h2 id="journey-heading" className="font-display mt-3 whitespace-nowrap text-3xl leading-none sm:text-4xl lg:text-5xl">
              Learning through building.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-black/65 lg:col-span-4 lg:col-start-9">
            將我的每一段經歷都轉化為之後的工具。
          </p>
        </div>

        <div className="divide-y divide-black/20">
          {journeyPoints.map((point, index) => (
            <article
              key={point.period}
              className="group grid gap-4 py-7 transition-colors hover:bg-[#d9ff43] sm:grid-cols-[7rem_1fr] lg:grid-cols-12 lg:gap-8 lg:px-3"
            >
              <p className="font-mono text-xs font-semibold text-black/45 lg:col-span-2">
                {String(index + 1).padStart(2, '0')}
              </p>
              <div className="lg:col-span-3">
                <p className="font-mono text-[11px] uppercase text-black/45">{point.code}</p>
                <h3 className="mt-2 text-xl font-bold">{point.title}</h3>
              </div>
              <div className="lg:col-span-3">
                <p className="font-mono text-xs uppercase text-black/45">{point.period}</p>
                <p className="mt-2 font-semibold">{point.description}</p>
              </div>
              <p className="text-sm leading-6 text-black/65 lg:col-span-4 lg:pt-3">{point.achievement}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
