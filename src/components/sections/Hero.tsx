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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse animation-delay-1000" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-300/30 rounded-full blur-2xl animate-bounce animation-delay-2000" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-emerald-300/30 rounded-full blur-2xl animate-bounce animation-delay-1000" />
      </div>

      {/* Medical Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <defs>
            <pattern id="medical-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="#004AAD"/>
              <path d="M10,6 L10,14 M6,10 L14,10" stroke="#29AB87" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#medical-pattern)"/>
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div 
            className="text-center lg:text-left"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 text-emerald-600 rounded-full text-sm font-semibold mb-4 border border-emerald-200/50 backdrop-blur-sm shadow-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                Trusted Healthcare Partner Since 2004
              </span>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-8 leading-tight"
            >
              Your Health,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Our Mission
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent text-4xl md:text-5xl lg:text-6xl">
                Excellence in Care
              </span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-700 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium"
            >
              Experience world-class healthcare with cutting-edge technology, compassionate care, 
              and a team of renowned medical professionals dedicated to your wellbeing.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-12"
            >
              <Link href="/booking">
                <Button variant="primary" size="lg" className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold">
                  Book Appointment
                  <Calendar className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              
              <Link href="/shop">
                <Button variant="outline" size="lg" className="group border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white shadow-xl hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold">
                  Shop Products
                  <ShoppingBag className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </motion.div>

            {/* Enhanced Features */}
            <motion.div 
              variants={fadeInUp}
              className="grid sm:grid-cols-3 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="group p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl border border-white/20 hover:border-blue-200/50 transform hover:scale-105 transition-all duration-300"
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/25 transition-all duration-300">
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
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
