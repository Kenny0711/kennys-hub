import ProjectCard from '@/components/portfolio/project-card';
import { getAllProjects } from '@/lib/projects';
import { Layers3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/5 bg-gradient-to-b from-white/[0.035] to-transparent">
        <div className="container mx-auto px-6 py-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-400/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-200/80">
            <Layers3 className="h-3.5 w-3.5" />
            Portfolio Archive
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            所有專案成果
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            研究、工程、工具與學習系統的完整作品集合。精選作品會同步出現在首頁。
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} showFeaturedBadge />
          ))}
        </div>
      </div>
    </div>
  );
}
