import { Project } from '@/lib/types';
import { ArrowUpRight, Star } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  showFeaturedBadge?: boolean;
}

export default function ProjectCard({ project, showFeaturedBadge = false }: ProjectCardProps) {
  const card = (
    <article className="group flex h-full flex-col rounded-xl border border-white/10 bg-zinc-900/50 p-3 shadow-[0_18px_55px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-zinc-600 hover:bg-zinc-900/70 hover:shadow-[0_24px_70px_rgba(59,130,246,0.14)]">
      <div
        role="img"
        aria-label={`${project.title} cover`}
        className="relative aspect-[16/9] overflow-hidden rounded-lg border border-white/10 bg-zinc-950 bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
        style={{ backgroundImage: `url(${project.image_url})` }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/45 via-transparent to-white/5" />
        {showFeaturedBadge && project.is_featured ? (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-xs font-semibold text-amber-100">
            <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
            Featured
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
        <h3 className="text-lg font-semibold tracking-tight text-zinc-50">{project.title}</h3>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">
          {project.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-blue-400/15 bg-blue-400/8 px-2 py-1 text-xs font-medium text-blue-100/90"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex justify-end pt-5">
          <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-blue-300" />
        </div>
      </div>
    </article>
  );

  if (!project.project_url) return card;

  return (
    <a href={project.project_url} target="_blank" rel="noreferrer" className="block h-full">
      {card}
    </a>
  );
}
