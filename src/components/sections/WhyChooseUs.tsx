'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield,
  Clock,
  Heart,
  Award,
  Users,
  Stethoscope,
  Star,
  CheckCircle
} from 'lucide-react';

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: Shield,
      title: "Advanced Technology",
      description: "State-of-the-art medical equipment and cutting-edge healthcare technology for accurate diagnosis and effective treatment.",
      stats: "99% Accuracy Rate"
    },
    {
      icon: Users,
      title: "Expert Medical Team",
      description: "Board-certified doctors and experienced healthcare professionals dedicated to providing exceptional patient care.",
      stats: "100+ Specialists"
    },
    {
      icon: Clock,
      title: "24/7 Emergency Care",
      description: "Round-the-clock emergency services with fully equipped ambulances and immediate medical response.",
      stats: "24/7 Availability"
    },
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "Patient-centered approach with personalized treatment plans and emotional support throughout your healthcare journey.",
      stats: "50K+ Happy Patients"
    }
  ];

  const achievements = [
    {
      icon: Award,
      title: "15+ Years",
      subtitle: "Healthcare Excellence"
    },
    {
      icon: Star,
      title: "4.9/5",
      subtitle: "Patient Rating"
    },
    {
      icon: CheckCircle,
      title: "ISO 9001",
      subtitle: "Quality Certified"
    },
    {
      icon: Stethoscope,
      title: "50+ Services",
      subtitle: "Medical Specialties"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-healthcare-blue/5 via-white to-healthcare-green/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-gray-900 dark:text-white mb-6">
              Your Health Deserves the
              <br />
              <span className="text-healthcare-green">Best Care</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              With over 15 years of experience in healthcare, we combine medical excellence 
              with compassionate care to provide you with the best possible health outcomes.
            </p>
          </motion.div>

          {/* Main Reasons Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {reasons.map((reason, index) => (
              <motion.div 
                key={index}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 group hover:shadow-xl transition-shadow duration-300"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-healthcare-blue/10 text-healthcare-blue rounded-xl flex items-center justify-center group-hover:bg-healthcare-blue group-hover:text-white transition-colors duration-300">
                    <reason.icon className="w-8 h-8" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {reason.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      {reason.description}
                    </p>
                    <div className="inline-flex items-center px-3 py-1 bg-healthcare-green/10 text-healthcare-green rounded-full text-sm font-medium">
                      {reason.stats}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Achievements */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {achievements.map((achievement, index) => (
              <motion.div 
                key={index}
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-healthcare-green/10 text-healthcare-green rounded-lg flex items-center justify-center">
                  <achievement.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {achievement.title}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {achievement.subtitle}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div 
            className="text-center bg-gradient-to-r from-healthcare-blue to-healthcare-green p-8 rounded-2xl text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-4">
              Experience the Difference in Healthcare
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of patients who have chosen Raghuvanshi Healthcare for their medical needs. 
              Book your appointment today and experience quality healthcare like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-white text-healthcare-blue font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200">
                Book Appointment Now
              </button>
              <button className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-healthcare-blue transition-colors duration-200">
                Call: +91 8824187767
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
