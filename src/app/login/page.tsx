import { LockKeyhole } from 'lucide-react';

function getErrorMessage(error: string | undefined): string | null {
  if (error === 'invalid') return '密碼錯誤，請再試一次。';
  if (error === 'config') return '尚未設定 ADMIN_PASSWORD 環境變數。';
  return null;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-zinc-900/60 p-6 shadow-2xl shadow-black/30">
        <div className="mb-6">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-blue-300/20 bg-blue-400/10 text-blue-200 shadow-[0_0_22px_rgba(59,130,246,0.18)]">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">後台登入</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            輸入管理密碼後即可編輯作品集與首頁精選。
          </p>
        </div>

        <form action="/api/admin/login" method="post" className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-zinc-300">密碼</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-zinc-950/70 px-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-blue-400/50"
              placeholder="ADMIN_PASSWORD"
              required
            />
          </label>

          {errorMessage ? (
            <p className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            進入後台
          </button>
        </form>
      </div>
    </div>
  );
}
