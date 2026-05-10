import {
  ADMIN_AUTH_COOKIE,
  ADMIN_AUTH_MAX_AGE,
  createAdminAuthToken,
} from '@/lib/admin-auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get('password') ?? '');
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (!configuredPassword) {
    redirect('/login?error=config');
  }

  if (password !== configuredPassword) {
    redirect('/login?error=invalid');
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_AUTH_COOKIE,
    value: await createAdminAuthToken(configuredPassword),
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_AUTH_MAX_AGE,
  });

  redirect('/admin/projects');
}
