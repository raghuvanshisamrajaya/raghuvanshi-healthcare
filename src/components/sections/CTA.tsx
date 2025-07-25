'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Phone,
  ArrowRight,
  Heart,
  Stethoscope,
  Shield,
  Clock
} from 'lucide-react';
import Button from '@/components/ui/Button';

const CTA = () => {
  const ctaFeatures = [
    {
      icon: Calendar,
      text: "Easy Online Booking"
    },
    {
      icon: Clock,
      text: "24/7 Emergency Support"
    },
    {
      icon: Shield,
      text: "Safe & Secure"
    },
    {
      icon: Stethoscope,
      text: "Expert Medical Team"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-healthcare-blue via-primary-600 to-healthcare-green text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse animation-delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-2 mb-6">
                <Image
                  src="/logo-healthcare-gold.png"
                  alt="Raghuvanshi Healthcare"
                  width={32}
                  height={38}
                  className="w-8 h-10"
                />
                <span className="text-lg font-semibold">Ready to Get Started?</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-6 leading-tight">
                Your Health Journey
                <br />
                <span className="text-yellow-300">Starts Here</span>
              </h2>
              
              <p className="text-blue-100 text-lg leading-relaxed mb-8">
                Take the first step towards better health with Raghuvanshi Healthcare. 
                Our expert medical team is ready to provide you with personalized care 
                and treatment plans tailored to your unique needs.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {ctaFeatures.map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-blue-100 text-sm font-medium">
                      {feature.text}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Link href="/services">
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="bg-white text-healthcare-blue hover:bg-gray-100 group"
                  >
                    Book Appointment Now
                    <Calendar className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
                
                <Link href="tel:+918824187767">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-white text-white hover:bg-white hover:text-healthcare-blue group"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Emergency Call
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Side - Stats/Visual */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                {/* Main Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Stethoscope className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Premium Healthcare</h3>
                    <p className="text-blue-100">Available 24/7</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">50K+</div>
                      <div className="text-blue-200 text-sm">Patients Served</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">4.9★</div>
                      <div className="text-blue-200 text-sm">Average Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">100+</div>
                      <div className="text-blue-200 text-sm">Expert Doctors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">15+</div>
                      <div className="text-blue-200 text-sm">Years Experience</div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div 
                  className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Image
                    src="/logo-healthcare-gold.png"
                    alt="Raghuvanshi Healthcare"
                    width={32}
                    height={38}
                    className="w-8 h-10"
                  />
                </motion.div>

                <motion.div 
                  className="absolute -bottom-4 -left-4 w-12 h-12 bg-healthcare-green rounded-full flex items-center justify-center shadow-lg"
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <Shield className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <motion.div 
            className="text-center mt-16 pt-16 border-t border-white/20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <p className="text-blue-100 mb-6">
              Join thousands of satisfied patients who trust Raghuvanshi Healthcare
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 bg-white/20 border-2 border-white rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold">P{i}</span>
                    </div>
                  ))}
                </div>
                <span className="text-blue-100 text-sm">50,000+ Happy Patients</span>
              </div>
              
              <div className="flex items-center space-x-2 text-yellow-300">
                <span className="text-lg">★★★★★</span>
                <span className="text-blue-100 text-sm">4.9/5 Average Rating</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
