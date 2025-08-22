import Footer from "@/components/footer";
import Header from "@/components/header";
import CTASection from "@/components/ui/cta-section";
import FeaturesSection from "@/components/ui/features-section";
import HeroSection from "@/components/ui/hero-section";
import HowItWorks from "@/components/ui/how-it-works";
import Image from "next/image";

export default function Home() {
  return (
    <>
    <Header />
    <HeroSection />
    <FeaturesSection />
    <HowItWorks />
    <CTASection />
    <Footer />
    </>
  );
}
