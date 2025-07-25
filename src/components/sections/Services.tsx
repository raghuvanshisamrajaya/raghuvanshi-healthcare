'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Stethoscope,
  Heart,
  Brain,
  Eye,
  Users,
  Pill,
  FileText,
  Calendar,
  ArrowRight,
  Clock,
  MapPin,
  Star
} from 'lucide-react';
import Button from '@/components/ui/Button';

const Services = () => {
  const services = [
    {
      id: 1,
      icon: Heart,
      title: "Cardiology",
      description: "Comprehensive heart care including consultations, diagnostics, and treatment for all cardiovascular conditions.",
      price: "₹1,500",
      duration: "45 min",
      rating: 4.9,
      features: ["ECG", "Echocardiography", "Stress Testing", "Heart Surgery Consultation"],
      popular: true
    },
    {
      id: 2,
      icon: Brain,
      title: "Neurology",
      description: "Expert care for neurological disorders including headaches, seizures, stroke, and movement disorders.",
      price: "₹2,000",
      duration: "60 min",
      rating: 4.8,
      features: ["EEG", "MRI Analysis", "Cognitive Assessment", "Treatment Planning"]
    },
    {
      id: 3,
      icon: Eye,
      title: "Ophthalmology",
      description: "Complete eye care services from routine check-ups to advanced surgical procedures.",
      price: "₹1,200",
      duration: "30 min",
      rating: 4.9,
      features: ["Vision Testing", "Retinal Examination", "Glaucoma Screening", "Surgery Consultation"]
    },
    {
      id: 4,
      icon: Users,
      title: "Pediatrics",
      description: "Specialized healthcare for infants, children, and adolescents with compassionate care.",
      price: "₹1,000",
      duration: "30 min",
      rating: 5.0,
      features: ["Growth Monitoring", "Vaccinations", "Development Assessment", "Emergency Care"]
    },
    {
      id: 5,
      icon: Stethoscope,
      title: "General Medicine",
      description: "Primary healthcare services for adults including preventive care and chronic disease management.",
      price: "₹800",
      duration: "30 min",
      rating: 4.7,
      features: ["Health Check-ups", "Chronic Care", "Preventive Medicine", "Referral Services"]
    },
    {
      id: 6,
      icon: Pill,
      title: "Pharmacy",
      description: "Full-service pharmacy with prescription medications, health products, and consultation services.",
      price: "Varies",
      duration: "15 min",
      rating: 4.8,
      features: ["Prescription Filling", "Health Products", "Medication Consultation", "Home Delivery"]
    }
  ];

  const emergencyServices = [
    {
      icon: Clock,
      title: "24/7 Emergency",
      description: "Round-the-clock emergency medical services with ambulance facility.",
      contact: "+91 8824187767"
    },
    {
      icon: MapPin,
      title: "Home Visits",
      description: "Doctor consultation and basic medical services at your doorstep.",
      contact: "Book Online"
    },
    {
      icon: FileText,
      title: "Telemedicine",
      description: "Online consultations with our expert doctors from anywhere.",
      contact: "Video Call"
    }
  ];

  return (
    <section id="services" className="py-20 bg-white dark:bg-gray-800">
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
              Our Services
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-gray-900 dark:text-white mb-6">
              Comprehensive Healthcare
              <br />
              <span className="text-healthcare-blue">Services</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From preventive care to specialized treatments, we offer a complete range of medical services 
              delivered by experienced healthcare professionals using state-of-the-art technology.
            </p>
          </motion.div>

          {/* Emergency Services */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {emergencyServices.map((service, index) => (
              <motion.div 
                key={index}
                className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg"
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <service.icon className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-red-100 mb-4 text-sm">{service.description}</p>
                <div className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full inline-block">
                  {service.contact}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Services Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {services.map((service, index) => (
              <motion.div 
                key={service.id}
                className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden group"
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ duration: 0.2 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {service.popular && (
                  <div className="absolute top-4 right-4 bg-healthcare-green text-white px-3 py-1 rounded-full text-xs font-medium">
                    Popular
                  </div>
                )}

                <div className="p-6">
                  {/* Service Icon */}
                  <div className="w-16 h-16 bg-healthcare-blue/10 text-healthcare-blue rounded-xl flex items-center justify-center mb-6 group-hover:bg-healthcare-blue group-hover:text-white transition-colors duration-300">
                    <service.icon className="w-8 h-8" />
                  </div>

                  {/* Service Info */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 bg-healthcare-green rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Service Details */}
                  <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {service.duration}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        {service.rating}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-healthcare-blue">
                      {service.price}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link href={`/booking`}>
                    <Button 
                      variant="primary" 
                      className="w-full group-hover:bg-healthcare-green group-hover:border-healthcare-green transition-colors duration-300"
                    >
                      Book Appointment
                      <Calendar className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Need a Custom Healthcare Package?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Our healthcare experts can create personalized treatment plans and 
                service packages tailored to your specific health needs and requirements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button variant="primary" size="lg" className="group">
                    Contact Us
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" size="lg">
                    View All Services
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Services;
