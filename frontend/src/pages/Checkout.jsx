import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Package, MapPin } from "lucide-react";
import { createOrder } from "../services/orderApi";
// Utilities & Context
import { checkoutSchema, checkoutOptions } from "../utils/checkoutUtils";
import { useCart } from "../context/CartContext";
import { getPaymentHash } from "../services/paymentApi";

// UI Components
import CheckoutInput from "../components/checkout/CheckoutInput";
import OrderSummary from "../components/checkout/OrderSummary";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract clearCart to empty the basket after a successful order
  const { clearCart } = useCart();

  const {
    cartItems = [],
    subtotal = 0,
    shippingCost = 0,
    total = 0,
    checkoutMethod = "",
  } = location.state || {};

  const isDelivery = checkoutMethod === "delivery-online";
  const selectedOption = checkoutOptions[checkoutMethod];

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    postcode: "",
  });

  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security check: bounce users back if they bypass the cart
  if (!cartItems.length || !selectedOption) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h1 className="text-2xl font-bold text-[#183d3d]">
          No checkout details found
        </h1>
        <p className="mt-3 text-gray-600">
          Please return to your cart and select a checkout option.
        </p>
        <button
          onClick={() => navigate("/cart")}
          className="mt-6 rounded-lg bg-[#183d3d] px-6 py-3 font-semibold text-white hover:bg-[#245454]"
        >
          Return to Cart
        </button>
      </main>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", submit: "" }));
    setSubmitMessage("");
  };

  // --- NEW: PayHere Integration Function ---
  //   const initiatePayHerePayment = async (order) => {
  //     try {
  //       const orderIdString = order._id || order.id;
  //       console.log("1. Fetching hash for order ID:", order._id);
  //       // 1. Fetch the secure hash from your backend
  //       const { merchantId, hash, amount, currency } = await getPaymentHash(order._id);
  // console.log("2. Hash received successfully:", { merchantId, hash, amount, currency });
  //       // 2. Define PayHere SDK event callbacks
  //       window.payhere.onCompleted = function onCompleted(orderId) {
  //         console.log("Payment completed. OrderID:" + orderId);
  //         // Backend handles the DB update via webhook. Redirect user to success.
  //         navigate(`/order-success/${order._id}`);
  //       };

  //       window.payhere.onDismissed = function onDismissed() {
  //         console.log("Payment dismissed by user");
  //         setErrors((prev) => ({
  //           ...prev,
  //           submit: "Payment was cancelled. You can complete it later from your orders.",
  //         }));
  //         setIsSubmitting(false);
  //       };

  //       window.payhere.onError = function onError(error) {
  //         console.error("PayHere Error:", error);
  //         setErrors((prev) => ({
  //           ...prev,
  //           submit: "Payment gateway error. Please try again or contact support.",
  //         }));
  //         setIsSubmitting(false);
  //       };

  //       // 3. Construct the payment variables object
  //       const payment = {
  //         sandbox: true, // IMPORTANT: Set to false in production
  //         merchant_id: merchantId,
  //         return_url: `${window.location.origin}/order-success/${order._id}`,
  //         cancel_url: `${window.location.origin}/checkout`,
  //         notify_url: import.meta.env.VITE_PAYHERE_NOTIFY_URL,// REPLACE THIS for local webhook testing
  //         order_id: order._id,
  //         items: "Order #" + order.orderNumber,
  //         amount: amount,
  //         currency: currency,
  //         hash: hash,

  //         // Customer Details
  //         first_name: order.customer.firstName,
  //         last_name: order.customer.lastName,
  //         email: order.customer.email,
  //         phone: order.customer.phone,
  //         address: order.shippingAddress?.streetAddress || "N/A",
  //         city: order.shippingAddress?.city || "N/A",
  //         country: "Sri Lanka",
  //       };

  //       // 4. Trigger the popup
  //       window.payhere.startPayment(payment);

  //     } catch (error) {
  //       console.error("Failed to initiate PayHere:", error);
  //       setErrors((prev) => ({
  //         ...prev,
  //         submit: "Could not connect to the payment gateway.",
  //       }));
  //       setIsSubmitting(false);
  //     }
  //   };
  const initiatePayHerePayment = async (order) => {
    try {
      // Safely grab the ID whether it was serialized as _id or id
      const orderIdString = order._id || order.id;

      console.log("1. Fetching hash for order ID:", orderIdString);

      // 1. Fetch the secure hash from your backend
      const { merchantId, hash, amount, currency } =
        await getPaymentHash(orderIdString);

      console.log("2. Hash received successfully:", {
        merchantId,
        hash,
        amount,
        currency,
      });

      // 2. Define PayHere SDK event callbacks
      window.payhere.onCompleted = function onCompleted(orderId) {
        console.log("Payment completed. OrderID:" + orderId);
        // Backend handles the DB update via webhook. Redirect user to success.
        navigate(`/order-success/${orderIdString}`);
      };

      window.payhere.onDismissed = function onDismissed() {
        console.log("Payment dismissed by user");
        setErrors((prev) => ({
          ...prev,
          submit:
            "Payment was cancelled. You can complete it later from your orders.",
        }));
        setIsSubmitting(false);
      };

      window.payhere.onError = function onError(error) {
        console.error("PayHere Error:", error);
        setErrors((prev) => ({
          ...prev,
          submit: "Payment gateway error. Please try again or contact support.",
        }));
        setIsSubmitting(false);
      };

      // 3. Construct the payment variables object
      const payment = {
        sandbox: true, // IMPORTANT: Set to false in production
        merchant_id: merchantId,
        return_url: `${window.location.origin}/order-success/${orderIdString}`,
        cancel_url: `${window.location.origin}/checkout`,
        notify_url: import.meta.env.VITE_PAYHERE_NOTIFY_URL,
        order_id: orderIdString,
        items: "Order #" + order.orderNumber,
        amount: amount,
        currency: currency,
        hash: hash,

        // Customer Details
        first_name: order.customer.firstName,
        last_name: order.customer.lastName,
        email: order.customer.email,
        phone: order.customer.phone,
        address: order.shippingAddress?.streetAddress || "N/A",
        city: order.shippingAddress?.city || "N/A",
        country: "Sri Lanka",
      };

      // 4. Trigger the popup
      window.payhere.startPayment(payment);
    } catch (error) {
      console.error("Failed to initiate PayHere:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Could not connect to the payment gateway.",
      }));
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    // Zod Validation (conditionally checking address)
    const schema = checkoutSchema.superRefine((data, context) => {
      if (isDelivery) {
        if (!data.streetAddress?.trim()) {
          context.addIssue({
            code: "custom",
            path: ["streetAddress"],
            message: "Enter your street address.",
          });
        }
        if (!data.city?.trim()) {
          context.addIssue({
            code: "custom",
            path: ["city"],
            message: "Enter your town or city.",
          });
        }
        if (!data.postcode?.trim()) {
          context.addIssue({
            code: "custom",
            path: ["postcode"],
            message: "Enter your postcode.",
          });
        }
      }
    });

    const result = schema.safeParse(formData);

    if (!result.success) {
      const nextErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      });
      setErrors(nextErrors);
      setIsSubmitting(false);
      return;
    }

    // Prepare Payload
    const orderPayload = {
      customer: {
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        email: result.data.email,
        phone: result.data.phone,
      },
      shippingAddress: isDelivery
        ? {
            streetAddress: result.data.streetAddress,
            city: result.data.city,
            postcode: result.data.postcode,
          }
        : undefined,
      items: cartItems.map((item) => ({
        productId: item.id, // Maps to the MongoDB ObjectId
        quantity: item.quantity,
      })),
      checkoutMethod,
    };

    try {
      // Use the new centralized API service instead of direct axios
      const response = await createOrder(orderPayload);
      const newOrder = response.data;
      console.log("Order saved to DB:", newOrder); // Let's log it just to be sure!
      setSubmitMessage(`Order ${newOrder.orderNumber} placed successfully!`);

      // Clear the global cart context so the user doesn't double-order
      if (clearCart) clearCart();

      if (checkoutMethod === "delivery-online" || checkoutMethod === "pickup-online") {
        console.log("Triggering Online Payment Flow...");
        await initiatePayHerePayment(newOrder);
      } else {
        console.log("Store Pickup selected. Redirecting to success...");
        navigate(`/order-success/${newOrder._id || newOrder.id}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setErrors((prev) => ({
        ...prev,
        submit: error.message || "Failed to place order. Please try again.",
      }));
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#183d3d] hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Cart
        </button>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#477373]">
            DVC ECOM
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#183d3d] sm:text-4xl">
            Checkout
          </h1>
          <p className="mt-2 text-gray-600">
            Enter your details to continue with your order.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
          >
            <section>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-[#183d3d]/10 p-2.5 text-[#183d3d]">
                  <Package size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Contact Information
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Your order updates will use these details.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <CheckoutInput
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  autoComplete="given-name"
                />
                <CheckoutInput
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  autoComplete="family-name"
                />
                <div className="sm:col-span-2">
                  <CheckoutInput
                    name="email"
                    type="email"
                    label="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    autoComplete="email"
                  />
                </div>
                <div className="sm:col-span-2">
                  <CheckoutInput
                    name="phone"
                    type="tel"
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    autoComplete="tel"
                  />
                </div>
              </div>
            </section>

            {isDelivery && (
              <section className="border-t border-gray-100 pt-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-lg bg-[#183d3d]/10 p-2.5 text-[#183d3d]">
                    <MapPin size={22} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Delivery Address
                  </h2>
                </div>
                <div className="space-y-5">
                  <CheckoutInput
                    name="streetAddress"
                    label="Street Address"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    error={errors.streetAddress}
                    autoComplete="street-address"
                  />
                  <CheckoutInput
                    name="city"
                    label="Town / City"
                    value={formData.city}
                    onChange={handleChange}
                    error={errors.city}
                    autoComplete="address-level2"
                  />
                  <CheckoutInput
                    name="postcode"
                    label="Postcode / ZIP"
                    value={formData.postcode}
                    onChange={handleChange}
                    error={errors.postcode}
                    autoComplete="postal-code"
                  />
                </div>
              </section>
            )}

            {errors.submit && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {errors.submit}
              </div>
            )}

            {submitMessage && (
              <div
                role="status"
                className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <p>{submitMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-xl px-6 py-4 font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-[#183d3d] focus:ring-offset-2 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#183d3d] hover:bg-[#245454]"
              }`}
            >
              {isSubmitting
                ? "Processing..."
                : checkoutMethod === "pickup-store"
                  ? "Reserve Order"
                  : "Continue to Payment"}
            </button>
          </form>

          <OrderSummary
            cartItems={cartItems}
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
            isDelivery={isDelivery}
            selectedOption={selectedOption}
          />
        </div>
      </div>
    </main>
  );
}
