import JourneyTimeline from '@/components/home/journey-timeline';
import ProjectGallery from '@/components/portfolio/project-gallery';
import { ADMIN_AUTH_COOKIE, isValidAdminToken } from '@/lib/admin-auth';
import { getFeaturedProjects } from '@/lib/projects';
import { BriefcaseBusiness, CircuitBoard, LayoutDashboard } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const skillTags = ['C++', 'C', 'C#', 'PyTorch', 'Next.js'];

export default async function HomePage() {
  const cookieStore = await cookies();
  const [featuredProjects, isAdmin] = await Promise.all([
    getFeaturedProjects(),
    isValidAdminToken(cookieStore.get(ADMIN_AUTH_COOKIE)?.value),
  ]);

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent">
        <div className="container mx-auto flex flex-col justify-between gap-8 px-6 py-10 md:flex-row md:items-center">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-400/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-200/80">
              <CircuitBoard className="h-3.5 w-3.5" />
              Kenny&apos;s Dev Hub
            </div>

            <h1 className="bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-4xl">
              Kenny Yang
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-400">
              國立陽明交通大學 多媒體工程所碩士生。
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-medium text-zinc-400">擅長語言：</span>
              {skillTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-xs text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                <LayoutDashboard className="h-4 w-4 text-blue-200" />
                進入 Dashboard
              </Link>
              <Link
                href="https://github.com/Kenny0711"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <BriefcaseBusiness className="h-4 w-4" />
                檢視履歷
              </Link>
            </div>
          </div>

          <div className="shrink-0">
            <div className="relative inline-block">
              <Image
                src="https://github.com/Kenny0711.png"
                alt="Kenny GitHub avatar"
                width={104}
                height={104}
                className="h-24 w-24 rounded-full border border-blue-300/20 bg-zinc-900 object-cover shadow-[0_0_34px_rgba(59,130,246,0.18)] md:h-28 md:w-28"
              />
              <div className="absolute bottom-0 right-0 z-10 translate-x-[10%] translate-y-[10%] rounded-full border border-blue-500/80 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-400 shadow-[0_0_8px_rgba(59,130,246,0.6)] sm:text-xs">
                Lv.23
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-8 px-6 py-8">
        <JourneyTimeline />
        <ProjectGallery projects={featuredProjects} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
