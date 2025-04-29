
import React from 'react';

const ProductCard = ({ image, name, price, oldPrice, discount }) => {
  return (
    <div className="w-60 bg-white shadow-md rounded-lg overflow-hidden">
      <img src={image} alt={name} className="w-full h-40 object-contain p-2" />
      <div className="px-4 py-2">
        <h3 className="text-sm font-medium text-gray-800 truncate">{name}</h3>
        <div className="mt-2">
          <span className="text-orange-600 font-semibold text-lg">Rs.{price}</span>
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-sm text-gray-400 line-through">Rs.{oldPrice}</span>
          <span className="text-sm text-gray-600">-{discount}%</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
