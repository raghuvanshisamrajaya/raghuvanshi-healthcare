import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Award, 
  Users, 
  Clock, 
  Heart, 
  Shield, 
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'About Us - Raghuvanshi Healthcare',
  description: 'Learn about Raghuvanshi Healthcare - 20+ years of trusted medical care, experienced doctors, and modern facilities.',
};

const stats = [
  {
    icon: Users,
    number: '50,000+',
    label: 'Patients Treated',
    description: 'Successfully treated patients'
  },
  {
    icon: Award,
    number: '20+',
    label: 'Years Experience',
    description: 'Of trusted healthcare'
  },
  {
    icon: Users,
    number: '25+',
    label: 'Expert Doctors',
    description: 'Qualified medical professionals'
  },
  {
    icon: Clock,
    number: '24/7',
    label: 'Emergency Care',
    description: 'Round the clock service'
  }
];

const team = [
  {
    name: 'Dr. Rajesh Raghuvanshi',
    position: 'Chief Medical Officer',
    specialization: 'General Medicine & Cardiology',
    experience: '25+ years',
    education: 'MBBS, MD - AIIMS New Delhi',
    image: '/images/dr-rajesh.jpg'
  },
  {
    name: 'Dr. Priya Sharma',
    position: 'Senior Pediatrician',
    specialization: 'Pediatrics & Child Development',
    experience: '15+ years',
    education: 'MBBS, DCH - PGIMER Chandigarh',
    image: '/images/dr-priya.jpg'
  },
  {
    name: 'Dr. Amit Gupta',
    position: 'Orthopedic Surgeon',
    specialization: 'Joint Replacement & Sports Medicine',
    experience: '18+ years',
    education: 'MBBS, MS Orthopedics - MAMC Delhi',
    image: '/images/dr-amit.jpg'
  },
  {
    name: 'Dr. Sunita Verma',
    position: 'Dermatologist',
    specialization: 'Skin Care & Cosmetic Procedures',
    experience: '12+ years',
    education: 'MBBS, MD Dermatology - KGMU Lucknow',
    image: '/images/dr-sunita.jpg'
  }
];

const values = [
  {
    icon: Heart,
    title: 'Compassionate Care',
    description: 'We treat every patient with empathy, respect, and genuine concern for their wellbeing.'
  },
  {
    icon: Shield,
    title: 'Quality & Safety',
    description: 'Maintaining the highest standards of medical care with strict safety protocols.'
  },
  {
    icon: Star,
    title: 'Excellence',
    description: 'Continuously improving our services to provide exceptional healthcare experiences.'
  },
  {
    icon: Users,
    title: 'Patient-Centered',
    description: 'Putting patients first in everything we do, ensuring personalized care for each individual.'
  }
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-healthcare-blue to-blue-600 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">About Raghuvanshi Healthcare</h1>
              <p className="text-xl mb-8 opacity-90">
                Committed to providing exceptional healthcare services for over 20 years, 
                with a focus on patient care, medical excellence, and community wellness.
              </p>
              <Button variant="outline" className="bg-white text-healthcare-blue border-white hover:bg-gray-100">
                <Calendar className="w-5 h-5 mr-2" />
                Book Consultation
              </Button>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Two Decades of Healthcare Excellence
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Founded in 2004 by Dr. Rajesh Raghuvanshi, our healthcare center began with a simple 
                    mission: to provide accessible, high-quality medical care to our community. What started 
                    as a small clinic has grown into a comprehensive healthcare facility serving thousands 
                    of patients.
                  </p>
                  <p className="text-gray-600 mb-6">
                    Over the years, we have expanded our services, upgraded our facilities, and assembled 
                    a team of experienced medical professionals. Our commitment to patient care and medical 
                    excellence has made us a trusted name in healthcare.
                  </p>
                  <p className="text-gray-600">
                    Today, we continue to evolve, embracing new technologies and treatment methods while 
                    maintaining the personal touch and compassionate care that has been our hallmark 
                    since day one.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-healthcare-blue to-healthcare-green rounded-2xl p-8 text-white">
                  <h4 className="text-xl font-bold mb-6">Our Milestones</h4>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-white rounded-full mr-4"></div>
                      <span>2004 - Founded Raghuvanshi Healthcare</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-white rounded-full mr-4"></div>
                      <span>2010 - Expanded to multi-specialty services</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-white rounded-full mr-4"></div>
                      <span>2015 - Introduced 24/7 emergency services</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-white rounded-full mr-4"></div>
                      <span>2020 - Launched telemedicine platform</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-white rounded-full mr-4"></div>
                      <span>2024 - Digital health records integration</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact in Numbers</h2>
              <p className="text-gray-600">
                These numbers reflect our commitment to providing quality healthcare
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                    <stat.icon className="w-12 h-12 text-healthcare-blue mx-auto mb-4" />
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                    <div className="text-lg font-semibold text-gray-700 mb-1">{stat.label}</div>
                    <div className="text-sm text-gray-500">{stat.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                These values guide everything we do and shape our approach to healthcare
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="bg-healthcare-blue text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Medical Team</h2>
              <p className="text-gray-600">
                Experienced professionals dedicated to your health and wellbeing
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((doctor, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-64 bg-gradient-to-br from-healthcare-blue to-healthcare-green flex items-center justify-center">
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h3>
                    <p className="text-healthcare-blue font-semibold mb-2">{doctor.position}</p>
                    <p className="text-gray-600 text-sm mb-3">{doctor.specialization}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Experience: {doctor.experience}</div>
                      <div>Education: {doctor.education}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-healthcare-blue text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Get in Touch with Us</h2>
            <p className="text-xl mb-8 opacity-90">
              Have questions about our services? We're here to help!
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="flex items-center justify-center">
                <Phone className="w-6 h-6 mr-3" />
                <div>
                  <div className="font-semibold">Call Us</div>
                  <div className="opacity-90">+91 9876543210</div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Mail className="w-6 h-6 mr-3" />
                <div>
                  <div className="font-semibold">Email Us</div>
                  <div className="opacity-90">info@raghuvanshihealthcare.com</div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <MapPin className="w-6 h-6 mr-3" />
                <div>
                  <div className="font-semibold">Visit Us</div>
                  <div className="opacity-90">123 Health Street, Delhi</div>
                </div>
              </div>
            </div>
            <Button variant="outline" className="bg-white text-healthcare-blue border-white hover:bg-gray-100">
              Contact Us Today
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
