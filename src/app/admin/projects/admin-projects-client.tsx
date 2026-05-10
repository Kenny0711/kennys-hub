'use client';

import {
  syncProjects,
  toggleFeatured,
  updateProject,
  type ProjectInsertInput,
} from '@/actions/projects';
import { Project } from '@/lib/types';
import { ExternalLink, Pencil, Save, Star, UploadCloud, X } from 'lucide-react';
import { FormEvent, useState, useTransition } from 'react';

type ProjectDraft = Pick<Project, 'title' | 'description' | 'project_url' | 'is_featured'>;

type AdminProjectsClientProps = {
  projects: Project[];
  isUsingMockProjects: boolean;
  notice: string | null;
};

function toDraft(project: Project): ProjectDraft {
  return {
    title: project.title,
    description: project.description,
    project_url: project.project_url,
    is_featured: project.is_featured,
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function applyDraft(project: Project, draft: ProjectDraft): Project {
  return {
    ...project,
    ...draft,
    updated_at: new Date().toISOString(),
  };
}

function toInsertPayload(project: Project): ProjectInsertInput {
  return {
    title: project.title,
    description: project.description,
    project_url: project.project_url,
    image_url: project.image_url,
    tags: project.tags,
    is_featured: project.is_featured,
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '未知錯誤';
}

export default function AdminProjectsClient({
  projects: initialProjects,
  isUsingMockProjects: initialIsUsingMockProjects,
  notice: initialNotice,
}: AdminProjectsClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [draft, setDraft] = useState<ProjectDraft | null>(null);
  const [isUsingMockProjects, setIsUsingMockProjects] = useState(initialIsUsingMockProjects);
  const [notice, setNotice] = useState<string | null>(initialNotice);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isBusy = isPending || pendingAction !== null;

  function openEditor(project: Project) {
    setEditingProject(project);
    setDraft(toDraft(project));
    setNotice(null);
  }

  function closeEditor() {
    setEditingProject(null);
    setDraft(null);
    setPendingAction(null);
  }

  function replaceProject(updatedProject: Project) {
    setProjects((current) =>
      current.map((project) => (project.id === updatedProject.id ? updatedProject : project))
    );
  }

  function syncMockProjects() {
    setPendingAction('sync');
    startTransition(async () => {
      try {
        const syncedProjects = await syncProjects(projects.map(toInsertPayload));
        setProjects(syncedProjects);
        setIsUsingMockProjects(false);
        setNotice('已透過 Server Action 同步到 Supabase。之後 Featured 星號會直接更新資料庫。');
      } catch (error) {
        setNotice(`同步失敗：${getErrorMessage(error)}。請確認已設定 SUPABASE_SERVICE_ROLE_KEY。`);
      } finally {
        setPendingAction(null);
      }
    });
  }

  function toggleProjectFeatured(project: Project) {
    const nextFeatured = !project.is_featured;

    if (isUsingMockProjects || !isUuid(project.id)) {
      replaceProject({ ...project, is_featured: nextFeatured, updated_at: new Date().toISOString() });
      setNotice('已更新本頁預覽。按「同步目前作品到 Supabase」後，這些設定才會永久保存。');
      return;
    }

    setPendingAction(`toggle:${project.id}`);
    startTransition(async () => {
      try {
        const updatedProject = await toggleFeatured(project.id, nextFeatured);
        replaceProject(updatedProject);
        setNotice('精選狀態已更新。');
      } catch (error) {
        setNotice(`更新失敗：${getErrorMessage(error)}`);
      } finally {
        setPendingAction(null);
      }
    });
  }

  function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingProject || !draft) return;

    if (isUsingMockProjects || !isUuid(editingProject.id)) {
      const updatedProject = applyDraft(editingProject, draft);
      replaceProject(updatedProject);
      setNotice('已更新本頁預覽。按「同步目前作品到 Supabase」後，這些設定才會永久保存。');
      closeEditor();
      return;
    }

    setPendingAction(`save:${editingProject.id}`);
    startTransition(async () => {
      try {
        const updatedProject = await updateProject({
          id: editingProject.id,
          title: draft.title,
          description: draft.description,
          project_url: draft.project_url,
          is_featured: draft.is_featured,
        });
        replaceProject(updatedProject);
        setNotice('專案已透過 Server Action 更新。');
        closeEditor();
      } catch (error) {
        setNotice(`儲存失敗：${getErrorMessage(error)}`);
      } finally {
        setPendingAction(null);
      }
    });
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/5 bg-gradient-to-b from-white/[0.035] to-transparent">
        <div className="container mx-auto px-6 py-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/15 bg-amber-300/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/80">
            <Star className="h-3.5 w-3.5" />
            Project Admin
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            作品集管理系統
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            編輯作品名稱、敘述、專案連結與首頁精選狀態。所有寫入都會先通過 Server Action 驗證，再由
            Service Role Key 寫入 Supabase。
          </p>
        </div>
      </div>

      <div className="container mx-auto space-y-4 px-6 py-8">
        {notice ? (
          <div className="rounded-lg border border-amber-300/20 bg-amber-300/8 px-4 py-3 text-sm text-amber-100">
            {notice}
          </div>
        ) : null}

        {isUsingMockProjects ? (
          <div className="flex flex-col gap-3 rounded-xl border border-blue-400/15 bg-blue-400/[0.06] px-4 py-4 text-sm text-blue-100 sm:flex-row sm:items-center sm:justify-between">
            <p>
              目前是 mock 預覽模式。你可以先選好三個 Featured，再透過 Server Action 同步到 Supabase。
            </p>
            <button
              type="button"
              onClick={syncMockProjects}
              disabled={isBusy}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-blue-300/20 bg-blue-300/10 px-3 py-2 font-semibold text-blue-50 transition-colors hover:bg-blue-300/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UploadCloud className="h-4 w-4" />
              {pendingAction === 'sync' ? '同步中...' : '同步目前作品到 Supabase'}
            </button>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50">
          <div className="grid gap-4 border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-500 md:grid-cols-[1.2fr_2fr_1fr_140px]">
            <span>Project</span>
            <span>Description</span>
            <span>Featured</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-white/10">
            {projects.map((project) => {
              const isProjectPending =
                pendingAction === `toggle:${project.id}` || pendingAction === `save:${project.id}`;

              return (
                <div
                  key={project.id}
                  className="grid items-center gap-4 px-4 py-4 md:grid-cols-[1.2fr_2fr_1fr_140px]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-zinc-100">{project.title}</p>
                      {!isUuid(project.id) ? (
                        <span className="rounded border border-zinc-700 bg-zinc-950/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                          Mock
                        </span>
                      ) : null}
                    </div>
                    {project.project_url ? (
                      <a
                        href={project.project_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-blue-200"
                      >
                        Open link <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                  </div>

                  <p className="line-clamp-2 text-sm leading-6 text-zinc-400">
                    {project.description}
                  </p>

                  <div>
                    <button
                      type="button"
                      onClick={() => toggleProjectFeatured(project)}
                      disabled={isProjectPending}
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        project.is_featured
                          ? 'border-amber-300/20 bg-amber-300/10 text-amber-100 hover:bg-amber-300/15'
                          : 'border-zinc-700 bg-zinc-950/40 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          project.is_featured ? 'fill-amber-300 text-amber-300' : ''
                        }`}
                      />
                      {isProjectPending ? 'Saving' : project.is_featured ? 'Featured' : 'Normal'}
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => openEditor(project)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Pencil className="h-4 w-4" />
                      編輯
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {editingProject && draft ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <form
            onSubmit={saveProject}
            className="w-full max-w-2xl rounded-xl border border-white/10 bg-zinc-950 p-5 shadow-2xl shadow-black/40"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  Edit Project
                </p>
                <h2 className="mt-2 text-xl font-bold text-white">{editingProject.title}</h2>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Close editor"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-zinc-300">專案名稱</span>
                <input
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-blue-400/50"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-300">專案敘述</span>
                <textarea
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                  className="mt-2 min-h-28 w-full resize-y rounded-lg border border-white/10 bg-zinc-900 px-3 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-blue-400/50"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-300">專案網址</span>
                <input
                  value={draft.project_url}
                  onChange={(event) => setDraft({ ...draft, project_url: event.target.value })}
                  className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-blue-400/50"
                  placeholder="https://..."
                  type="url"
                />
              </label>

              <button
                type="button"
                onClick={() => setDraft({ ...draft, is_featured: !draft.is_featured })}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                  draft.is_featured
                    ? 'border-amber-300/30 bg-amber-300/10 text-amber-100 hover:bg-amber-300/15'
                    : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Star
                  className={`h-4 w-4 ${
                    draft.is_featured ? 'fill-amber-300 text-amber-300' : ''
                  }`}
                />
                {draft.is_featured ? '首頁精選中' : '設為首頁精選'}
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isBusy}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {pendingAction?.startsWith('save:') ? '儲存中...' : '儲存'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
