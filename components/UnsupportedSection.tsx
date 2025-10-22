'use client';

import type { Section } from '@/lib/schemas/lesson';

interface UnsupportedSectionProps {
  section: Section;
}

export default function UnsupportedSection({ section }: UnsupportedSectionProps) {
  return (
    <section className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
        {section.title}
      </h2>
      <p className="text-yellow-700 dark:text-yellow-300">
        Section type &quot;{section.type}&quot; is not yet supported in this version.
      </p>
    </section>
  );
}
