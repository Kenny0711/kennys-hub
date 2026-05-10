import { ADMIN_AUTH_COOKIE } from '@/lib/admin-auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_AUTH_COOKIE,
    value: '',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  redirect('/');
}
