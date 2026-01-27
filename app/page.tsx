import { Header } from "./components/landing/Header";
import { Hero } from "./components/landing/Hero";
import { Features } from "./components/landing/Features";
import { HowItWorks } from "./components/landing/HowItWorks";
import { Footer } from "./components/landing/Footer";


export default function Home() {
  return (
    <main className="min-h-screen bg-white selection:bg-green-100 selection:text-green-900">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
        </main>
  );
}