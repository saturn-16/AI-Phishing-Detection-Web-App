import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import ScannerSection from "@/components/scanner-section";
import Footer from "@/components/footer";
import { LiquidChrome } from "@/components/ui/liquid-chrome";

export default function Home() {
  return (
    <>
      <div className="fixed inset-0 z-0">
        <LiquidChrome
          baseColor={[0.1, 0.1, 0.1]}
          speed={1}
          amplitude={0.6}
          interactive
        />
      </div>

      <div className="relative z-10">
        <Navbar />
        <main>
          <HeroSection />
          <ScannerSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
