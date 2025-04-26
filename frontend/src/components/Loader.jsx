import React from 'react';

const Loader = ({ size = 'medium', color = 'blue', text = 'Loading...' }) => {
  // Size class mapping
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-3',
    large: 'h-12 w-12 border-4'
  };

  // Color class mapping
  const colorClasses = {
    blue: 'border-blue-500',
    gray: 'border-gray-500',
    green: 'border-green-500',
    red: 'border-red-500'
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.medium;
  const spinnerColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`${spinnerSize} ${spinnerColor} rounded-full border-t-transparent animate-spin`}></div>
      {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
    </div>
  );
};

export default Loader; 