'use client';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Pencil,
  PlaySquare,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { lessonInputSchema, type AdminLessonDto } from '@et-trader/shared';
import { adminService } from '@/features/admin/admin.api';
import { useAdminQuery } from '@/features/admin/use-admin-query';
import { PageHeading } from '@/components/ui/page-heading';
import { Panel } from '@/components/ui/panel';
import { Badge } from '@/components/ui/badge';
import { StatIcon } from '@/components/ui/stat-card';
import { buttonClass } from '@/components/ui/button';
import { errorBox, input, label, labelHint } from '@/components/ui/form';
import { mono, note } from '@/components/ui/styles';
import { cn } from '@/lib/cn';
import { LoadError } from './admin-states';
import { Loading } from './order-ui';

/** Shared title + Drive-link form used for both adding and editing a lesson. */
function LessonForm({
  initial,
  submitLabel,
  busy,
  onSubmit,
  onCancel,
}: {
  initial?: { title: string; videoUrl: string };
  submitLabel: string;
  busy: boolean;
  onSubmit: (data: { title: string; videoUrl: string }) => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? '');
  const [error, setError] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = lessonInputSchema.safeParse({ title: title.trim(), videoUrl: videoUrl.trim() });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Check the fields and try again.');
      return;
    }
    setError('');
    onSubmit(parsed.data);
  }

  return (
    <form className="grid gap-3" onSubmit={submit}>
      <div className="grid grid-cols-[1fr_1.4fr] gap-3 max-[700px]:grid-cols-1">
        <label className={label}>
          Lesson title
          <input
            className={input}
            value={title}
            maxLength={200}
            placeholder="e.g. 1 · Candlestick basics"
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className={label}>
          Video link <span className={labelHint}>(Google Drive or YouTube)</span>
          <input
            className={input}
            value={videoUrl}
            placeholder="https://drive.google.com/file/d/… or https://youtu.be/…"
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </label>
      </div>
      {error && (
        <p className={errorBox} role="alert">
          {error}
        </p>
      )}
      <div className="flex items-center gap-2">
        <button className={buttonClass({ size: 'sm' })} disabled={busy}>
          <Save size={14} /> {busy ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            className={buttonClass({ variant: 'secondary', size: 'sm' })}
            onClick={onCancel}
          >
            <X size={14} /> Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function LessonRow({
  lesson,
  index,
  total,
  busy,
  onMove,
  onEdit,
  onDelete,
}: {
  lesson: AdminLessonDto;
  index: number;
  total: number;
  busy: boolean;
  onMove: (dir: -1 | 1) => void;
  onEdit: (data: { title: string; videoUrl: string }) => Promise<void>;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  if (editing)
    return (
      <li className="rounded-[14px] border border-violet/40 bg-[#8b5cf60d] p-4">
        <LessonForm
          initial={{ title: lesson.title, videoUrl: lesson.videoUrl }}
          submitLabel="Save lesson"
          busy={saving}
          onCancel={() => setEditing(false)}
          onSubmit={async (data) => {
            setSaving(true);
            try {
              await onEdit(data);
              setEditing(false);
            } finally {
              setSaving(false);
            }
          }}
        />
      </li>
    );

  return (
    <li className="flex items-center gap-3 rounded-[14px] border border-line-strong bg-[#0a0a12cc] p-3">
      <span className={cn(mono, 'grid size-7 shrink-0 place-items-center rounded-full bg-[#ffffff0d] text-[12px] text-muted')}>
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <strong className="flex items-center gap-2 truncate text-[13.5px]">
          <span className="truncate">{lesson.title}</span>
          <Badge tone="neutral">{lesson.provider === 'youtube' ? 'YOUTUBE' : 'DRIVE'}</Badge>
        </strong>
        <a
          href={lesson.videoUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 truncate text-[11.5px] text-violet-3 hover:text-white"
        >
          {lesson.videoUrl} <ExternalLink size={11} className="shrink-0" />
        </a>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          className={buttonClass({ variant: 'secondary', size: 'sm', className: 'px-2' })}
          disabled={busy || index === 0}
          onClick={() => onMove(-1)}
          aria-label="Move up"
        >
          <ArrowUp size={14} />
        </button>
        <button
          type="button"
          className={buttonClass({ variant: 'secondary', size: 'sm', className: 'px-2' })}
          disabled={busy || index === total - 1}
          onClick={() => onMove(1)}
          aria-label="Move down"
        >
          <ArrowDown size={14} />
        </button>
        <button
          type="button"
          className={buttonClass({ variant: 'secondary', size: 'sm', className: 'px-2' })}
          onClick={() => setEditing(true)}
          aria-label="Edit lesson"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          className={buttonClass({ variant: 'secondary', size: 'sm', className: 'px-2 text-[#ff8a95]' })}
          disabled={busy}
          onClick={onDelete}
          aria-label="Delete lesson"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </li>
  );
}

/** Rounded filter pill for the "all courses / one course" selector. */
function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors',
        active
          ? 'border-violet bg-[#8b5cf61a] text-white'
          : 'border-line-strong text-muted hover:text-white',
      )}
    >
      {children}
    </button>
  );
}

export function AdminLessons() {
  const products = useAdminQuery(adminService.products);
  const courses = useMemo(
    () => (products.data ?? []).filter((p) => p.type === 'course'),
    [products.data],
  );
  const courseKey = courses.map((c) => c.productId).join(',');

  /** Every course's lessons, so "All courses" can show the full library at once. */
  const [byCourse, setByCourse] = useState<Record<string, AdminLessonDto[]> | null>(null);
  const [error, setError] = useState('');
  const [view, setView] = useState<'all' | string>('all');
  const [busy, setBusy] = useState(false);
  const [addingFor, setAddingFor] = useState<string | null>(null);

  useEffect(() => {
    if (!courseKey) return;
    const ids = courseKey.split(',');
    let cancelled = false;
    setByCourse(null);
    setError('');
    Promise.all(ids.map((id) => adminService.lessons(id)))
      .then((lists) => {
        if (!cancelled) setByCourse(Object.fromEntries(ids.map((id, i) => [id, lists[i]])));
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, [courseKey]);

  const refresh = async (productId: string) => {
    const list = await adminService.lessons(productId);
    setByCourse((prev) => ({ ...(prev ?? {}), [productId]: list }));
  };

  async function addLesson(productId: string, data: { title: string; videoUrl: string }) {
    setBusy(true);
    try {
      await adminService.addLesson(productId, data);
      setAddingFor(null);
      await refresh(productId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function editLesson(
    productId: string,
    id: string,
    data: { title: string; videoUrl: string },
  ) {
    await adminService.updateLesson(id, data);
    await refresh(productId);
  }

  async function deleteLesson(productId: string, lesson: AdminLessonDto) {
    if (!window.confirm(`Delete “${lesson.title}”? This removes it for all buyers.`)) return;
    setBusy(true);
    try {
      await adminService.deleteLesson(lesson.id);
      await refresh(productId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function move(productId: string, index: number, dir: -1 | 1) {
    const list = byCourse?.[productId];
    if (!list) return;
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[index], next[j]] = [next[j], next[index]];
    setByCourse((prev) => ({ ...(prev ?? {}), [productId]: next })); // optimistic
    setBusy(true);
    try {
      const updated = await adminService.reorderLessons(
        productId,
        next.map((l) => l.id),
      );
      setByCourse((prev) => ({ ...(prev ?? {}), [productId]: updated }));
    } catch (e) {
      setError((e as Error).message);
      await refresh(productId);
    } finally {
      setBusy(false);
    }
  }

  const visible = view === 'all' ? courses : courses.filter((c) => c.productId === view);
  const total = byCourse ? Object.values(byCourse).reduce((n, l) => n + l.length, 0) : null;

  return (
    <>
      <PageHeading
        eyebrow="COURSE LESSONS"
        title="Video lessons"
        description="Every video you've added, across all courses. Add Google Drive or YouTube links, reorder them, edit or delete — buyers watch them in order, view-only."
      />

      {products.error ? (
        <LoadError message={products.error} onRetry={products.reload} />
      ) : !products.data ? (
        <Loading label="Loading courses…" />
      ) : courses.length === 0 ? (
        <Panel className="py-10 text-center text-[13px] text-muted">No courses to manage.</Panel>
      ) : (
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Pill active={view === 'all'} onClick={() => setView('all')}>
              All courses{total !== null && ` · ${total}`}
            </Pill>
            {courses.map((c) => (
              <Pill
                key={c.productId}
                active={view === c.productId}
                onClick={() => setView(c.productId)}
              >
                {c.title}
                {byCourse && ` · ${byCourse[c.productId]?.length ?? 0}`}
              </Pill>
            ))}
          </div>

          {error && (
            <p className={errorBox} role="alert">
              {error}
            </p>
          )}

          {!byCourse && !error ? (
            <Loading label="Loading videos…" />
          ) : (
            visible.map((course, idx) => {
              const list = byCourse?.[course.productId] ?? [];
              return (
                <Panel key={course.productId} index={idx} className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2">
                      <StatIcon tone="purple" className="size-8">
                        <PlaySquare size={15} />
                      </StatIcon>
                      <span className="min-w-0">
                        <span className="block truncate">{course.title}</span>
                        <small className="block text-[11.5px] font-normal text-muted">
                          {list.length} video{list.length === 1 ? '' : 's'}
                        </small>
                      </span>
                    </h2>
                    {addingFor !== course.productId && (
                      <button
                        className={buttonClass({ size: 'sm' })}
                        onClick={() => setAddingFor(course.productId)}
                      >
                        <Plus size={14} /> Add lesson
                      </button>
                    )}
                  </div>

                  {addingFor === course.productId && (
                    <div className="rounded-[14px] border border-violet/40 bg-[#8b5cf60d] p-4">
                      <LessonForm
                        submitLabel="Add lesson"
                        busy={busy}
                        onSubmit={(data) => addLesson(course.productId, data)}
                        onCancel={() => setAddingFor(null)}
                      />
                    </div>
                  )}

                  {list.length === 0 ? (
                    <p className="py-6 text-center text-[13px] text-muted">
                      No videos yet. Add the first link above.
                    </p>
                  ) : (
                    <ol className="flex flex-col gap-2">
                      {list.map((lesson, i) => (
                        <LessonRow
                          key={lesson.id}
                          lesson={lesson}
                          index={i}
                          total={list.length}
                          busy={busy}
                          onMove={(dir) => move(course.productId, i, dir)}
                          onEdit={(data) => editLesson(course.productId, lesson.id, data)}
                          onDelete={() => deleteLesson(course.productId, lesson)}
                        />
                      ))}
                    </ol>
                  )}
                </Panel>
              );
            })
          )}

          <p className={cn(note, 'mt-0')}>
            Tip: Google Drive videos must be shared “Anyone with the link · Viewer” to stream.
            YouTube videos should be <strong>Unlisted</strong> so only your buyers can reach them.
            Either way the player is view-only with no download button — but the host&rsquo;s sharing
            setting is the real control.
          </p>
        </div>
      )}
    </>
  );
}
