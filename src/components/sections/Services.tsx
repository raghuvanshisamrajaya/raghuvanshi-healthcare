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
    <section id="services" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmNGY0ZjQiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-healthcare-green/20 to-healthcare-blue/20 text-healthcare-green rounded-full text-sm font-semibold mb-6 backdrop-blur-sm border border-healthcare-green/20">
              ✨ Our Premium Services
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-healthcare-blue via-blue-600 to-healthcare-green bg-clip-text text-transparent">
                Comprehensive Healthcare
              </span>
              <br />
              <span className="text-gray-700 dark:text-gray-300">Services</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              From preventive care to specialized treatments, we offer a complete range of medical services 
              delivered by experienced healthcare professionals using state-of-the-art technology.
            </p>
          </motion.div>

          {/* Emergency Services */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {emergencyServices.map((service, index) => (
              <motion.div 
                key={index}
                className="relative bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white p-8 rounded-2xl shadow-2xl hover:shadow-red-500/25 border border-red-400/20 overflow-hidden group"
                whileHover={{ scale: 1.05, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {/* Floating background elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                  <p className="text-red-100 mb-6 text-base leading-relaxed">{service.description}</p>
                  <div className="inline-flex items-center text-sm font-bold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-colors">
                    {service.contact}
                  </div>
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
                className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden group hover:shadow-2xl hover:shadow-healthcare-blue/10"
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {service.popular && (
                  <div className="absolute top-6 right-6 bg-gradient-to-r from-healthcare-green to-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                    ⭐ Popular
                  </div>
                )}

                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-healthcare-blue/5 via-transparent to-healthcare-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative p-8">
                  {/* Service Icon */}
                  <div className="w-20 h-20 bg-gradient-to-br from-healthcare-blue/10 to-healthcare-green/10 text-healthcare-blue rounded-2xl flex items-center justify-center mb-8 group-hover:bg-gradient-to-br group-hover:from-healthcare-blue group-hover:to-healthcare-green group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <service.icon className="w-10 h-10" />
                  </div>

                  {/* Service Info */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-healthcare-blue transition-colors duration-300">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-base">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-2 h-2 bg-gradient-to-r from-healthcare-green to-emerald-400 rounded-full mr-3 group-hover:scale-125 transition-transform duration-200" />
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
            className="text-center mt-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative bg-gradient-to-br from-gray-50/80 via-white/80 to-blue-50/80 dark:from-gray-900/80 dark:via-gray-800/80 dark:to-blue-950/80 backdrop-blur-sm p-12 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden">
              {/* Background decorative elements */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-healthcare-blue/10 to-healthcare-green/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-healthcare-green/10 to-blue-500/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-healthcare-blue to-healthcare-green rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <Stethoscope className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Need a Custom Healthcare Package?
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                  Our healthcare experts can create personalized treatment plans and 
                  service packages tailored to your specific health needs and requirements.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link href="/contact">
                    <Button variant="primary" size="xl" className="group shadow-lg hover:shadow-xl">
                      Contact Our Experts
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </Link>
                  <Link href="/services">
                    <Button variant="outline" size="xl" className="shadow-lg hover:shadow-xl">
                      View All Services
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Services;
