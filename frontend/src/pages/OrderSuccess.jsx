import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
  ArrowRight,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { getOrderById } from "../services/orderApi.js";

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
    <main className="min-h-[85vh] bg-linear-to-b from-emerald-50/70 via-white to-white px-4 py-12 flex items-center justify-center">

      <div className="w-full max-w-xl">

        {/* Success Illustration */}
        <div className="flex justify-center mb-8">
          <div className="relative flex items-center justify-center">

            <div className="absolute h-36 w-36 rounded-full bg-emerald-100/70" />

            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-emerald-100 shadow-inner">
              <CheckCircle2
                size={65}
                strokeWidth={1.8}
                className="text-emerald-600"
              />
            </div>

            <div className="absolute -right-3 bottom-1 rounded-full bg-white p-3 shadow-md">
              <PackageCheck
                size={25}
                className="text-emerald-600"
              />
            </div>

          </div>
        </div>

        {/* Main Confirmation Card */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50">

          <div className="px-6 pt-9 pb-7 text-center sm:px-10">

            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <CheckCircle2 size={15} />
              Payment Successful
            </span>

            <h1 className="mb-3 text-3xl font-bold tracking-tight text-[#183d3d] sm:text-4xl">
              Order Confirmed!
            </h1>

            {order ? (
              <p className="mx-auto max-w-md text-base leading-relaxed text-gray-500">
                Thank you,{" "}
                <span className="font-semibold text-gray-800">
                  {order.customer.firstName}
                </span>
                ! Your order has been successfully placed. We're getting
                everything ready for you.
              </p>
            ) : (
              <p className="text-gray-500">
                Loading your order details...
              </p>
            )}

          </div>

          {/* Order Information */}
          {order && (
            <div className="mx-6 mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 sm:mx-10">

              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Order Number
                </span>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Confirmed
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold tracking-wide text-[#183d3d] sm:text-2xl">
                  #{order.orderNumber}
                </h2>

                <ShoppingBag
                  size={26}
                  className="shrink-0 text-emerald-600"
                />
              </div>

            </div>
          )}

          {/* Delivery Information */}
          <div className="mx-6 mb-8 space-y-4 sm:mx-10">

            <div className="flex items-start gap-4 rounded-xl border border-gray-100 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <Mail size={21} className="text-emerald-700" />
              </div>

              <div>
                <h3 className="mb-1 text-sm font-semibold text-gray-800">
                  Stay Updated
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  We'll send your order confirmation and delivery updates
                  to your registered email address.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-gray-100 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <ShieldCheck size={21} className="text-emerald-700" />
              </div>

              <div>
                <h3 className="mb-1 text-sm font-semibold text-gray-800">
                  Thank You for Shopping!
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  Your order is confirmed. Thank you for choosing us!
                </p>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-100 bg-gray-50/70 px-6 py-7 sm:px-10">

            <Link
              to="/shop"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#183d3d] px-6 py-4 font-semibold text-white shadow-lg shadow-[#183d3d]/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#245454] hover:shadow-xl"
            >
              <ShoppingBag size={19} />
              Continue Shopping
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <p className="mt-4 text-center text-xs text-gray-400">
              We appreciate your business. Have a wonderful day!
            </p>

          </div>

        </div>

      </div>
    </main>
  );
}
