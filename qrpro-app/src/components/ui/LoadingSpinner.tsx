import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(({ 
  size = 'md', 
  text = 'Chargement...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-32 w-32'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-[#F15A22] mx-auto ${sizeClasses[size]}`}></div>
        {text && <p className="mt-4 text-gray-600">{text}</p>}
      </div>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

// Composant de chargement pour les pages admin
export const AdminPageLoader: React.FC = React.memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
));

AdminPageLoader.displayName = 'AdminPageLoader';
