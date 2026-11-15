import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, Package } from "lucide-react";
import {getOrderById} from "../services/orderApi.js";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getOrderById(orderId);
        setOrder(response.data);
      } catch (error) {
        console.error("Failed to load order:", error);
      }
    };
    fetchOrder();
  }, [orderId]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center shadow-sm border border-gray-100">
        <CheckCircle className="mx-auto h-16 w-16 text-emerald-500 mb-4" />
        <h1 className="text-3xl font-bold text-[#183d3d] mb-2">Order Confirmed!</h1>
        
        {order ? (
          <p className="text-gray-600 mb-6">
            Thank you, {order.customer.firstName}. Your order <strong className="text-gray-900">#{order.orderNumber}</strong> has been placed.
          </p>
        ) : (
          <p className="text-gray-600 mb-6">Loading your order details...</p>
        )}

        <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center justify-center gap-2 text-sm text-gray-700">
          <Package size={18} />
          We will send a confirmation email with updates.
        </div>

        <Link 
          to="/shop" 
          className="inline-block w-full rounded-xl bg-[#183d3d] px-6 py-3 font-semibold text-white transition hover:bg-[#245454]"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}