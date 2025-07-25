'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Calendar, 
  ShoppingBag, 
  Stethoscope,
  Heart,
  Shield,
  Clock
} from 'lucide-react';
import Button from '@/components/ui/Button';

const Hero = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: Clock,
      title: "24/7 Emergency",
      description: "Round-the-clock emergency medical services"
    },
    {
      icon: Stethoscope,
      title: "Expert Doctors",
      description: "Experienced healthcare professionals"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your health data is completely secure"
    }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-healthcare-blue/5 via-white to-healthcare-green/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-healthcare-blue rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-healthcare-green rounded-full blur-3xl animate-pulse animation-delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-healthcare-blue/50 rounded-full blur-2xl animate-pulse animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div 
            className="text-center lg:text-left"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center px-4 py-2 bg-healthcare-green/10 text-healthcare-green rounded-full text-sm font-medium mb-4">
                <Image
                  src="/logo-healthcare-gold.png"
                  alt="Raghuvanshi Healthcare"
                  width={16}
                  height={19}
                  className="w-4 h-5 mr-2"
                />
                Trusted Healthcare Partner
              </span>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-gray-900 dark:text-white mb-6 leading-tight"
            >
              Your Health,{' '}
              <span className="text-healthcare-blue">Our Priority</span>
              <br />
              <span className="text-healthcare-green">24/7 Care</span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Experience comprehensive healthcare services with Raghuvanshi Healthcare. 
              From expert consultations to quality medical products, we're here to support 
              your health journey every step of the way.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
            >
              <Link href="/services">
                <Button variant="primary" size="lg" className="group">
                  Book Appointment
                  <Calendar className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
              
              <Link href="/shop">
                <Button variant="outline" size="lg" className="group">
                  Shop Products
                  <ShoppingBag className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
            </motion.div>

            {/* Features */}
            <motion.div 
              variants={fadeInUp}
              className="grid sm:grid-cols-3 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-healthcare-blue/10 text-healthcare-blue rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Image/Illustration */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative z-10 bg-gradient-to-br from-healthcare-blue to-healthcare-green rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-8 text-center">
                  {/* Doctor Illustration */}
                  <div className="w-64 h-64 mx-auto mb-6 bg-gradient-to-br from-healthcare-blue/10 to-healthcare-green/10 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-32 h-32 text-healthcare-blue" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Expert Medical Care
                  </h3>
                  <p className="text-gray-600">
                    Connecting you with the best healthcare professionals
                  </p>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div 
                className="absolute -top-6 -right-6 w-20 h-20 bg-healthcare-green rounded-full flex items-center justify-center shadow-lg"
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/logo-healthcare-gold.png"
                  alt="Raghuvanshi Healthcare"
                  width={40}
                  height={48}
                  className="w-10 h-12"
                />
              </motion.div>

              <motion.div 
                className="absolute -bottom-6 -left-6 w-16 h-16 bg-healthcare-blue rounded-full flex items-center justify-center shadow-lg"
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>

              {/* Stats Cards */}
              <motion.div 
                className="absolute top-4 -left-8 bg-white rounded-lg shadow-lg p-4 min-w-[120px]"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-healthcare-blue">50K+</div>
                  <div className="text-sm text-gray-600">Happy Patients</div>
                </div>
              </motion.div>

              <motion.div 
                className="absolute bottom-16 -right-8 bg-white rounded-lg shadow-lg p-4 min-w-[120px]"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-healthcare-green">24/7</div>
                  <div className="text-sm text-gray-600">Available</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
        >
          <motion.div 
            className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
            animate={{ 
              y: [0, 10, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.div 
              className="w-1 h-3 bg-gray-400 rounded-full mt-2"
              animate={{ 
                scaleY: [1, 0.3, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
