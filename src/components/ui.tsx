import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
        "bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden",
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
      primary: "bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200 active:scale-[0.98]",
      secondary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-[0.98]",
      outline: "bg-transparent border-2 border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-[0.98]",
      ghost: "bg-transparent text-slate-600 hover:bg-slate-100 active:scale-[0.98]",
      danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100 active:scale-[0.98]",
      success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-[0.98]",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl",
      md: "px-6 py-3.5 text-sm font-black uppercase tracking-widest rounded-2xl",
      lg: "px-10 py-5 text-lg font-black tracking-tight rounded-[1.5rem]",
      icon: "p-3 rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center transition-all disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
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
      default: "bg-slate-100 text-slate-600",
      neutral: "bg-slate-100 text-slate-600 border border-slate-200",
      success: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      warning: "bg-amber-50 text-amber-600 border border-amber-100",
      danger: "bg-red-50 text-red-600 border border-red-100",
      info: "bg-blue-50 text-blue-600 border border-blue-100",
      primary: "bg-indigo-50 text-indigo-600 border border-indigo-100",
      indigo: "bg-indigo-50 text-indigo-600 border border-indigo-100",
      secondary: "bg-slate-100 text-slate-600 border border-slate-200",
    };


    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
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
 * Input Component
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50",
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
 * Progress Component
 */
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'indigo' | 'purple';
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, color = 'primary', ...props }, ref) => {
    const colors = {
      primary: "bg-slate-900",
      success: "bg-emerald-500",
      warning: "bg-amber-500",
      danger: "bg-red-500",
      indigo: "bg-indigo-600",
      purple: "bg-purple-600",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "h-2 w-full bg-slate-100 rounded-full overflow-hidden",
          className
        )}
        {...props}
      >
        <div
          className={cn("h-full transition-all duration-500", colors[color])}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div 
        className="absolute inset-0" 
        onClick={() => onOpenChange(false)} 
      />
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("p-8 md:p-12 max-h-[90vh] overflow-y-auto", className)}>
    {children}
  </div>
);

export const DialogHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("mb-8", className)}>
    {children}
  </div>
);

export const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={cn("text-3xl font-black text-slate-900 tracking-tight", className)}>
    {children}
  </h2>
);

export const DialogDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("text-slate-500 font-medium mt-2", className)}>
    {children}
  </p>
);

export const DialogFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("mt-12 flex flex-col sm:flex-row justify-end gap-4", className)}>
    {children}
  </div>
);

/**
 * RadioGroup Components
 */
export interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const RadioGroup = ({ value, onValueChange, children, className, disabled }: RadioGroupProps) => {
  return (
    <div className={cn("grid gap-2", className)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { 
            selectedValue: value, 
            onValueChange,
            disabled
          });
        }
        return child;
      })}
    </div>
  );
};

export const RadioGroupItem = ({ value, id, className, selectedValue, onValueChange, disabled }: any) => {
  return (
    <input
      type="radio"
      id={id}
      name="radio-group"
      value={value}
      checked={selectedValue === value}
      onChange={(e) => onValueChange(e.target.value)}
      disabled={disabled}
      className={cn("sr-only", className)}
    />
  );
};

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
  <div className={cn("inline-flex h-12 items-center justify-center rounded-2xl bg-slate-100 p-1.5 text-slate-500", className)}>
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
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2 text-sm font-black uppercase tracking-widest transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
      activeTab === value
        ? "bg-white text-slate-900 shadow-sm"
        : "hover:bg-white/50 hover:text-slate-600",
      className
    )}
  >
    {children}
  </button>
);

export const TabsContent = ({ value, children, className, activeTab }: any) => {
  if (activeTab !== value) return null;
  return (
    <div className={cn("mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300", className)}>
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
      className={cn("animate-pulse rounded-2xl bg-slate-100", className)}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={cn(
          "w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]",
          sizeClasses[size]
        )}
      >
        {title && (
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
            <h3 className="text-base font-black text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold text-sm transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto flex-1">
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
      "text-sm font-bold text-slate-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
  >
    {children}
  </label>
);
