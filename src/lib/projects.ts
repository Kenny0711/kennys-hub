import { MOCK_PROJECTS } from '@/lib/mock-data';
import { createClient } from '@/lib/supabase/server';
import { Project } from '@/lib/types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
const FEATURED_PROJECT_ORDER = [
  'Conditional VAE Video Prediction',
  "Kenny's Dev Hub",
  'SUMO Traffic Simulation with LCPO',
];

export async function getFeaturedProjects(): Promise<Project[]> {
  if (USE_MOCK) return getFeaturedMockProjects();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('id,title,description,project_url,image_url,tags,is_featured,created_at,updated_at')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (error) {
      if (!isMissingProjectsTableError(error)) {
        console.warn('Falling back to mock featured projects:', error.message);
      }
      return getFeaturedMockProjects();
    }

    if (!data?.length) return getFeaturedMockProjects();
    return sortFeaturedProjects(data as Project[]);
  } catch (error) {
    console.warn('Falling back to mock featured projects:', error);
    return getFeaturedMockProjects();
  }
}

export async function getAllProjects(): Promise<Project[]> {
  if (USE_MOCK) return getAllMockProjects();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('id,title,description,project_url,image_url,tags,is_featured,created_at,updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      if (!isMissingProjectsTableError(error)) {
        console.warn('Falling back to mock projects:', error.message);
      }
      return getAllMockProjects();
    }

    if (!data?.length) return getAllMockProjects();
    return data as Project[];
  } catch (error) {
    console.warn('Falling back to mock projects:', error);
    return getAllMockProjects();
  }
}

function getFeaturedMockProjects(): Project[] {
  return sortFeaturedProjects(MOCK_PROJECTS.filter((project) => project.is_featured));
}

function getAllMockProjects(): Project[] {
  return MOCK_PROJECTS;
}

function isMissingProjectsTableError(error: { code?: string; message?: string }): boolean {
  return (
    error.code === 'PGRST205' ||
    Boolean(error.message?.includes("Could not find the table 'public.projects'"))
  );
}

function sortFeaturedProjects(projects: Project[]): Project[] {
  return [...projects]
    .sort((a, b) => {
      const aIndex = FEATURED_PROJECT_ORDER.indexOf(a.title);
      const bIndex = FEATURED_PROJECT_ORDER.indexOf(b.title);
      const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
      const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;

      if (aRank !== bRank) return aRank - bRank;
      return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
    })
    .slice(0, 3);
}
