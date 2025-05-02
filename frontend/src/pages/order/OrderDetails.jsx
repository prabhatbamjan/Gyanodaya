import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Truck, Package, CreditCard, User, MapPin } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import authAxios from '../../utils/auth';
import Loader from '../../components/Loader';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await authAxios.get(`/api/orders/${id}`);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await authAxios.patch(`/api/orders/${id}/status`, { status: newStatus });
      fetchOrderDetails();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <Loader />;
  if (!order) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Orders
            </button>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ShoppingBag className="h-6 w-6" />
              Order #{order.orderNumber}
            </h1>
          </div>
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`px-4 py-2 rounded-lg font-medium ${getStatusColor(order.status)}`}
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </h2>
              <div className="divide-y divide-gray-200">
                {order.items.map((item, index) => (
                  <div key={index} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      Rs. {item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">Rs. {order.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="font-medium text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">Rs. {order.shippingCost}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold mt-4 pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span>Rs. {order.total}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="mt-1 text-sm text-gray-900">{order.shippingAddress.street}</p>
                  <p className="text-sm text-gray-900">{order.shippingAddress.city}</p>
                  <p className="text-sm text-gray-900">{order.shippingAddress.state}, {order.shippingAddress.zipCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Shipping Method</p>
                  <p className="mt-1 text-sm text-gray-900">{order.shippingMethod}</p>
                  <p className="text-sm text-gray-500 mt-2">Estimated Delivery</p>
                  <p className="text-sm text-gray-900">{new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer and Payment Info */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </h2>
              <div className="space-y-3">
                <p className="text-sm text-gray-900">{order.customer.name}</p>
                <p className="text-sm text-gray-600">{order.customer.email}</p>
                <p className="text-sm text-gray-600">{order.customer.phone}</p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="mt-1 text-sm text-gray-900">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Status</p>
                  <p className={`mt-1 text-sm font-medium px-2.5 py-0.5 rounded-full inline-block
                    ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </p>
                </div>
                {order.transactionId && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                    <p className="mt-1 text-sm text-gray-900">{order.transactionId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Timeline</h2>
              <div className="space-y-4">
                {order.timeline?.map((event, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.status}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                      {event.note && (
                        <p className="text-sm text-gray-600 mt-1">{event.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetails;
