const express = require('express');
const router = express.Router();
// const { protect, authorize } = require('../middleware/auth');
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory
} = require('../controllers/productController');
const authController = require('../middleware/auth');
const upload = require("../middleware/uplode");
// Public routes
router.get('/', getAllProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);

router.use(authController.protect);
// Admin only routes
router.post('/',upload.single("image"), createProduct);
router.put('/:id',upload.single("image"), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router; 