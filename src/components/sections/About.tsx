'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Award, 
  Users, 
  MapPin, 
  Clock,
  Heart,
  Shield,
  Stethoscope,
  Star
} from 'lucide-react';

const About = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const stats = [
    {
      icon: Users,
      number: "50,000+",
      label: "Happy Patients",
      color: "text-healthcare-blue"
    },
    {
      icon: Stethoscope,
      number: "100+",
      label: "Expert Doctors",
      color: "text-healthcare-green"
    },
    {
      icon: Award,
      number: "15+",
      label: "Years Experience",
      color: "text-healthcare-blue"
    },
    {
      icon: MapPin,
      number: "10+",
      label: "Locations",
      color: "text-healthcare-green"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "We treat every patient with empathy, kindness, and respect, ensuring they feel valued and cared for throughout their healthcare journey."
    },
    {
      icon: Shield,
      title: "Quality & Safety",
      description: "Our commitment to the highest standards of medical care ensures safe, effective treatments using the latest medical technologies and practices."
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Round-the-clock emergency services and support because health emergencies don't wait for convenient times."
    },
    {
      icon: Star,
      title: "Excellence",
      description: "Continuous improvement and innovation in healthcare delivery to provide the best possible outcomes for our patients."
    }
  ];

  return (
    <section id="about" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-healthcare-blue/10 text-healthcare-blue rounded-full text-sm font-medium mb-4">
              About Us
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-gray-900 dark:text-white mb-6">
              Trusted Healthcare Partner
              <br />
              <span className="text-healthcare-green">Since 2008</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Raghuvanshi Healthcare has been at the forefront of providing exceptional medical care, 
              combining traditional values with modern healthcare technology to serve our community better.
            </p>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Committed to Your Health & Well-being
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
                At Raghuvanshi Healthcare, we believe that quality healthcare should be accessible to everyone. 
                Our team of experienced healthcare professionals is dedicated to providing personalized care 
                that addresses your unique health needs.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-healthcare-green rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">State-of-the-art Technology</h4>
                    <p className="text-gray-600 dark:text-gray-400">Latest medical equipment and digital health solutions</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-healthcare-green rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Experienced Team</h4>
                    <p className="text-gray-600 dark:text-gray-400">Board-certified doctors and skilled healthcare professionals</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-healthcare-green rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Comprehensive Services</h4>
                    <p className="text-gray-600 dark:text-gray-400">From preventive care to specialized treatments</p>
                  </div>
                </div>
              </div>

              <div className="bg-healthcare-blue/5 dark:bg-healthcare-blue/10 p-6 rounded-xl">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-healthcare-blue text-white rounded-lg flex items-center justify-center">
                    <Image
                      src="/logo-healthcare-gold.png"
                      alt="Raghuvanshi Healthcare"
                      width={24}
                      height={29}
                      className="w-6 h-7"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Our Mission</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      To provide accessible, high-quality healthcare services that improve the health and 
                      well-being of our community through compassionate care and innovative solutions.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Values Grid */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {values.map((value, index) => (
                <motion.div 
                  key={index}
                  className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-12 h-12 bg-healthcare-blue/10 text-healthcare-blue rounded-lg flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {value.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-healthcare-blue to-healthcare-green p-8 rounded-2xl text-white">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Experience Quality Healthcare?
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Join thousands of satisfied patients who trust Raghuvanshi Healthcare for their medical needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-white text-healthcare-blue font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  Schedule Consultation
                </button>
                <button className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-healthcare-blue transition-colors duration-200">
                  Learn More
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
