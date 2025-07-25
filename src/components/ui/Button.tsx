'use client';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-semibold transition-all duration-300 
    focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 
    disabled:cursor-not-allowed relative overflow-hidden rounded-xl transform
    hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
      text-white focus:ring-blue-500/50 shadow-blue-500/25 hover:shadow-blue-500/40
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 
      before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity
    `,
    secondary: `
      bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 
      text-white focus:ring-emerald-500/50 shadow-emerald-500/25 hover:shadow-emerald-500/40
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 
      before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity
    `,
    outline: `
      border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white 
      focus:ring-blue-500/50 bg-white hover:shadow-blue-500/25 backdrop-blur-sm
      hover:border-blue-700 transition-all duration-300
    `,
    ghost: `
      text-blue-600 hover:bg-blue-50 focus:ring-blue-500/50 rounded-xl
      hover:text-blue-700 backdrop-blur-sm
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
      text-white focus:ring-red-500/50 shadow-red-500/25 hover:shadow-red-500/40
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 
      before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm font-medium',
    md: 'px-6 py-3 text-sm font-semibold',
    lg: 'px-8 py-4 text-base font-semibold',
    xl: 'px-10 py-5 text-lg font-bold',
  };

  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`.replace(/\s+/g, ' ').trim();

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      
      <span className={`flex items-center gap-2 transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
    </button>
  );
};

export default Button;
