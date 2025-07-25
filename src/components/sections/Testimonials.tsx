'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Software Engineer",
      image: "/images/testimonials/patient1.jpg",
      rating: 5,
      text: "Exceptional care and professional service. The doctors are highly skilled and the staff is very caring. I highly recommend Raghuvanshi Healthcare for all your medical needs."
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      role: "Business Owner",
      image: "/images/testimonials/patient2.jpg",
      rating: 5,
      text: "The 24/7 emergency service saved my life. Quick response, excellent treatment, and compassionate care. Forever grateful to the entire team at Raghuvanshi Healthcare."
    },
    {
      id: 3,
      name: "Anjali Patel",
      role: "Teacher",
      image: "/images/testimonials/patient3.jpg",
      rating: 5,
      text: "Outstanding healthcare facility with modern equipment and experienced doctors. The online appointment system is very convenient. Highly satisfied with their services."
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
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
            <span className="inline-block px-4 py-2 bg-healthcare-green/10 text-healthcare-green rounded-full text-sm font-medium mb-4">
              Patient Reviews
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-gray-900 dark:text-white mb-6">
              What Our Patients
              <br />
              <span className="text-healthcare-blue">Say About Us</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Real stories from real patients who have experienced our quality healthcare services 
              and compassionate care firsthand.
            </p>
          </motion.div>

          {/* Testimonials Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={testimonial.id}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 relative"
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ duration: 0.2 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 w-8 h-8 bg-healthcare-blue/10 text-healthcare-blue rounded-full flex items-center justify-center">
                  <Quote className="w-4 h-4" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  "{testimonial.text}"
                </p>

                {/* Patient Info */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-healthcare-blue/10 text-healthcare-blue rounded-full flex items-center justify-center font-semibold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom Stats */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-healthcare-blue mb-2">4.9/5</div>
                <div className="text-gray-600 dark:text-gray-400">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-healthcare-green mb-2">50,000+</div>
                <div className="text-gray-600 dark:text-gray-400">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-healthcare-blue mb-2">100+</div>
                <div className="text-gray-600 dark:text-gray-400">Expert Doctors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-healthcare-green mb-2">15+</div>
                <div className="text-gray-600 dark:text-gray-400">Years Experience</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
