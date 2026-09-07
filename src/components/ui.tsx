import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Search, AlertCircle, RefreshCw, Inbox } from 'lucide-react';

/**
 * Utility for merging tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Card Component
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

/**
 * Button Component
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const variants = {
      primary: "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm active:scale-[0.98]",
      secondary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 active:scale-[0.98]",
      outline: "bg-transparent border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98]",
      ghost: "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98]",
      danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-500/20 active:scale-[0.98]",
      success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 active:scale-[0.98]",
    };

    const sizes = {
      sm: "px-3.5 py-1.5 text-xs font-bold rounded-xl",
      md: "px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl",
      lg: "px-8 py-4 text-base sm:text-lg font-bold rounded-2xl",
      icon: "p-2.5 rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
            <span>Loading...</span>
          </>
        ) : children}
      </button>
    );
  }
);
Button.displayName = "Button";

/**
 * Badge Component
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'secondary' | 'neutral' | 'indigo';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
      neutral: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
      success: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60",
      warning: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60",
      danger: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60",
      info: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60",
      primary: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60",
      indigo: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60",
      secondary: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

/**
 * Unified Status Badge Component
 */
export type PlatformStatus = 
  | 'ACTIVE' | 'active'
  | 'INACTIVE' | 'inactive'
  | 'PENDING' | 'pending'
  | 'APPROVED' | 'approved'
  | 'REJECTED' | 'rejected'
  | 'DRAFT' | 'draft'
  | 'PUBLISHED' | 'published'
  | 'ARCHIVED' | 'archived'
  | 'COMPLETED' | 'completed'
  | 'IN_PROGRESS' | 'in_progress' | 'in-progress'
  | 'UPCOMING' | 'upcoming';

export const StatusBadge: React.FC<{ status: PlatformStatus | string; className?: string }> = ({ status, className }) => {
  const norm = (status || '').toUpperCase().replace(/[\s-]/g, '_');

  let variant: BadgeProps['variant'] = 'default';
  let label = status;

  switch (norm) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'PUBLISHED':
    case 'COMPLETED':
      variant = 'success';
      break;
    case 'PENDING':
    case 'IN_PROGRESS':
    case 'UPCOMING':
      variant = 'warning';
      break;
    case 'REJECTED':
    case 'INACTIVE':
      variant = 'danger';
      break;
    case 'DRAFT':
    case 'ARCHIVED':
    default:
      variant = 'neutral';
      break;
  }

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
};

/**
 * Input Component
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 sm:h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

/**
 * Textarea Component
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

/**
 * Select Component
 */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 sm:h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

/**
 * SearchInput Component
 */
export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, placeholder = "Search...", ...props }, ref) => {
    return (
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4 pointer-events-none" />
        <Input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn("pl-10 pr-8", className)}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full"
          >
            ✕
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

/**
 * Progress Component
 */
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'indigo' | 'purple';
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, color = 'primary', ...props }, ref) => {
    const colors = {
      primary: "bg-slate-900 dark:bg-slate-100",
      success: "bg-emerald-500",
      warning: "bg-amber-500",
      danger: "bg-red-500",
      indigo: "bg-indigo-600 dark:bg-indigo-500",
      purple: "bg-purple-600 dark:bg-purple-500",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden",
          className
        )}
        {...props}
      >
        <div
          className={cn("h-full transition-all duration-500 rounded-full", colors[color])}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

/**
 * Dialog Components
 */
export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="absolute inset-0" 
        onClick={() => onOpenChange(false)} 
      />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100", className)}>
    {children}
  </div>
);

export const DialogHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("mb-6", className)}>
    {children}
  </div>
);

export const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={cn("text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight", className)}>
    {children}
  </h2>
);

export const DialogDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm mt-1.5 leading-relaxed", className)}>
    {children}
  </p>
);

export const DialogFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("mt-8 flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800", className)}>
    {children}
  </div>
);

/**
 * Tabs Components
 */
export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs = ({ defaultValue, value, onValueChange, children, className }: TabsProps) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  const currentTab = value !== undefined ? value : activeTab;

  const handleTabChange = (val: string) => {
    if (value === undefined) {
      setActiveTab(val);
    }
    onValueChange?.(val);
  };

  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { 
            activeTab: currentTab, 
            onTabChange: handleTabChange 
          });
        }
        return child;
      })}
    </div>
  );
};

export const TabsList = ({ children, className, activeTab, onTabChange }: any) => (
  <div className={cn("inline-flex h-11 sm:h-12 items-center justify-start sm:justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 text-slate-500 dark:text-slate-400 max-w-full overflow-x-auto", className)}>
    {React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, { 
          activeTab, 
          onTabChange 
        });
      }
      return child;
    })}
  </div>
);

export const TabsTrigger = ({ value, children, className, activeTab, onTabChange }: any) => (
  <button
    onClick={() => onTabChange(value)}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 sm:px-6 py-1.5 text-xs sm:text-sm font-bold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
      activeTab === value
        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
        : "hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200",
      className
    )}
  >
    {children}
  </button>
);

export const TabsContent = ({ value, children, className, activeTab }: any) => {
  if (activeTab !== value) return null;
  return (
    <div className={cn("mt-4 sm:mt-6 animate-in fade-in duration-200", className)}>
      {children}
    </div>
  );
};

/**
 * Skeleton Component
 */
export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800", className)}
      {...props}
    />
  );
};

/**
 * Modal Component
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={cn(
          "w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100",
          sizeClasses[size]
        )}
      >
        {title && (
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/40">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Label Component
 */
export const Label = ({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
  <label
    htmlFor={htmlFor}
    className={cn(
      "text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
  >
    {children}
  </label>
);

/**
 * Table Components
 */
export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
      <table ref={ref} className={cn("w-full caption-bottom text-xs sm:text-sm text-left", className)} {...props} />
    </div>
  )
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800", className)} {...props} />
  )
);
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900", className)} {...props} />
  )
);
TableBody.displayName = "TableBody";

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn("transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40", className)} {...props} />
  )
);
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th ref={ref} className={cn("h-11 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 align-middle", className)} {...props} />
  )
);
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("p-4 align-middle text-slate-700 dark:text-slate-300", className)} {...props} />
  )
);
TableCell.displayName = "TableCell";

/**
 * EmptyState Component
 */
export interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 my-4", className)}>
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

/**
 * ErrorState Component
 */
export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "An error occurred while loading this content.",
  onRetry,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 my-4", className)}>
      <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-base font-bold text-red-900 dark:text-red-300 mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-red-700 dark:text-red-400 max-w-sm mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw size={14} />
          Retry
        </Button>
      )}
    </div>
  );
};

/**
 * RadioGroup and RadioGroupItem Components
 */
interface RadioGroupContextType {
  value?: string;
  onValueChange?: (val: string) => void;
  disabled?: boolean;
  name?: string;
}

const RadioGroupContext = React.createContext<RadioGroupContextType>({});

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, defaultValue, onValueChange, disabled, name, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    const currentValue = value !== undefined ? value : internalValue;

    const handleValueChange = (val: string) => {
      if (disabled) return;
      if (value === undefined) setInternalValue(val);
      onValueChange?.(val);
    };

    return (
      <RadioGroupContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, disabled, name }}>
        <div ref={ref} role="radiogroup" className={cn("grid gap-2", className)} {...props}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  label?: React.ReactNode;
}

export const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, id, label, children, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    const isChecked = context.value === value;
    const isDisabled = context.disabled || props.disabled;

    return (
      <label
        htmlFor={id}
        className={cn(
          "flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer transition-all hover:border-slate-300 dark:hover:border-slate-700",
          isChecked && "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200",
          isDisabled && "cursor-not-allowed opacity-60",
          className
        )}
      >
        <input
          ref={ref}
          type="radio"
          id={id}
          name={context.name}
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          onChange={() => context.onValueChange?.(value)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
          {...props}
        />
        {label ? (
          <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span>
        ) : children ? (
          children
        ) : null}
      </label>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

