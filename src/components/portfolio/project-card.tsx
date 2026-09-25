import { Project } from '@/lib/types';
import { ArrowUpRight, Star } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  showFeaturedBadge?: boolean;
  index?: number;
}

export default function ProjectCard({ project, showFeaturedBadge = false, index }: ProjectCardProps) {
  const card = (
    <article className="group flex h-full flex-col bg-[#111] p-4 transition-colors duration-300 hover:bg-[#181818] sm:p-5">
      {index ? (
        <div className="mb-4 flex items-center justify-between font-mono text-[11px] uppercase text-zinc-500">
          <span>Project</span>
          <span>{String(index).padStart(2, '0')}</span>
        </div>
      ) : null}
      <div
        role="img"
        aria-label={`${project.title} cover`}
        className="relative aspect-[4/3] overflow-hidden border border-white/10 bg-zinc-950 bg-cover bg-center"
        style={{ backgroundImage: `url(${project.image_url})` }}
      >
        <div className="pointer-events-none absolute inset-0 bg-black/5 transition-colors duration-500 group-hover:bg-transparent" />
        {showFeaturedBadge && project.is_featured ? (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 border border-black bg-[#d9ff43] px-2 py-1 text-xs font-semibold text-black">
            <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
            Featured
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <h3 className="text-xl font-semibold text-zinc-50">{project.title}</h3>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">
          {project.description}
        </p>

        <div className="mt-auto pt-5">
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
              className="border border-white/15 px-2 py-1 font-mono text-[11px] font-medium text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex justify-end pt-5">
            <span className="inline-flex h-10 w-10 items-center justify-center border border-white/15 transition-colors group-hover:border-[#d9ff43] group-hover:bg-[#d9ff43] group-hover:text-black">
              <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
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
