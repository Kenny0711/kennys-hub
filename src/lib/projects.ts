import { MOCK_PROJECTS } from '@/lib/mock-data';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { Project } from '@/lib/types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export async function getFeaturedProjects(): Promise<Project[]> {
  if (USE_MOCK) return getFeaturedMockProjects();

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('projects')
      .select('id,title,description,project_url,image_url,tags,is_featured,created_at,updated_at')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      if (!isMissingProjectsTableError(error)) {
        console.warn('Falling back to mock featured projects:', error.message);
      }
      return getFeaturedMockProjects();
    }

    if (!data?.length) return getFeaturedMockProjects();
    return data as Project[];
  } catch (error) {
    console.warn('Falling back to mock featured projects:', error);
    return getFeaturedMockProjects();
  }
}

export async function getAllProjects(): Promise<Project[]> {
  if (USE_MOCK) return getAllMockProjects();

  try {
    const supabase = getSupabaseAdmin();
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
  return MOCK_PROJECTS.filter((project) => project.is_featured).slice(0, 3);
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
