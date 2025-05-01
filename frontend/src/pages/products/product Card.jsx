import React from 'react';
import { Package } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { name, sellingPrice, costPrice, image } = product;
  
  // Calculate discount percentage if both prices are available
  const hasDiscount = sellingPrice && costPrice && costPrice > sellingPrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((costPrice - sellingPrice) / costPrice) * 100) 
    : 0;

  const getImageUrl = (imageObj) => {
    if (!imageObj) return null;
    return imageObj.secure_url || imageObj;
  };

  return (
    <div className="w-full bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 relative overflow-hidden bg-gray-100 flex items-center justify-center">
        {getImageUrl(image) ? (
          <img 
            src={getImageUrl(image)} 
            alt={name} 
            className="w-full h-full object-contain p-2" 
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Package size={36} />
            <span className="text-xs mt-2">No image</span>
          </div>
        )}
        
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {discountPercentage}% OFF
          </div>
        )}
      </div>
      
      <div className="px-4 py-3">
        <h3 className="text-sm font-medium text-gray-800 truncate">{name}</h3>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-blue-600 font-semibold text-lg">
            Rs.{sellingPrice?.toFixed(2) || '0.00'}
          </span>
          
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              Rs.{costPrice?.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
