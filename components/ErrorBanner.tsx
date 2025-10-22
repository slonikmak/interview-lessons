'use client';

interface ErrorBannerProps {
  message: string;
}

export default function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-2 text-red-800 dark:text-red-200">
        Error Loading Lesson
      </h2>
      <p className="text-red-700 dark:text-red-300">{message}</p>
      <p className="mt-4 text-sm text-red-600 dark:text-red-400">
        Please check your lesson file and try again.
      </p>
    </div>
  );
}
