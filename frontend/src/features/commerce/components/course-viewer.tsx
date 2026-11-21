'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  PlayCircle,
  ShieldCheck,
} from 'lucide-react';
import type { CourseContentDto } from '@et-trader/shared';
import { PageHeading, headingActions } from '@/components/ui/page-heading';
import { Panel } from '@/components/ui/panel';
import { buttonClass } from '@/components/ui/button';
import { errorBox } from '@/components/ui/form';
import { StatIcon } from '@/components/ui/stat-card';
import { mono } from '@/components/ui/styles';
import { coursesApi } from '@/features/commerce/courses.api';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/cn';

export function CourseViewer({ productId }: { productId: string }) {
  const [content, setContent] = useState<CourseContentDto | null>(null);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    coursesApi
      .content(productId)
      .then((data) => {
        setContent(data);
        setCurrent(0);
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 403) setLocked(true);
        else setError((e as Error).message);
      });
  }, [productId]);

  if (locked)
    return (
      <Panel className="grid place-items-center gap-4 py-16 text-center">
        <StatIcon tone="purple" className="size-12">
          <Lock size={22} />
        </StatIcon>
        <h2>This course is locked</h2>
        <p className="max-w-[420px] text-[13.5px] leading-[1.7] text-muted">
          Buy this course to unlock its video lessons. Once your payment is approved, the lessons
          open here.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={`/checkout/${productId}`} className={buttonClass()}>
            Buy this course <ArrowRight size={15} />
          </Link>
          <Link href="/dashboard/courses" className={buttonClass({ variant: 'secondary' })}>
            My courses
          </Link>
        </div>
      </Panel>
    );

  if (error)
    return (
      <p className={errorBox} role="alert">
        {error}
      </p>
    );

  if (!content)
    return (
      <p className="text-[13px] text-muted" aria-busy="true">
        Opening your course…
      </p>
    );

  const lessons = content.lessons;
  const active = lessons[current];

  return (
    <>
      <PageHeading
        eyebrow="STUDY MATERIAL"
        title={content.title}
        description="Your video lessons, in order. Watch here — downloads are disabled."
        actions={
          <div className={headingActions}>
            <Link href="/dashboard/courses" className={buttonClass({ variant: 'secondary' })}>
              <ArrowLeft size={15} /> My courses
            </Link>
          </div>
        }
      />

      {lessons.length === 0 ? (
        <Panel className="grid place-items-center gap-4 py-14 text-center">
          <StatIcon tone="purple" className="size-12">
            <PlayCircle size={22} />
          </StatIcon>
          <h2>Lessons are on the way</h2>
          <p className="max-w-[420px] text-[13.5px] leading-[1.7] text-muted">
            Your access is active. The video lessons for this course are being added and will appear
            here shortly.
          </p>
        </Panel>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-5 max-[1000px]:grid-cols-1">
          <div className="grid min-w-0 gap-4">
            <Panel className="overflow-hidden p-0">
              <div
                className="relative aspect-video w-full bg-black"
                onContextMenu={(e) => e.preventDefault()}
              >
                {active && (
                  <iframe
                    key={active.id}
                    src={active.embedUrl}
                    title={active.title}
                    allow={
                      active.provider === 'youtube'
                        ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                        : 'autoplay; encrypted-media'
                    }
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="absolute inset-0 h-full w-full border-0"
                  />
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <span className={cn(mono, 'text-[11px] text-violet-3')}>
                    LESSON {current + 1} / {lessons.length}
                  </span>
                  <h2 className="truncate">{active?.title}</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={buttonClass({ variant: 'secondary', size: 'sm' })}
                    disabled={current === 0}
                    onClick={() => setCurrent((i) => Math.max(0, i - 1))}
                  >
                    <ArrowLeft size={14} /> Prev
                  </button>
                  <button
                    type="button"
                    className={buttonClass({ size: 'sm' })}
                    disabled={current >= lessons.length - 1}
                    onClick={() => setCurrent((i) => Math.min(lessons.length - 1, i + 1))}
                  >
                    Next <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </Panel>
            <p className="flex items-center gap-2 text-[12px] text-dim">
              <ShieldCheck size={14} className="shrink-0 text-violet-3" />
              Lessons stream view-only and can&apos;t be downloaded. Please don&apos;t share or
              record them — your access is personal.
            </p>
          </div>

          <Panel className="p-3">
            <p className="px-2 py-2 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              Course lessons
            </p>
            <ol className="flex flex-col gap-1">
              {lessons.map((lesson, i) => {
                const isActive = i === current;
                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      onClick={() => setCurrent(i)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-[12px] border p-2.5 text-left transition-colors',
                        isActive
                          ? 'border-violet bg-[#8b5cf61a]'
                          : 'border-transparent hover:border-line-strong hover:bg-white/[0.03]',
                      )}
                    >
                      <span
                        className={cn(
                          'grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-bold',
                          isActive
                            ? 'bg-violet text-white'
                            : 'bg-[#ffffff0d] text-muted',
                        )}
                      >
                        {isActive ? <PlayCircle size={15} /> : i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block truncate text-[13px]',
                            isActive ? 'font-semibold text-white' : 'text-[#cdc6dd]',
                          )}
                        >
                          {lesson.title}
                        </span>
                      </span>
                      {isActive && <CheckCircle2 size={15} className="shrink-0 text-violet-3" />}
                    </button>
                  </li>
                );
              })}
            </ol>
          </Panel>
        </div>
      )}
    </>
  );
}
