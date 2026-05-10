import { Project } from '@/lib/types';
import Link from 'next/link';
import ProjectCard from './project-card';

interface ProjectGalleryProps {
  projects: Project[];
  isAdmin?: boolean;
}

export default function ProjectGallery({ projects, isAdmin = false }: ProjectGalleryProps) {
  if (!projects.length) return null;

  return (
    <section
      id="featured-projects"
      className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.025] p-5 md:p-6"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300/75">
            Portfolio
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-50 md:text-3xl">
            作品集
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            整合學術研究、工程開發與演算法實作，紀錄每一次的技術探索。
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          {isAdmin ? (
            <>
              <Link
                href="/admin/projects"
                className="w-fit text-sm font-medium text-zinc-500 transition-colors hover:text-white"
              >
                管理作品
              </Link>
              <Link
                href="/api/admin/logout"
                className="w-fit text-sm font-medium text-zinc-500 transition-colors hover:text-white"
              >
                登出
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="w-fit text-sm font-medium text-zinc-500 transition-colors hover:text-white"
            >
              後台登入
            </Link>
          )}
          <Link
            href="/projects"
            className="w-fit text-sm font-medium text-zinc-500 transition-colors hover:text-white"
          >
            查看全部專案 →
          </Link>
        </div>
      </div>

      <div className="relative grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.slice(0, 3).map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
