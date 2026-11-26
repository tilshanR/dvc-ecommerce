import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Truck,
  Clock,
  Store,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { getPublicStoreSettings } from "../services/storeSettingsApi";
import {
  DEFAULT_PUBLIC_SETTINGS,
  formatLKR,
  formatWeightGrams,
  formatHoldHours,
} from "../utils/checkoutUtils";

const formatUpdatedDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

/**
 * Safely splits plain-text terms into structured blocks without HTML parsing
 * or dangerouslySetInnerHTML. Supports "## Heading" lines and blank-line paragraphs.
 */
const parsePlainTextTerms = (rawText) => {
  if (!rawText || typeof rawText !== "string") return [];

  return rawText
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim());
      if (lines[0]?.startsWith("## ")) {
        return {
          heading: lines[0].slice(3).trim(),
          paragraphs: lines.slice(1).filter(Boolean),
        };
      }
      return {
        heading: null,
        paragraphs: lines.filter(Boolean),
      };
    });
};

export default function TermsAndConditions() {
  const [settings, setSettings] = useState(DEFAULT_PUBLIC_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [loadWarning, setLoadWarning] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadTerms = async () => {
      try {
        const response = await getPublicStoreSettings();
        if (isMounted && response?.data) {
          setSettings(response.data);
        }
      } catch (err) {
        console.error("Failed to load terms and store policies:", err);
        if (isMounted) setLoadWarning(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTerms();
    return () => {
      isMounted = false;
    };
  }, []);

  const shipping = settings?.shipping || DEFAULT_PUBLIC_SETTINGS.shipping;
  const orderPolicies =
    settings?.orderPolicies || DEFAULT_PUBLIC_SETTINGS.orderPolicies;
  const legal = settings?.legal || DEFAULT_PUBLIC_SETTINGS.legal;

  const sections = parsePlainTextTerms(legal.termsAndConditions);
  const lastUpdated = formatUpdatedDate(legal.termsUpdatedAt);
  const hasFreeShipping = Number(shipping.freeShippingThreshold || 0) > 0;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#183d3d] hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Cart
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f0ef] text-[#183d3d]">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#183d3d] sm:text-4xl">
                Terms & Conditions
              </h1>
              {lastUpdated && (
                <p className="mt-1 text-sm text-gray-500">
                  Last updated: {lastUpdated}
                </p>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-500">
            <RefreshCw className="mr-2.5 h-5 w-5 animate-spin text-[#183d3d]" />
            Loading current store policies...
          </div>
        ) : (
          <>
            {loadWarning && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Showing default store policies while live settings reconnect.
              </div>
            )}

            {/* Auto-Generated Live Store Policy Summary Card */}
            <section
              aria-labelledby="active-policies-heading"
              className="rounded-2xl border border-[#b9d0cd] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-5 flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-[#183d3d]" />
                <h2
                  id="active-policies-heading"
                  className="text-lg font-bold text-[#183d3d]"
                >
                  Active Store Policies
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Shipping Rates */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#183d3d]">
                    <Truck size={15} />
                    Delivery Rates
                  </div>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {shipping.shopDistrict}: {formatLKR(shipping.localBaseFee)}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">
                    Islandwide: {formatLKR(shipping.islandwideBaseFee)}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-gray-600">
                    Covers up to {formatWeightGrams(shipping.baseWeightGrams)}.{" "}
                    {shipping.extraKgFee > 0
                      ? `Extra weight: ${formatLKR(shipping.extraKgFee)} per kg.`
                      : "No extra weight surcharge."}
                    {hasFreeShipping
                      ? ` Free delivery on orders over ${formatLKR(shipping.freeShippingThreshold)}.`
                      : ""}
                  </p>
                </div>

                {/* Online Payment Window */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#183d3d]">
                    <Clock size={15} />
                    Online Payment Window
                  </div>
                  <p className="mt-2 text-lg font-bold text-gray-900">
                    {orderPolicies.onlinePaymentTimeoutMinutes} minutes
                  </p>
                  <p className="mt-2 text-xs leading-5 text-gray-600">
                    Unpaid PayHere orders are automatically cancelled after this
                    window and reserved stock is returned to inventory.
                  </p>
                </div>

                {/* Store Pickup Hold Window */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#183d3d]">
                    <Store size={15} />
                    Pay at Store Hold
                  </div>
                  <p className="mt-2 text-lg font-bold text-gray-900">
                    {orderPolicies.autoCancelStorePickup
                      ? formatHoldHours(orderPolicies.storePickupHoldHours)
                      : "Manual Store Hold"}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-gray-600">
                    {orderPolicies.autoCancelStorePickup
                      ? `Unclaimed Pay at Store reservations at our ${shipping.shopDistrict} counter expire automatically after this period.`
                      : `Reserved at our ${shipping.shopDistrict} counter until collected or cancelled by store staff.`}
                  </p>
                </div>
              </div>
            </section>

            {/* Plain-Text Terms Sections (Zero dangerouslySetInnerHTML) */}
            <article className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              {sections.length === 0 ? (
                <p className="text-sm text-gray-600">
                  Store terms and conditions are currently being updated. Please
                  contact our team if you have any questions regarding your
                  order.
                </p>
              ) : (
                sections.map((section, index) => (
                  <section key={index} className="space-y-2.5">
                    {section.heading && (
                      <h2 className="text-lg font-bold text-[#183d3d]">
                        {section.heading}
                      </h2>
                    )}
                    {section.paragraphs.map((paragraph, pIdx) => (
                      <p key={pIdx} className="text-sm leading-7 text-gray-700">
                        {paragraph}
                      </p>
                    ))}
                  </section>
                ))
              )}

              <div className="border-t border-gray-100 pt-5 text-xs text-gray-500">
                Questions about shipping, pickup, or warranty terms?{" "}
                <Link
                  to="/contact-us"
                  className="font-semibold text-[#183d3d] underline underline-offset-2 hover:text-[#245454]"
                >
                  Contact our store team
                </Link>
                .
              </div>
            </article>
          </>
        )}
      </div>
    </div>
  );
}
