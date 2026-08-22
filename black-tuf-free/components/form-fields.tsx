import { cn } from "@/lib/utils";

interface InputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function InputField({ label, error, icon, className, ...props }: InputFieldProps) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
        <input
          className={cn(
            "peer flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-10"
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextareaField({ label, error, className, ...props }:TextareaFieldProps) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium mb-1.5">{label}</label>}
      <textarea
        className={cn(
          "peer flex min-h-[90px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
