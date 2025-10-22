'use client';

import type { TextSection as TextSectionType } from '@/lib/schemas/lesson';
import SectionChat from './SectionChat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

interface TextSectionProps {
  section: TextSectionType;
}

export default function TextSection({ section }: TextSectionProps) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
      <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeSlug,
            [
              rehypeAutolinkHeadings,
              {
                behavior: 'wrap',
                properties: {
                  className: ['anchor'],
                },
              },
            ],
          ]}
        >
          {section.content}
        </ReactMarkdown>
      </div>
      
      {/* AI chat integration */}
      <SectionChat
        sectionId={section.id}
        sectionContext={{
          id: section.id,
          title: section.title,
          type: section.type,
          content: section.content,
        }}
        initialHistory={section.ai_chat_history}
      />
    </section>
  );
}
