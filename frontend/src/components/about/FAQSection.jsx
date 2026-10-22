import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, MessageCircle } from "lucide-react";

// FAQ ACCORDION
// --------------------------------------------------

const faqs = [
  {
    question: "How does Reserve & Pay In-Store work?",
    answer:
      "If the reservation feature is enabled for an item, follow the instructions on its product page or checkout. The shop should confirm availability, the hold deadline, and the accepted in-store payment methods before your reservation is considered confirmed.",
  },
  {
    question: "How are used computer parts tested?",
    answer:
      "Testing depends on the component. It can include visual inspection, compatibility checks, diagnostic tools, and functional tests under appropriate conditions. The actual checks and any known limitations should be stated in each product listing.",
  },
  {
    question: "Which payment methods can I use?",
    answer:
      "Available payment methods depend on the checkout options enabled by DVC. PayHere and eligible cash-on-pickup or cash-on-delivery options can be displayed here once the store's payment policies are confirmed.",
  },
  {
    question: "How much does delivery cost?",
    answer:
      "Applicable delivery charges and delivery conditions should be shown before you confirm your order. Check the checkout page for the rate that applies to your destination and order.",
  },
  {
    question: "Can I visit the physical store?",
    answer:
      "Yes. DVC is located at No. 8 Dambulla Road, Palapathwela, Matale 21070, Sri Lanka. Please check the store's current opening hours before visiting.",
  },
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="bg-[#f8fafc] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-green-800">
            <MessageCircle size={15} />
            Good to know
          </span>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Questions? Let's make things clear.
          </h2>

          <p className="mt-4 max-w-md leading-7 text-slate-600">
            Shopping should feel straightforward. Here are answers to
            common questions about reservations, product condition, and
            ordering from DVC.
          </p>

          <Link
            to="/contact-us"
            className="mt-7 inline-flex items-center gap-2 font-bold text-dvcGreen hover:gap-3"
          >
            Contact our team
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;

            return (
              <div
                key={faq.question}
                className={`overflow-hidden rounded-2xl border bg-white transition-colors ${
                  isOpen ? "border-green-200" : "border-slate-200"
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setActiveIndex(isOpen ? -1 : index)
                  }
                  className="flex min-h-16 w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-bold leading-6 text-slate-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-green-800 transition-transform ${
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
                      <p className="px-5 pb-5 text-sm leading-7 text-slate-600">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------
