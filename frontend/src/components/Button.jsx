const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const base =
    'inline-flex items-center justify-center gap-2 select-none rounded-xl px-5 py-2.5 text-sm font-semibold tracking-tight ' +
    'transition-all duration-150 shadow-sm hover:shadow-md active:translate-y-px ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
    'disabled:pointer-events-none disabled:opacity-50';

  const variants = {
    primary:
      'bg-gradient-to-r from-primary to-secondary text-white ' +
      'hover:opacity-95 focus-visible:ring-primary/40 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950',
    secondary:
      'bg-white text-slate-900 border border-slate-200 ' +
      'hover:bg-slate-50 focus-visible:ring-slate-300 focus-visible:ring-offset-white ' +
      'dark:bg-white/10 dark:text-white dark:border-white/10 dark:hover:bg-white/15 dark:focus-visible:ring-white/25 dark:focus-visible:ring-offset-slate-950',
    danger:
      'bg-red-500 text-white hover:bg-red-600 ' +
      'focus-visible:ring-red-300 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950',
  };

  const variantClass = variants[variant] ?? variants.primary;

  return (
    <button className={`${base} ${variantClass} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export default Button;
