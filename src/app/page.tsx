import HeroActionsSkills from '@/components/home/hero-actions-skills';
import JourneyTimeline from '@/components/home/journey-timeline';
import ProjectGallery from '@/components/portfolio/project-gallery';
import { ADMIN_AUTH_COOKIE, isValidAdminToken } from '@/lib/admin-auth';
import { getFeaturedProjects } from '@/lib/projects';
import { MapPin } from 'lucide-react';
import Image from 'next/image';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const cookieStore = await cookies();
  const [featuredProjects, isAdmin] = await Promise.all([
    getFeaturedProjects(),
    isValidAdminToken(cookieStore.get(ADMIN_AUTH_COOKIE)?.value),
  ]);
  return (
    <div className="home-page min-h-screen overflow-hidden">
      <section className="border-b border-white/15">
        <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-5 font-mono text-[11px] uppercase text-zinc-400 sm:text-xs">
            <p>Kenny&apos;s Dev Hub / Portfolio 2026</p>
            <div className="flex items-center gap-2 text-[#d9ff43]">
              <span className="h-2 w-2 bg-[#d9ff43]" aria-hidden="true" />
              Open to research collaborations
            </div>
          </div>

          <div className="grid gap-10 py-10 lg:grid-cols-12 lg:gap-12 lg:py-14">
            <div className="home-rise flex flex-col lg:col-span-7">
              <div>
                <p className="mb-6 flex items-center gap-2 font-mono text-xs uppercase text-zinc-400">
                  <MapPin className="h-3.5 w-3.5 text-[#ff5c35]" />
                  Hsinchu, Taiwan / NYCU
                </p>
                <h1 className="font-display whitespace-nowrap text-6xl leading-none text-[#f2f0e9] sm:text-8xl md:text-9xl lg:text-[8rem]">
                  Kenny<span className="text-[#d9ff43]">Yang.</span>
                </h1>
                <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-300 md:text-xl">
                  我研究社群媒體，也打造能被真正使用的軟體。現為國立陽明交通大學多媒體工程研究所碩士生。
                </p>
              </div>

              <HeroActionsSkills />
            </div>

            <div className="home-rise relative lg:col-span-5" style={{ animationDelay: '120ms' }}>
              <div className="relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden border border-white/20 bg-zinc-900 lg:mr-0">
                <Image
                  src="https://github.com/Kenny0711.png"
                  alt="Kenny 的 GitHub 個人頭像"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                />
                <div className="absolute left-0 top-0 bg-[#ff5c35] px-3 py-2 font-mono text-[11px] font-semibold uppercase text-black">
                  Engineer / Researcher
                </div>
                <div className="absolute bottom-0 right-0 border-l border-t border-black bg-[#d9ff43] px-4 py-3 font-mono text-sm font-semibold text-black">
                  Lv.24
                </div>
              </div>
            </div>
          </div>

          <div className="grid border-t border-white/15 md:grid-cols-3">
            <div className="py-5 md:border-r md:border-white/15 md:pr-6">
              <p className="font-mono text-[11px] uppercase text-zinc-500">Current focus</p>
              <p className="mt-2 text-sm font-semibold text-zinc-100">Social Media Analysis</p>
            </div>
            <div className="border-t border-white/15 py-5 md:border-r md:border-t-0 md:border-white/15 md:px-6">
              <p className="font-mono text-[11px] uppercase text-zinc-500">Building with</p>
              <p className="mt-2 text-sm font-semibold text-zinc-100">Next.js / Supabase / PyTorch</p>
            </div>
            <div className="border-t border-white/15 py-5 md:border-t-0 md:pl-6">
              <p className="font-mono text-[11px] uppercase text-zinc-500">Current work</p>
              <p className="mt-2 text-sm font-semibold text-zinc-100">Affect Labeling</p>
            </div>
          </div>
        </div>
      </section>

      <JourneyTimeline />

      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <ProjectGallery projects={featuredProjects} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
