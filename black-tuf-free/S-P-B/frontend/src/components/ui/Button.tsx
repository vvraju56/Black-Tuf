import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:brightness-95 focus:ring-2 focus:ring-offset-2 focus:ring-primary',
  secondary: 'bg-secondary text-secondary-foreground hover:brightness-95 focus:ring-2 focus:ring-offset-2 focus:ring-secondary',
  outline: 'border border-input bg-background hover:bg-accent focus:ring-2 focus:ring-offset-2 focus:ring-primary',
  ghost: 'hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-offset-2 focus:ring-primary',
  danger: 'bg-danger text-danger-foreground hover:brightness-95 focus:ring-2 focus:ring-offset-2 focus:ring-danger',
  link: 'text-primary underline-offset-4 hover:underline focus:no-underline',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-8 w-8',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn('inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50', variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {loading ? <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

