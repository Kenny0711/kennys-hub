'use server';

import { ADMIN_AUTH_COOKIE, isValidAdminToken } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { Project } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const PROJECT_SELECT =
  'id,title,description,project_url,image_url,tags,is_featured,created_at,updated_at';

export type ProjectUpdateInput = Pick<
  Project,
  'id' | 'title' | 'description' | 'project_url' | 'is_featured'
>;

export type ProjectInsertInput = Pick<
  Project,
  'title' | 'description' | 'project_url' | 'image_url' | 'tags' | 'is_featured'
>;

async function assertAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  const isAdmin = await isValidAdminToken(token);

  if (!isAdmin) {
    throw new Error('Unauthorized');
  }
}

function revalidateProjectViews() {
  revalidatePath('/');
  revalidatePath('/projects');
  revalidatePath('/admin/projects');
}

function normalizeProjectUpdate(input: ProjectUpdateInput) {
  return {
    title: input.title.trim(),
    description: input.description.trim(),
    project_url: input.project_url.trim(),
    is_featured: input.is_featured,
  };
}

export async function updateProject(input: ProjectUpdateInput): Promise<Project> {
  await assertAdmin();

  const payload = normalizeProjectUpdate(input);
  if (!payload.title) throw new Error('Project title is required');
  if (!payload.description) throw new Error('Project description is required');

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', input.id)
    .select(PROJECT_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidateProjectViews();
  return data as Project;
}

export async function toggleFeatured(id: string, isFeatured: boolean): Promise<Project> {
  await assertAdmin();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('projects')
    .update({ is_featured: isFeatured })
    .eq('id', id)
    .select(PROJECT_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidateProjectViews();
  return data as Project;
}

export async function syncProjects(projects: ProjectInsertInput[]): Promise<Project[]> {
  await assertAdmin();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('projects')
    .insert(
      projects.map((project) => ({
        title: project.title.trim(),
        description: project.description.trim(),
        project_url: project.project_url.trim(),
        image_url: project.image_url,
        tags: project.tags,
        is_featured: project.is_featured,
      }))
    )
    .select(PROJECT_SELECT);

  if (error) {
    throw new Error(error.message);
  }

  revalidateProjectViews();
  return (data ?? []) as Project[];
}
