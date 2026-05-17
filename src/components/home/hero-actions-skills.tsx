'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Mail, createLucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import ResumeDialog from '@/components/home/resume-dialog';

const skillGroups = [
  {
    title: 'Programming',
    skillRows: [
      ['C', 'C++', 'C#'],
      ['Python', 'JavaScript/TypeScript'],
    ],
  },
  {
    title: 'ML',
    skillRows: [['PyTorch', 'TensorFlow', 'Numpy']],
  },
  {
    title: 'Web',
    skillRows: [['Next.js', 'Supabase', 'Tailwind CSS']],
  },
  {
    title: 'Tools',
    skillRows: [['Git', 'Claude Code', 'n8n']],
  },
];

const GithubIcon = createLucideIcon('github', [
  [
    'path',
    {
      d: 'M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.41-4.04-1.41-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.78c1.02 0 2.05.14 3.01.41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z',
      fill: 'currentColor',
      stroke: 'none',
      key: 'github',
    },
  ],
]);

const FaListCheckIcon = createLucideIcon('fa-list-check', [
  ['path', { d: 'm3 6 1.6 1.6L8 4.2', key: 'check-1' }],
  ['path', { d: 'M11 6h10', key: 'line-1' }],
  ['path', { d: 'm3 12 1.6 1.6L8 10.2', key: 'check-2' }],
  ['path', { d: 'M11 12h10', key: 'line-2' }],
  ['path', { d: 'm3 18 1.6 1.6L8 16.2', key: 'check-3' }],
  ['path', { d: 'M11 18h10', key: 'line-3' }],
]);

const contactLinks = [
  {
    href: 'mailto:kenny103089@gmail.com',
    label: 'kenny103089@gmail.com',
    icon: Mail,
  },
  {
    href: 'https://github.com/Kenny0711',
    label: 'github.com/Kenny0711',
    icon: GithubIcon,
  },
];

const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-zinc-950/40 px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:border-blue-300/30 hover:bg-blue-400/10 hover:text-white';

export default function HeroActionsSkills() {
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-3">
        <ResumeDialog />

        <button
          type="button"
          aria-expanded={isSkillsOpen}
          aria-controls="home-skills-panel"
          onClick={() => setIsSkillsOpen((open) => !open)}
          className={`${secondaryButtonClass} font-semibold ${isSkillsOpen ? 'border-blue-300/35 bg-blue-400/10 text-white' : ''}`}
        >
          <FaListCheckIcon className="h-4 w-4 text-blue-200" />
          Skills
        </button>

        {contactLinks.map((item) => {
          const Icon = item.icon;
          const isExternal = item.href.startsWith('https://');

          return (
            <Link
              key={item.href}
              href={item.href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noreferrer' : undefined}
              className={secondaryButtonClass}
            >
              <Icon className="h-4 w-4 shrink-0 text-blue-200 transition-colors group-hover:text-cyan-200" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {isSkillsOpen ? (
          <motion.section
            id="home-skills-panel"
            aria-label="Skills"
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="pt-6">
              <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {skillGroups.map((group) => (
                  <div
                    key={group.title}
                    className="flex min-h-36 flex-col rounded-lg bg-white/[0.035] p-4 ring-1 ring-white/[0.04] transition-colors hover:bg-blue-400/[0.055] hover:ring-blue-300/15"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                      <h2 className="text-sm font-semibold text-blue-100">
                        {group.title}
                      </h2>
                      <span className="font-mono text-[11px] text-zinc-500">
                        {group.skillRows.flat().length}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-1 flex-col content-start gap-2">
                      {group.skillRows.map((row) => (
                        <div key={row.join('-')} className="flex flex-wrap gap-2">
                          {row.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md bg-zinc-800/70 px-2.5 py-1 text-xs leading-5 text-zinc-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
