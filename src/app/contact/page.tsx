'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  MessageCircle
} from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Add contact message to Firebase
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        createdAt: new Date(),
        status: 'new'
      });
      
      toast.success('Your message has been sent successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get in touch with our healthcare team. We're here to help you with any questions or concerns.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-healthcare-blue rounded-lg p-3">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-600">+91 8824187767</p>
                    <p className="text-gray-600">+91 6367225694</p>
                    <p className="text-sm text-gray-500">Mon-Sat 9AM-8PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-healthcare-green rounded-lg p-3">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">raghuvanshisamrajya@gmail.com</p>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-healthcare-blue rounded-lg p-3">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Address</h3>
                    <p className="text-gray-600">123 Healthcare Street<br />Medical District, Mumbai 400001</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-healthcare-green rounded-lg p-3">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Working Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 8:00 PM<br />
                      Saturday: 9:00 AM - 6:00 PM<br />
                      Sunday: 10:00 AM - 4:00 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mt-8 p-6 bg-red-50 rounded-xl border border-red-200">
                <h3 className="font-semibold text-red-900 mb-2">Emergency Contact</h3>
                <p className="text-red-700">For medical emergencies, call:</p>
                <p className="text-xl font-bold text-red-900">+91 8824187767</p>
                <p className="text-xl font-bold text-red-900">+91 6367225694</p>
                <p className="text-sm text-red-600">Available 24/7</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-healthcare-blue focus:border-transparent transition-colors"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-healthcare-blue focus:border-transparent transition-colors"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-healthcare-blue focus:border-transparent transition-colors"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-healthcare-blue focus:border-transparent transition-colors"
                    placeholder="What is this regarding?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-healthcare-blue focus:border-transparent transition-colors resize-none"
                    placeholder="Please describe your inquiry or concern..."
                    required
                  ></textarea>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-healthcare-blue hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* WhatsApp Contact */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
              <MessageCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quick WhatsApp Support</h3>
              <p className="text-gray-600 mb-4">Get instant answers to your healthcare questions</p>
              <a
                href="https://wa.me/918824187767?text=Hello, I need healthcare assistance"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
