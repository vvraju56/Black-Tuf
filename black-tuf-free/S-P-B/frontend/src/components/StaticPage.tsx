import { ReactNode } from 'react';
import { Seo } from '@/components/Seo';

interface StaticPageProps {
  title: string;
  description?: string;
  path?: string;
  children: ReactNode;
}

export const StaticPage = ({ title, description, path, children }: StaticPageProps) => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Seo title={title} description={description} path={path} />
      <h1 className="text-3xl font-bold mb-8">{title}</h1>
      <div className="prose prose-invert max-w-none space-y-6">{children}</div>
    </div>
  );
};

export default StaticPage;
