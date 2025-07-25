import { Metadata } from 'next';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Services from '@/components/sections/Services';
import WhyChooseUs from '@/components/sections/WhyChooseUs';
import Testimonials from '@/components/sections/Testimonials';
import FAQ from '@/components/sections/FAQ';
import CTA from '@/components/sections/CTA';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to Raghuvanshi Healthcare - Your trusted healthcare partner for over 20 years.',
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="overflow-x-hidden">
        <Hero />
        <About />
        <Services />
        <WhyChooseUs />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
