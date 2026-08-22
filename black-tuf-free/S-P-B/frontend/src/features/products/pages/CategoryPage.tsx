import { Navigate, useParams } from 'react-router-dom';
import { Seo } from '@/components/Seo';

export const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  return (
    <>
      <Seo title="Products" path={`/category/${slug}`} />
      <Navigate to={`/products?category=${slug}`} replace />
    </>
  );
};

export default CategoryPage;
