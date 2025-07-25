'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How do I book an appointment online?",
      answer: "You can easily book an appointment through our website by clicking the 'Book Appointment' button, selecting your preferred doctor, date, and time slot. You'll receive a confirmation email with all the details."
    },
    {
      question: "Do you accept insurance coverage?",
      answer: "Yes, we accept most major insurance plans including government health schemes. Please contact our billing department or check our insurance partners page for detailed coverage information."
    },
    {
      question: "What are your emergency services hours?",
      answer: "Our emergency services are available 24/7, 365 days a year. We have fully equipped ambulances and emergency medical teams ready to respond at any time."
    },
    {
      question: "Can I get my prescription medications delivered?",
      answer: "Yes, we offer home delivery of prescription medications within the city limits. Orders placed before 3 PM are typically delivered the same day, while others are delivered the next day."
    },
    {
      question: "Do you offer telemedicine consultations?",
      answer: "Absolutely! We provide video consultations with our doctors for follow-up visits, prescription renewals, and non-emergency medical advice. Book online or call us to schedule."
    },
    {
      question: "What safety measures do you have in place?",
      answer: "We follow strict hygiene and safety protocols including regular sanitization, temperature screening, social distancing measures, and proper PPE usage by all staff members."
    },
    {
      question: "How can I access my medical reports online?",
      answer: "You can access your medical reports, lab results, and prescription history through our patient portal. Create an account on our website using your patient ID and contact details."
    },
    {
      question: "Do you provide health checkup packages?",
      answer: "Yes, we offer comprehensive health checkup packages for different age groups and health needs. These include basic wellness checks, executive health packages, and specialized screening programs."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-healthcare-blue/10 text-healthcare-blue rounded-full text-sm font-medium mb-4">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-gray-900 dark:text-white mb-6">
              Frequently Asked
              <br />
              <span className="text-healthcare-green">Questions</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Find answers to common questions about our healthcare services, 
              appointment booking, insurance, and more.
            </p>
          </motion.div>

          {/* FAQ List */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <span className="font-semibold text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="bg-healthcare-blue/5 dark:bg-healthcare-blue/10 p-8 rounded-2xl">
              <HelpCircle className="w-12 h-12 text-healthcare-blue mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Still Have Questions?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our customer support team is here to help you with any additional questions 
                or concerns you may have about our services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-healthcare-blue text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200">
                  Contact Support
                </button>
                <button className="px-6 py-3 border-2 border-healthcare-blue text-healthcare-blue font-semibold rounded-lg hover:bg-healthcare-blue hover:text-white transition-colors duration-200">
                  Call: +91 8824187767
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
