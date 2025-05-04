const Order = require('../models/orderModel');

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error while fetching orders' });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error while fetching the order' });
  }
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      timeline: [{ status: 'pending', note: 'Order placed' }]
    });

    res.status(201).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error while creating order' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error while updating order status' });
  }
};

// Generate order report
exports.generateReport = async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error while generating report' });
  }
};
