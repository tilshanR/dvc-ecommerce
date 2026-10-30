
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Package,
  ShieldCheck,
} from "lucide-react";

const checkoutSchema = z.object({
  firstName: z.string().trim().min(2, "Enter your first name."),
  lastName: z.string().trim().min(2, "Enter your last name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s()-]{9,15}$/, "Enter a valid phone number."),
  streetAddress: z.string().trim().optional(),
  city: z.string().trim().optional(),
  postcode: z.string().trim().optional(),
});

const formatLKR = (amount) =>
  `LKR ${Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const checkoutOptions = {
  "delivery-online": {
    title: "Home Delivery",
    payment: "Online Payment",
    description: "Your order will be delivered to your address.",
  },
  "pickup-online": {
    title: "Store Pickup",
    payment: "Online Payment",
    description: "Collect your order from our store.",
  },
  "pickup-store": {
    title: "Store Pickup",
    payment: "Pay at Store",
    description: "Reserve your order and pay when collecting it.",
  },
};

const inputClass =
  "mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#183D3D] focus:ring-2 focus:ring-[#183D3D]/10";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

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

  // Checkout requires a cart and a valid option selected on the cart page.
  if (!cartItems.length || !selectedOption) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h1 className="text-2xl font-bold text-[#183D3D]">
          No checkout details found
        </h1>
        <p className="mt-3 text-gray-600">
          Please return to your cart and select a checkout option.
        </p>
        <button
          onClick={() => navigate("/cart")}
          className="mt-6 rounded-lg bg-[#183D3D] px-6 py-3 font-semibold text-white hover:bg-[#245454]"
        >
          Return to Cart
        </button>
      </main>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSubmitMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitMessage("");

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
      return;
    }

    // Frontend validation only: connect order creation and payment
    // after the backend is implemented.
    console.log("Validated checkout details:", {
      customer: result.data,
      cartItems,
      subtotal,
      shippingCost,
      total,
      checkoutMethod,
      paymentMethod: selectedOption.payment,
    });

    setSubmitMessage(
      "Your details are valid. Order placement and payment will be enabled when the backend is connected."
    );
  };

  const renderField = (name, label, type = "text", required = true) => (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={formData[name]}
        onChange={handleChange}
        autoComplete={
          {
            firstName: "given-name",
            lastName: "family-name",
            email: "email",
            phone: "tel",
            streetAddress: "street-address",
            city: "address-level2",
            postcode: "postal-code",
          }[name]
        }
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        className={`${inputClass} ${
          errors[name] ? "border-red-500 focus:border-red-500" : ""
        }`}
      />

      {errors[name] && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#183D3D] hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Cart
        </button>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#477373]">
            DVC ECOM
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#183D3D] sm:text-4xl">
            Checkout
          </h1>
          <p className="mt-2 text-gray-600">
            Enter your details to continue with your order.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* Guest information form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
          >
            <section>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-[#183D3D]/10 p-2.5 text-[#183D3D]">
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
                {renderField("firstName", "First Name")}
                {renderField("lastName", "Last Name")}
                <div className="sm:col-span-2">
                  {renderField("email", "Email Address", "email")}
                </div>
                <div className="sm:col-span-2">
                  {renderField("phone", "Phone Number", "tel")}
                </div>
              </div>
            </section>

            {isDelivery && (
              <section className="border-t border-gray-100 pt-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-lg bg-[#183D3D]/10 p-2.5 text-[#183D3D]">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Delivery Address
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {renderField("streetAddress", "Street Address")}
                  {renderField("city", "Town / City")}
                  {renderField("postcode", "Postcode / ZIP")}
                </div>
              </section>
            )}

            <section className="border-t border-gray-100 pt-7">
              <h2 className="text-xl font-bold text-gray-900">
                Delivery & Payment
              </h2>

              <div className="mt-4 rounded-xl border border-[#183D3D]/20 bg-[#183D3D]/5 p-4">
                <p className="font-semibold text-[#183D3D]">
                  {selectedOption.title}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedOption.description}
                </p>
                <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                  <span className="text-gray-600">Payment method</span>
                  <span className="font-semibold text-gray-900">
                    {selectedOption.payment}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-500">
                Your selected option comes from the cart. To change it, return
                to your cart before continuing.
              </p>
            </section>

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
              className="w-full rounded-xl bg-[#183D3D] px-6 py-4 font-semibold text-white transition hover:bg-[#245454] focus:outline-none focus:ring-2 focus:ring-[#183D3D] focus:ring-offset-2"
            >
              {checkoutMethod === "pickup-store"
                ? "Reserve Order"
                : "Continue to Payment"}
            </button>

          
          </form>

          {/* Order summary */}
          <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7 lg:sticky lg:top-6">
            <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
            <p className="mt-1 text-sm text-gray-500">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
              your order
            </p>

            <div className="mt-6 space-y-5">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 rounded-lg border border-gray-100 object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                      <Package size={28} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                    <p className="mt-2 font-semibold text-[#183D3D]">
                      {formatLKR(Number(item.price) * Number(item.quantity))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-gray-100 pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  {formatLKR(subtotal)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-600">
                  {isDelivery ? "Home Delivery" : "Store Pickup"}
                </span>
                <span className="font-medium text-gray-900">
                  {Number(shippingCost) === 0
                    ? "Free"
                    : formatLKR(shippingCost)}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-t border-gray-100 pt-4 text-base">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-[#183D3D]">
                  {formatLKR(total)}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-gray-50 p-4 text-sm">
              <p className="font-semibold text-gray-800">Selected option</p>
              <p className="mt-1 text-gray-600">
                {selectedOption.title} · {selectedOption.payment}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
