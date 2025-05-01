const mongoose = require('mongoose');

const cloudinaryImageSchema = new mongoose.Schema({
    public_id: String,
    secure_url: String,
    url: String,
    asset_id: String,
    signature: String,
    width: Number,
    height: Number,
    format: String
}, { _id: false });

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true
    },
    sellingPrice: {
        type: Number,
        required: [true, 'Seling Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    costPrice: {
        type: Number,
        required: [true, 'Cost Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: ['books', 'uniforms', 'stationery', 'electronics', 'other']
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative']
    },
    image: {
        type: cloudinaryImageSchema,
        default: null
    },
    status: {
        type: String,
        enum: ['available', 'out-of-stock', 'discontinued'],
        default: 'available'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add index for better query performance
productSchema.index({ name: 1, category: 1 });
productSchema.index({ status: 1 });

module.exports = mongoose.model('Product', productSchema); 