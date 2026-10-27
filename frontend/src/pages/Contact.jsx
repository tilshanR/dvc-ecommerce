
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";

// --------------------------------------------------
// DVC CONTACT PAGE
// DVC STORE
// --------------------------------------------------

const STORE = {
  name: "Dhanuka Video & Communication",
  phone: "+94 66 228 4xxx",
  phoneSecondary: "+94 77 xxx xxxx",
  email: "info@dvcecommerce.lk",
  address: "No. 8 Dambulla Road, Palapathwela, Matale 21070, Sri Lanka",
  mapQuery: "No. 8 Dambulla Road, Palapathwela, Matale, Sri Lanka",
};

// Replace these placeholders with the real WhatsApp number.
// Use international format without +, spaces, or dashes.
const WHATSAPP_NUMBER = "";
const WHATSAPP_URL = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}`
  : null;

const MAPS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  STORE.mapQuery
)}`;

const subjects = [
  "General Inquiry",
  "Hardware Availability Check",
  "Pickup Order Question",
  "Other",
];

const faqs = [
  {
    question: "How do I collect my 'Reserve & Pay In-Store' order?",
    answer:
      "Bring your Order ID and registered phone number to our shop at No. 8 Dambulla Road, Palapathwela. Please collect your reservation within 2 business days of confirmation. Sundays are excluded from the pickup expiration timer.",
  },
  {
    question: "Can I verify used computer components in person before buying?",
    answer:
      "Yes! You can ask our team to inspect available used RAM, graphics cards (GPUs), SSDs, and other listed components at the shop counter. Testing and inspection depend on the component, so contact us beforehand if you want to check a particular item.",
  },
  {
    question: "What happens if I cannot pick up my order within 2 business days?",
    answer:
      "Reservations expire after 2 working days, excluding Sundays, according to the store's reservation policy. Once a reservation expires, the reserved stock may be released back into the online catalog. Please contact our team as soon as possible if you anticipate a delay.",
  },
];

// --------------------------------------------------
// REUSABLE ANIMATED FLIP WORDS
// --------------------------------------------------

function FlipWords({ words }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, 2400);

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <span
      className="relative inline-grid min-w-[9ch] align-bottom text-left text-emerald-300"
      aria-label={words.join(", ")}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 18, filter: "blur(5px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -18, filter: "blur(5px)" }}
          transition={{ duration: 0.35 }}
          className="col-start-1 row-start-1 whitespace-nowrap"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// --------------------------------------------------
// REUSABLE 3D CONTACT CARD
// --------------------------------------------------

function ContactCard({
  icon: Icon,
  title,
  description,
  children,
  accent = "emerald",
  delay = 0,
}) {
  const accents = {
    emerald: {
      icon: "bg-emerald-50 text-emerald-700",
      border: "hover:border-emerald-300",
      glow: "group-hover:shadow-emerald-900/10",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700",
      border: "hover:border-amber-300",
      glow: "group-hover:shadow-amber-900/10",
    },
    slate: {
      icon: "bg-slate-100 text-slate-700",
      border: "hover:border-slate-300",
      glow: "group-hover:shadow-slate-900/10",
    },
  };

  const style = accents[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -5 }}
      className={`group min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 sm:p-6 ${style.border} ${style.glow} hover:shadow-xl`}
    >
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${style.icon}`}
      >
        <Icon size={23} strokeWidth={1.8} />
      </div>

      <h3 className="text-lg font-bold text-slate-900">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>

      <div className="mt-4 min-w-0">{children}</div>
    </motion.div>
  );
}

// --------------------------------------------------
// FAQ ACCORDION
// Inspired by the About page accordion
// --------------------------------------------------

function ContactFAQ() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="bg-[#f8fafc] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-800">
            <MessageCircle size={15} />
            Quick customer help
          </span>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Questions? Let's make things clear.
          </h2>

          <p className="mt-4 max-w-md text-sm leading-7 text-slate-600 sm:text-base">
            Need help with a reservation or want to inspect a computer
            component? Here are a few answers to help you shop with
            confidence.
          </p>

          <a
            href="#contact-form"
            className="mt-7 inline-flex items-center gap-2 font-bold text-emerald-800 transition-all hover:gap-3"
          >
            Ask us a question
            <ArrowRight size={18} />
          </a>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;

            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                className={`overflow-hidden rounded-2xl border bg-white transition-colors ${
                  isOpen
                    ? "border-emerald-200 shadow-sm"
                    : "border-slate-200"
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setActiveIndex(isOpen ? -1 : index)}
                  className="flex min-h-16 w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
                >
                  <span className="text-sm font-bold leading-6 text-slate-900 sm:text-base">
                    {faq.question}
                  </span>

                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-emerald-800 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-5 text-sm leading-7 text-slate-600 sm:px-5">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------
// MAIN CONTACT PAGE
// --------------------------------------------------

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;

    const timeout = setTimeout(() => setToast(null), 4500);

    return () => clearTimeout(timeout);
  }, [toast]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = "Please enter your full name.";
    }

    // Accept Sri Lankan numbers such as:
    // +94771234567, 0771234567, or 94771234567.
    const normalizedPhone = formData.phone.replace(/[\s()-]/g, "");
    const validSriLankanPhone =
      /^(?:\+94|94|0)(?:7\d{8}|[1-9]\d{8})$/.test(
        normalizedPhone
      );

    if (!normalizedPhone) {
      nextErrors.phone = "Please enter your phone number.";
    } else if (!validSriLankanPhone) {
      nextErrors.phone =
        "Enter a valid Sri Lankan number, e.g. +94771234567.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Please enter your email address.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.subject) {
      nextErrors.subject = "Please select a subject.";
    }

    if (formData.message.trim().length < 10) {
      nextErrors.message =
        "Please enter at least 10 characters.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  
const handleSubmit = async (event) => {
  // Prevent the browser from refreshing the page.
  event.preventDefault();

  // Keep your existing form validation here, if you have it.
  // For example, return early if your validation fails.

  setIsSubmitting(true);

  try {
    // Send the form data to the Express backend.
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/contact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    // Convert the backend's JSON response into a JavaScript object.
    const result = await response.json();

    // Handle validation errors and other unsuccessful responses.
    if (!response.ok) {
      const errorMessage = result.errors
        ?.map((error) => error.message)
        .join(", ");

      throw new Error(
        errorMessage || result.message || "Message submission failed."
      );
    }

    // Clear the form only after the backend confirms success.
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      subject: "General Inquiry",
      message: "",
    });

    // Display a real success message.
    setToast({
      type: "success",
      message: result.message || "Your message was submitted successfully.",
    });
  } catch (error) {
    // Handle network errors and backend errors.
    setToast({
      type: "error",
      message:
        error.message || "We couldn't send your message. Please try again.",
    });
  } finally {
    // Re-enable the submit button.
    setIsSubmitting(false);
  }
};

  const inputClasses =
    "mt-2 block min-h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20";

  const labelClasses =
    "block text-sm font-semibold text-slate-700";

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fafc] text-slate-800">
      {/* SUCCESS / ERROR TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            role={toast.type === "error" ? "alert" : "status"}
            aria-live="polite"
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            className={`fixed right-3 top-4 z-50 flex w-[calc(100%-1.5rem)] max-w-md items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl sm:right-6 sm:top-6 ${
              toast.type === "success"
                ? "border-emerald-200"
                : "border-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle
                className="shrink-0 text-emerald-700"
                size={22}
              />
            ) : (
              <X className="shrink-0 text-red-600" size={22} />
            )}

            <p className="flex-1 text-sm leading-6 text-slate-700">
              {toast.message}
            </p>

            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
            >
              <X size={17} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO */}
      <section className="relative isolate overflow-hidden bg-slate-900">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(46,125,50,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(239,108,0,0.15),transparent_45%)]" />

        <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full border border-white/10 sm:h-96 sm:w-96" />

        <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8 lg:pb-28 lg:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-4xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-200 sm:text-sm">
              <MessageSquare size={15} />
              Let's talk
            </span>

            <h1 className="mt-7 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-7xl">
              We're Here for You
              <span className="mt-2 block text-2xl font-semibold sm:text-3xl lg:text-4xl">
                Connect with Us{" "}
                <FlipWords
                  words={["In Person", "On WhatsApp", "Via Email"]}
                />
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8 lg:text-lg">
              Have a question about a product, need to verify a used
              PC hardware part, or picking up a store reservation?
              Visit us at No. 8 Dambulla Road or drop us a message
              below.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#contact-form"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-600 sm:w-auto"
              >
                Send an Inquiry
                <ArrowRight size={18} />
              </a>

              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-bold text-white transition hover:bg-white/10 sm:w-auto"
              >
                Visit Our Store
                <MapPin size={18} />
              </a>
            </div>

            <div className="mt-10 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-center text-xs font-medium leading-5 text-amber-200 sm:text-sm">
              <ShieldCheck size={17} className="shrink-0" />
              Moving forward with Trust
            </div>
          </motion.div>
        </div>

        <div className="h-1 bg-linear-to-r from-emerald-700 via-emerald-500 to-amber-500" />
      </section>

      {/* 2. CONTACT INFORMATION CARDS */}
      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
              Contact information
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Choose how to reach us.
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Whether it is a quick question or a visit to our shop,
              we're happy to help you find the right solution.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ContactCard
              icon={Phone}
              title="Phone & WhatsApp"
              description="Talk to our team about products, orders, and availability."
              accent="emerald"
              delay={0}
            >
              <p className="wrap-break-words text-sm font-bold text-slate-800">
                {STORE.phone}
              </p>
              <p className="mt-1 wrap-break-words text-sm text-slate-600">
                {STORE.phoneSecondary}
              </p>

              {WHATSAPP_URL ? (
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  <MessageCircle size={17} />
                  Chat on WhatsApp
                  <ExternalLink size={14} />
                </a>
              ) : (
                <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                  WhatsApp contact will be available once the store
                  number is configured.
                </p>
              )}
            </ContactCard>

            <ContactCard
              icon={Mail}
              title="Email Support"
              description="Send your questions about products, reservations, or orders."
              accent="amber"
              delay={0.08}
            >
              <a
                href={`mailto:${STORE.email}`}
                className="break-all text-sm font-bold text-emerald-800 underline-offset-4 hover:underline"
              >
                {STORE.email}
              </a>

              <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-500">
                <Clock size={15} className="mt-0.5 shrink-0" />
                Target response: within 24 hours. Actual response times
                may vary.
              </p>
            </ContactCard>

            <ContactCard
              icon={MapPin}
              title="Visit Our Shop"
              description="Come by to ask questions and explore available products."
              accent="slate"
              delay={0.16}
            >
              <p className="text-sm leading-6 text-slate-700">
                No. 8 Dambulla Road,
                <br />
                Palapathwela, Matale 21070,
                <br />
                Sri Lanka
              </p>

              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:underline"
              >
                Get directions
                <ExternalLink size={15} />
              </a>
            </ContactCard>

            <ContactCard
              icon={Clock}
              title="Store Hours"
              description="Plan your visit during our regular opening hours."
              accent="emerald"
              delay={0.24}
            >
              <div className="space-y-2 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-600">Mon – Sat</span>
                  <span className="text-right font-bold text-slate-800">
                    8 AM – 8 PM
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-600">Sundays</span>
                  <span className="font-bold text-red-600">Closed</span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-600">Public holidays</span>
                  <span className="font-bold text-red-600">Closed</span>
                </div>
              </div>

              <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                <strong>Pickup reminder:</strong> Sundays are excluded
                from the 2-business-day pickup reservation expiration
                timer (BR-006).
              </p>
            </ContactCard>
          </div>
        </div>
      </section>

      {/* 3. CONTACT FORM + LOCATION */}
      <section className="border-y border-slate-200 bg-white px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-800">
              <MessageSquare size={15} />
              We'd love to hear from you
            </span>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              How can we help?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Tell us what you need. Provide a few details and our team
              can help you with your inquiry.
            </p>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
            {/* LEFT: INQUIRY FORM */}
            <motion.div
              id="contact-form"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5 }}
              className="min-w-0 rounded-3xl border border-slate-200 bg-[#f8fafc] p-5 shadow-sm sm:p-8"
            >
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <Send size={22} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xl font-black text-slate-900">
                    Send us a message
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Fields marked with * are required.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="fullName" className={labelClasses}>
                      Full Name *
                    </label>

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      value={formData.fullName}
                      onChange={updateField}
                      placeholder="Enter your full name"
                      aria-invalid={Boolean(errors.fullName)}
                      aria-describedby={
                        errors.fullName ? "fullName-error" : undefined
                      }
                      className={`${inputClasses} ${
                        errors.fullName
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                          : ""
                      }`}
                      required
                    />

                    {errors.fullName && (
                      <p
                        id="fullName-error"
                        className="mt-1.5 text-xs text-red-600"
                      >
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="min-w-0">
                      <label htmlFor="phone" className={labelClasses}>
                        Phone Number *
                      </label>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        value={formData.phone}
                        onChange={updateField}
                        placeholder="+94771234567"
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={
                          errors.phone ? "phone-error" : undefined
                        }
                        className={`${inputClasses} ${
                          errors.phone
                            ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                            : ""
                        }`}
                        required
                      />

                      {errors.phone && (
                        <p
                          id="phone-error"
                          className="mt-1.5 text-xs leading-5 text-red-600"
                        >
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className="min-w-0">
                      <label htmlFor="email" className={labelClasses}>
                        Email Address *
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={updateField}
                        placeholder="you@example.com"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={
                          errors.email ? "email-error" : undefined
                        }
                        className={`${inputClasses} ${
                          errors.email
                            ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                            : ""
                        }`}
                        required
                      />

                      {errors.email && (
                        <p
                          id="email-error"
                          className="mt-1.5 text-xs leading-5 text-red-600"
                        >
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className={labelClasses}>
                      Subject *
                    </label>

                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={updateField}
                      aria-invalid={Boolean(errors.subject)}
                      className={`${inputClasses} cursor-pointer`}
                      required
                    >
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>

                    {errors.subject && (
                      <p className="mt-1.5 text-xs text-red-600">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className={labelClasses}>
                      Your Message *
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      maxLength={2000}
                      value={formData.message}
                      onChange={updateField}
                      placeholder="Tell us how we can help..."
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={
                        errors.message ? "message-error" : undefined
                      }
                      className={`${inputClasses} min-h-36 resize-y`}
                      required
                    />

                    <div className="mt-1.5 flex items-start justify-between gap-3">
                      {errors.message ? (
                        <p
                          id="message-error"
                          className="text-xs leading-5 text-red-600"
                        >
                          {errors.message}
                        </p>
                      ) : (
                        <p className="text-xs leading-5 text-slate-500">
                          Minimum 10 characters.
                        </p>
                      )}

                      <span className="shrink-0 text-xs tabular-nums text-slate-400">
                        {formData.message.length}/2000
                      </span>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={isSubmitting ? {} : { scale: 1.01 }}
                    whileTap={isSubmitting ? {} : { scale: 0.98 }}
                    className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white shadow-lg shadow-emerald-900/10 transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        Send Message to DVC
                        <ArrowRight size={18} />
                      </>
                    )}
                  </motion.button>

                  <p className="flex items-start justify-center gap-2 text-center text-xs leading-5 text-slate-500">
                    <ShieldCheck
                      size={15}
                      className="mt-0.5 shrink-0 text-emerald-700"
                    />
                    Your details are strictly used for responding to
                    your inquiry. Please avoid sharing payment details
                    or passwords.
                  </p>
                </div>
              </form>
            </motion.div>

            {/* RIGHT: LOCATION AND PICKUP */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5 }}
              className="min-w-0 space-y-5"
            >
              <div className="relative isolate flex min-h-75 items-center justify-center overflow-hidden rounded-3xl bg-slate-900 p-6 sm:min-h-90 sm:p-10">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(46,125,50,0.35),transparent_65%)]" />

                <div className="pointer-events-none absolute inset-0 -z-10 opacity-20 [bg-[linear-gradient(rgba(255,255,255,0.15)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.15)_1px,_transparent_1px)]] [bg-size:32px_32px]" />

                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Find us in Palapathwela
                </div>

                <motion.div
                  animate={{ y: [0, -9, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative flex flex-col items-center"
                >
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-500/10 shadow-[0_0_60px_rgba(16,185,129,0.18)]">
                    <div className="absolute inset-3 rounded-full border border-emerald-300/30" />

                    <MapPin
                      size={55}
                      strokeWidth={1.5}
                      className="text-emerald-300"
                    />
                  </div>

                  <div className="h-5 w-10 rounded-full bg-black/40 blur-md" />

                  <div className="mt-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-center shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center justify-center gap-2 text-amber-300">
                      <Store size={18} />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        DVC Store
                      </span>
                    </div>

                    <p className="mt-2 max-w-xs text-lg font-black text-white">
                      Palapathwela
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-300">
                      No. 8 Dambulla Road
                    </p>
                  </div>
                </motion.div>

                <div className="absolute bottom-5 right-5 rounded-xl border border-white/10 bg-white/10 p-3 text-white/80 backdrop-blur-md">
                  <MapPin size={20} />
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                    <Store size={23} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-black leading-6 text-slate-900">
                      Dhanuka Video & Communication
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      No. 8 Dambulla Road, Palapathwela, Matale 21070,
                      Sri Lanka
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle
                      size={21}
                      className="mt-0.5 shrink-0 text-emerald-700"
                    />

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        In-Store Pickup Counter
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Our pickup counter is inside the shop. Present
                        your Order ID upon arrival and have your
                        registered phone number ready.
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  Get Google Maps Directions
                  <ExternalLink size={17} />
                </a>

                <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                  Please check the opening hours before visiting.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. QUICK CUSTOMER HELP / FAQ */}
      <ContactFAQ />

      {/* 5. CLOSING CTA */}
      <section className="bg-slate-900 px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
              Moving forward with Trust
            </span>

            <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
              We're just a message away.
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Your next great find starts with a conversation.
            </p>
          </div>

          <a
            href="#contact-form"
            className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white transition hover:bg-emerald-600 sm:w-auto"
          >
            Contact DVC
            <ArrowRight size={18} />
          </a>
        </motion.div>
      </section>
    </main>
  );
}
