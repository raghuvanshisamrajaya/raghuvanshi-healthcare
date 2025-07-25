// Sample data for services and doctors
// You can use this data to populate your Firebase collections

// Sample Services Data for 'services' collection
export const sampleServices = [
  {
    name: "General Consultation",
    description: "Complete health checkup and medical consultation",
    price: 500,
    duration: "30 minutes",
    category: "General Medicine",
    image: "/images/services/general-consultation.jpg"
  },
  {
    name: "Cardiology Consultation",
    description: "Heart health checkup and cardiovascular assessment",
    price: 1200,
    duration: "45 minutes",
    category: "Cardiology",
    image: "/images/services/cardiology.jpg"
  },
  {
    name: "Dermatology Consultation",
    description: "Skin and hair related consultation and treatment",
    price: 800,
    duration: "30 minutes",
    category: "Dermatology",
    image: "/images/services/dermatology.jpg"
  },
  {
    name: "Pediatric Consultation",
    description: "Child health consultation and immunization",
    price: 600,
    duration: "30 minutes",
    category: "Pediatrics",
    image: "/images/services/pediatrics.jpg"
  },
  {
    name: "Orthopedic Consultation",
    description: "Bone and joint health consultation",
    price: 1000,
    duration: "40 minutes",
    category: "Orthopedics",
    image: "/images/services/orthopedics.jpg"
  },
  {
    name: "Eye Examination",
    description: "Complete eye checkup and vision testing",
    price: 700,
    duration: "25 minutes",
    category: "Ophthalmology",
    image: "/images/services/eye-exam.jpg"
  },
  {
    name: "Dental Checkup",
    description: "Oral health examination and cleaning",
    price: 400,
    duration: "30 minutes",
    category: "Dentistry",
    image: "/images/services/dental.jpg"
  },
  {
    name: "Blood Test Package",
    description: "Comprehensive blood work and analysis",
    price: 1500,
    duration: "15 minutes",
    category: "Laboratory",
    image: "/images/services/blood-test.jpg"
  }
];

// Sample Doctors Data for 'doctors' collection
export const sampleDoctors = [
  {
    name: "Dr. Rajesh Kumar",
    specialization: "General Medicine",
    experience: "15 years",
    rating: 4.8,
    image: "/images/doctors/dr-rajesh.jpg",
    available_slots: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
    education: "MBBS, MD - Internal Medicine",
    about: "Experienced general physician with expertise in preventive medicine and chronic disease management."
  },
  {
    name: "Dr. Priya Sharma",
    specialization: "Cardiology",
    experience: "12 years",
    rating: 4.9,
    image: "/images/doctors/dr-priya.jpg",
    available_slots: ["9:30", "11:00", "14:30", "16:00"],
    education: "MBBS, MD - Cardiology",
    about: "Specialized cardiologist with focus on heart disease prevention and treatment."
  },
  {
    name: "Dr. Amit Patel",
    specialization: "Dermatology",
    experience: "10 years",
    rating: 4.7,
    image: "/images/doctors/dr-amit.jpg",
    available_slots: ["10:00", "11:30", "13:00", "15:00", "16:30"],
    education: "MBBS, MD - Dermatology",
    about: "Expert dermatologist specializing in skin disorders and cosmetic treatments."
  },
  {
    name: "Dr. Sunita Gupta",
    specialization: "Pediatrics",
    experience: "18 years",
    rating: 4.9,
    image: "/images/doctors/dr-sunita.jpg",
    available_slots: ["9:00", "10:30", "14:00", "15:30"],
    education: "MBBS, MD - Pediatrics",
    about: "Dedicated pediatrician with extensive experience in child healthcare and development."
  },
  {
    name: "Dr. Vikram Singh",
    specialization: "Orthopedics",
    experience: "20 years",
    rating: 4.8,
    image: "/images/doctors/dr-vikram.jpg",
    available_slots: ["9:30", "11:00", "13:30", "15:00"],
    education: "MBBS, MS - Orthopedics",
    about: "Senior orthopedic surgeon specializing in joint replacement and sports injuries."
  },
  {
    name: "Dr. Meera Reddy",
    specialization: "Ophthalmology",
    experience: "14 years",
    rating: 4.6,
    image: "/images/doctors/dr-meera.jpg",
    available_slots: ["10:00", "11:30", "14:30", "16:00"],
    education: "MBBS, MS - Ophthalmology",
    about: "Eye specialist with expertise in cataract surgery and retinal treatments."
  },
  {
    name: "Dr. Ravi Agarwal",
    specialization: "Dentistry",
    experience: "8 years",
    rating: 4.5,
    image: "/images/doctors/dr-ravi.jpg",
    available_slots: ["9:00", "10:30", "13:00", "14:30", "16:00"],
    education: "BDS, MDS - Oral Surgery",
    about: "Dental surgeon specializing in oral health and cosmetic dentistry."
  }
];

// Instructions to add this data to Firebase:
/*
1. Go to Firebase Console > Firestore Database
2. Create a new collection called 'services'
3. Add each service as a new document (auto-generate IDs)
4. Create a new collection called 'doctors'
5. Add each doctor as a new document (auto-generate IDs)

Or use the Firebase Admin SDK to import this data programmatically.
*/
