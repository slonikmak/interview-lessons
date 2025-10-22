import { LessonSchema, type Lesson } from '@/lib/schemas/lesson';
import { NotFoundError, ValidationError } from '@/lib/errors';
import LessonSection from '@/components/LessonSection';
import ErrorBanner from '@/components/ErrorBanner';
import { readFileSync } from 'fs';
import { join } from 'path';

async function fetchLesson(): Promise<Lesson> {
  try {
    // Read directly from the public directory during SSR
    const filePath = join(process.cwd(), 'public', 'two_sum_full.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // Validate with zod
    const result = LessonSchema.safeParse(data);
    
    if (!result.success) {
      throw new ValidationError('Invalid lesson format', result.error.format());
    }

    return result.data;
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
      throw new NotFoundError('Lesson file not found');
    }

    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    throw new Error('Failed to load lesson');
  }
}

export default async function Home() {
  let lesson: Lesson | null = null;
  let error: string | null = null;

  try {
    lesson = await fetchLesson();
  } catch (e) {
    error = e instanceof Error ? e.message : 'An unexpected error occurred';
  }

  if (error) {
    return (
      <main className="min-h-screen p-8">
        <ErrorBanner message={error} />
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="min-h-screen p-8">
        <ErrorBanner message="No lesson content available" />
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
        {lesson.difficulty && (
          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
            Difficulty: {lesson.difficulty}
          </p>
        )}
        {lesson.goal && (
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
            {lesson.goal}
          </p>
        )}
        {lesson.topics && lesson.topics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {lesson.topics.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="space-y-8">
        {lesson.sections.map((section) => (
          <LessonSection key={section.id} section={section} />
        ))}
      </div>
    </main>
  );
}
