const Order = require('../models/orderModel');
const catchAsync = require('../utils/catchAsync');

// Get all orders
exports.getAllOrders = catchAsync(async (req, res) => {
    const { status, startDate, endDate } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status) {
        query.status = status;
    }
    
    // Filter by date range
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const orders = await Order.find(query).sort({ createdAt: -1 });
    
    // Calculate statistics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    res.status(200).json({
        status: 'success',
        data: {
            orders,
            stats: {
                totalOrders,
                pendingOrders,
                completedOrders,
                totalRevenue
            }
        }
    });
});

// Get single order
exports.getOrder = catchAsync(async (req, res) => {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
        return res.status(404).json({
            status: 'error',
            message: 'Order not found'
        });
    }
    
    res.status(200).json({
        status: 'success',
        data: { order }
    });
});

// Create new order
exports.createOrder = catchAsync(async (req, res) => {
    const order = await Order.create({
        ...req.body,
        timeline: [{ status: 'pending', note: 'Order placed' }]
    });
    
    res.status(201).json({
        status: 'success',
        data: { order }
    });
});

// Update order status
exports.updateOrderStatus = catchAsync(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
        return res.status(404).json({
            status: 'error',
            message: 'Order not found'
        });
    }
    
    order.status = status;
    order.timeline.push({
        status,
        note: `Order marked as ${status}`
    });
    
    await order.save();
    
    res.status(200).json({
        status: 'success',
        data: { order }
    });
});

// Generate order report
exports.generateReport = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    let query = {};
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const orders = await Order.find(query).sort({ createdAt: -1 });
    
    const report = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
        ordersByStatus: {
            pending: orders.filter(order => order.status === 'pending').length,
            processing: orders.filter(order => order.status === 'processing').length,
            completed: orders.filter(order => order.status === 'completed').length,
            cancelled: orders.filter(order => order.status === 'cancelled').length
        },
        orders: orders.map(order => ({
            orderNumber: order.orderNumber,
            customer: order.customer.name,
            total: order.total,
            status: order.status,
            date: order.createdAt
        }))
    };
    
    res.status(200).json({
        status: 'success',
        data: { report }
    });
});
