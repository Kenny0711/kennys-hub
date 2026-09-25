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
      className="relative"
    >
      <div className="mb-10 grid gap-7 border-b border-white/15 pb-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="font-mono text-xs font-semibold uppercase text-[#ff5c35]">
            Portfolio / 2025-Present
          </p>
          <h2 className="font-display mt-3 text-6xl leading-none text-[#f2f0e9] sm:text-7xl">
            Projects.
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-4 lg:col-span-4 lg:col-start-9 lg:justify-end">
          {isAdmin ? (
            <>
              <Link
                href="/admin/projects"
                className="w-fit font-mono text-xs font-medium text-zinc-500 transition-colors hover:text-white"
              >
                管理作品
              </Link>
              <Link
                href="/api/admin/logout"
                className="w-fit font-mono text-xs font-medium text-zinc-500 transition-colors hover:text-white"
              >
                登出
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="w-fit font-mono text-xs font-medium text-zinc-500 transition-colors hover:text-white"
            >
              後台登入
            </Link>
          )}
          <Link
            href="/projects"
            className="w-fit font-mono text-xs font-semibold uppercase text-[#d9ff43] transition-colors hover:text-white"
          >
            查看全部專案
          </Link>
        </div>
      </div>

      <div className="grid gap-px border border-white/15 bg-white/15 md:grid-cols-2 xl:grid-cols-3">
        {projects.slice(0, 3).map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index + 1} />
        ))}
      </div>
    </section>
  );
}
