import { Link, LinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const AppLink = ({ className, ...props }: LinkProps) => (
  <Link className={cn('text-primary hover:underline', className)} {...props} />
);
