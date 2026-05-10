import { ADMIN_AUTH_COOKIE, isValidAdminToken } from '@/lib/admin-auth';
import { MOCK_PROJECTS } from '@/lib/mock-data';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { Project } from '@/lib/types';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminProjectsClient from './admin-projects-client';

const PROJECT_SELECT =
  'id,title,description,project_url,image_url,tags,is_featured,created_at,updated_at';

type AdminProjectsState = {
  projects: Project[];
  isUsingMockProjects: boolean;
  notice: string | null;
};

async function loadAdminProjects(): Promise<AdminProjectsState> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('projects')
      .select(PROJECT_SELECT)
      .order('created_at', { ascending: false });

    if (error) {
      return {
        projects: MOCK_PROJECTS,
        isUsingMockProjects: true,
        notice: `目前使用 mock 預覽資料。Supabase 讀取失敗：${error.message}`,
      };
    }

    if (!data?.length) {
      return {
        projects: MOCK_PROJECTS,
        isUsingMockProjects: true,
        notice: 'Supabase projects 表目前沒有資料，可以先選好精選作品，再同步成正式資料。',
      };
    }

    return {
      projects: data as Project[],
      isUsingMockProjects: false,
      notice: null,
    };
  } catch (error) {
    return {
      projects: MOCK_PROJECTS,
      isUsingMockProjects: true,
      notice:
        error instanceof Error
          ? `目前使用 mock 預覽資料。${error.message}`
          : '目前使用 mock 預覽資料，無法初始化 Supabase admin client。',
    };
  }
}

export default async function AdminProjectsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  const isAdmin = await isValidAdminToken(token);

  if (!isAdmin) {
    redirect('/login?next=/admin/projects');
  }

  const initialState = await loadAdminProjects();

  return <AdminProjectsClient {...initialState} />;
}
