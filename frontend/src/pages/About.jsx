
/*
 * About.jsx
 * Main page component for the DVC Store About page..
 */
import HeroSection from "../components/about/HeroSection";
import JourneySection from "../components/about/JourneySection";
import OfferingsSection from "../components/about/OfferingsSection";
import TrustSection from "../components/about/TrustSection";
import FounderSection from "../components/about/FounderSection";
import FAQSection from "../components/about/FAQSection";
import StoreDetailsSection from "../components/about/StoreDetailsSection";
import FinalCTA from "../components/about/FinalCTA";

// Main About page component.
// Combines all sections in the order they appear on the page.
export default function About() {
  return (
    // Main wrapper for the entire About page.
    <main className="min-h-screen overflow-x-clip bg-white font-sans text-slate-800">

      {/* Hero banner with the DVC introduction and animated text. */}
      <HeroSection />
      {/* Company history and business milestones timeline. */}
      <JourneySection />

      {/* Products, accessories, hardware, and services offered by DVC. */}
      <OfferingsSection />

      {/* Highlights the store's customer trust and service commitments. */}
      <TrustSection />

      {/* Shares the founder's message and personal pledge. */}
      <FounderSection />

      {/* Displays frequently asked questions in an interactive accordion. */}
      <FAQSection />

      {/* Shows the physical store information and contact links. */}
      <StoreDetailsSection />

      {/* Final promotional section encouraging visitors to explore the shop. */}
      <FinalCTA />

    </main>
  );
}
