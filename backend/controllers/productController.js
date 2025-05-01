const Product = require('../models/productModel');
const Cloudinary = require('../middleware/cloudnery');
const fs = require('fs');

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('createdBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('createdBy', 'firstName lastName');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: error.message
        });
    }
};

// Create new product
exports.createProduct = async (req, res) => {
    try {
        const data = req.body;
        const imagePath = req.file?.path;

        if (!imagePath) {
            return res.status(400).json({ success: false, message: 'Image file is required' });
        }

        // Validate required fields
        const requiredFields = ['name', 'description', 'sellingprice', 'costprice', 'category', 'stock'];
        for (let field of requiredFields) {
            if (!data[field]) {
                return res.status(400).json({ success: false, message: `Missing field: ${field}` });
            }
        }

        if (data.sellingprice < 0 || data.costprice < 0 || data.stock < 0) {
            return res.status(400).json({ success: false, message: 'Prices and stock cannot be negative' });
        }

        // Upload to Cloudinary
        const result = await Cloudinary.uploader.upload(imagePath, { folder: 'Products' });
        fs.unlinkSync(imagePath); // delete local file

        const product = await Product.create({
            name: data.name,
            description: data.description,
            sellingPrice: data.sellingprice,
            costPrice: data.costprice,
            category: data.category,
            stock: data.stock,
            status: data.status || 'available',
            image: result,
            createdBy: req.user?._id
        });

        const populatedProduct = await Product.findById(product._id)
            .populate('createdBy', 'firstName lastName');

        res.status(201).json({ success: true, data: populatedProduct });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const data = req.body;
        const imagePath = req.file?.path;
        const productId = req.params.id;

        // Check if product exists
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Validate price and stock if provided
        if (data.sellingprice !== undefined && data.sellingprice < 0) {
            return res.status(400).json({
                success: false,
                message: 'Selling price cannot be negative'
            });
        }

        if (data.costprice !== undefined && data.costprice < 0) {
            return res.status(400).json({
                success: false,
                message: 'Cost price cannot be negative'
            });
        }

        if (data.stock !== undefined && data.stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Stock cannot be negative'
            });
        }

        // Create update object
        const updateData = {
            name: data.name,
            description: data.description,
            sellingPrice: data.sellingprice,
            costPrice: data.costprice,
            category: data.category,
            stock: data.stock,
            status: data.status
        };

        // If new image is uploaded
        if (imagePath) {
            try {
                // Upload to Cloudinary
                const result = await Cloudinary.uploader.upload(imagePath, { folder: 'Products' });
                fs.unlinkSync(imagePath); // delete local file
                updateData.image = result;
            } catch (uploadError) {
                console.error('Error uploading image:', uploadError);
                return res.status(400).json({
                    success: false,
                    message: 'Failed to upload image',
                    error: uploadError.message
                });
            }
        }

        // Update product
        const product = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy', 'firstName lastName');

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.category })
            .populate('createdBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
}; 