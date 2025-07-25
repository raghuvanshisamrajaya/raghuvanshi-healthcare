'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Heart,
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
  Shield,
  Award
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/services', label: 'Services' },
    { href: '/doctors', label: 'Our Doctors' },
    { href: '/contact', label: 'Contact' },
  ];

  const services = [
    { href: '/services/cardiology', label: 'Cardiology' },
    { href: '/services/neurology', label: 'Neurology' },
    { href: '/services/ophthalmology', label: 'Ophthalmology' },
    { href: '/services/pediatrics', label: 'Pediatrics' },
    { href: '/services/general-medicine', label: 'General Medicine' },
  ];

  const resources = [
    { href: '/health-tips', label: 'Health Tips' },
    { href: '/blog', label: 'Medical Blog' },
    { href: '/faq', label: 'FAQ' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms-of-service', label: 'Terms of Service' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', color: 'hover:text-blue-600' },
    { icon: Twitter, href: '#', color: 'hover:text-blue-400' },
    { icon: Instagram, href: '#', color: 'hover:text-pink-500' },
    { icon: Linkedin, href: '#', color: 'hover:text-blue-700' },
    { icon: Youtube, href: '#', color: 'hover:text-red-600' },
  ];

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      content: '+91 8824187767',
      subtitle: '24/7 Emergency Hotline'
    },
    {
      icon: Phone,
      title: 'Alternative Phone',
      content: '+91 6367225694',
      subtitle: 'Customer Service'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'raghuvanshisamrajya@gmail.com',
      subtitle: 'General Inquiries'
    },
    {
      icon: MapPin,
      title: 'Address',
      content: '123 Healthcare Street, Medical District',
      subtitle: 'New Delhi, India 110001'
    },
    {
      icon: Clock,
      title: 'Hours',
      content: 'Mon-Sat: 8:00 AM - 10:00 PM',
      subtitle: 'Sun: 9:00 AM - 6:00 PM'
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-healthcare-blue to-healthcare-green py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Stay Updated with Health Tips & News
            </h3>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter and get the latest health tips, medical insights, 
              and updates about our services delivered to your inbox.
            </p>
            
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg border-0 bg-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-6 py-3 bg-white text-healthcare-blue font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center">
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {/* Logo */}
              <div className="flex items-center space-x-2 mb-6">
                <div className="relative">
                  <Image
                    src="/logo-healthcare-gold.png"
                    alt="Raghuvanshi Healthcare Logo"
                    width={40}
                    height={48}
                    className="w-10 h-12 drop-shadow-lg"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-heading bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-sm">
                    Raghuvanshi
                  </h1>
                  <p className="text-xs font-medium -mt-1 bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                    Healthcare
                  </p>
                </div>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Your trusted healthcare partner since 2008. We provide comprehensive medical services 
                with compassionate care and cutting-edge technology to ensure your health and well-being.
              </p>

              {/* Certifications */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-healthcare-green" />
                  <span className="text-sm text-gray-300">ISO Certified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-healthcare-green" />
                  <span className="text-sm text-gray-300">NABH Accredited</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 transition-colors duration-200 ${social.color}`}
                  >
                    <social.icon className="w-5 h-5" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-healthcare-green transition-colors duration-200 flex items-center group"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-6">Our Services</h3>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index}>
                    <Link
                      href={service.href}
                      className="text-gray-300 hover:text-healthcare-green transition-colors duration-200 flex items-center group"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      {service.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-healthcare-green mb-2">Emergency Services</h4>
                <p className="text-sm text-gray-300 mb-2">24/7 Emergency Care Available</p>
                <Link
                  href="tel:+918824187767"
                  className="text-red-400 font-semibold hover:text-red-300 transition-colors duration-200"
                >
                  Call: +91 8824187767
                </Link>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-6">Contact Info</h3>
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-healthcare-blue/10 text-healthcare-blue rounded-lg flex items-center justify-center mt-1">
                      <info.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{info.title}</h4>
                      <p className="text-gray-300 text-sm">{info.content}</p>
                      <p className="text-gray-400 text-xs">{info.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} Raghuvanshi Healthcare. All rights reserved.
            </div>
            
            <div className="flex flex-wrap items-center space-x-6 text-sm">
              {resources.map((resource, index) => (
                <Link
                  key={index}
                  href={resource.href}
                  className="text-gray-400 hover:text-healthcare-green transition-colors duration-200"
                >
                  {resource.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
