export const INITIAL_RULES = [
  {
    id: 'rule-1',
    symptoms: ['fever', 'cough'],
    condition: 'Flu / Viral Upper Respiratory Infection',
    conditionBn: 'ইনফ্লুয়েঞ্জা / ভাইরাল শ্বাসনালী সংক্রমণ',
    specialist: 'General Physician',
    specialistBn: 'মেডিসিন বিশেষজ্ঞ (General Physician)',
    severity: 'low',
    confidenceBase: 92,
    description: 'Acute viral illness characterized by fever, non-productive or productive cough, and systemic malaise.',
    tips: [
      'Drink plenty of warm fluids (ginger tea, clear broth).',
      'Rest adequately and monitor body temperature twice daily.',
      'Take over-the-counter antipyretics (e.g. Paracetamol) if fever exceeds 100°F.',
      'Consult a doctor if fever persists beyond 3 days or breathing becomes labored.'
    ],
    active: true
  },
  {
    id: 'rule-2',
    symptoms: ['chest_pain', 'shortness_of_breath'],
    condition: 'Possible Acute Coronary Syndrome / Angina',
    conditionBn: 'সম্ভাব্য হৃদরোগ / এনজাইনা বা হার্ট অ্যাটাক ঝুঁকি',
    specialist: 'Cardiologist',
    specialistBn: 'কার্ডিওলজিস্ট (হৃদরোগ বিশেষজ্ঞ)',
    severity: 'urgent',
    confidenceBase: 96,
    description: 'Substernal chest pressure or discomfort combined with dyspnea represents a critical cardiac warning sign requiring emergency evaluation.',
    tips: [
      'CALL EMERGENCY SERVICES (999) OR GO TO THE NEAREST EMERGENCY ROOM IMMEDIATELY.',
      'Sit comfortably and loosen tight clothing around the neck and chest.',
      'Do not engage in physical exertion or drive yourself to the hospital.',
      'If prescribed, take sublingual nitroglycerin under medical direction.'
    ],
    active: true
  },
  {
    id: 'rule-3',
    symptoms: ['headache', 'blurred_vision'],
    condition: 'Severe Migraine / Hypertensive Crisis / Neuro-Visual Event',
    conditionBn: 'তীব্র মাইগ্রেন / উচ্চ রক্তচাপ বা নিউরোলজিক্যাল সমস্যা',
    specialist: 'Neurologist',
    specialistBn: 'নিউরোমেডিসিন বিশেষজ্ঞ (Neurologist)',
    severity: 'urgent',
    confidenceBase: 91,
    description: 'Throbbing cranial headache accompanied by visual distortions may indicate severe migraine with aura or acute intracranial/arterial pressure spikes.',
    tips: [
      'Rest in a dark, quiet room with minimal sensory stimulation.',
      'Check blood pressure immediately if a home monitor is available.',
      'Apply a cold compress to forehead and temples.',
      'Seek urgent medical care if accompanied by facial numbness, speech difficulty, or weakness.'
    ],
    active: true
  },
  {
    id: 'rule-4',
    symptoms: ['skin_rash', 'fever'],
    condition: 'Infectious Exanthem / Drug Reaction / Measles / Dengue Rash',
    conditionBn: 'সংক্রামক ফুসকুড়ি / অ্যালার্জি বা ডেঙ্গুর র‍্যাশ',
    specialist: 'Dermatologist',
    specialistBn: 'চর্ম ও এলার্জি বিশেষজ্ঞ (Dermatologist)',
    severity: 'moderate',
    confidenceBase: 88,
    description: 'Cutaneous eruption coinciding with elevated body temperature suggests systemic infection or acute hypersensitivity.',
    tips: [
      'Avoid scratching to prevent secondary bacterial infection.',
      'Wear loose-fitting, breathable cotton clothing.',
      'Avoid unverified topical steroid creams without prescription.',
      'Hydrate with electrolytes and consult a dermatologist promptly.'
    ],
    active: true
  },
  {
    id: 'rule-5',
    symptoms: ['joint_pain', 'joint_swelling'],
    condition: 'Acute Inflammatory Arthritis / Gout / Synovitis',
    conditionBn: 'তীব্র বাত বা অস্থিসন্ধির প্রদাহ (আর্থ্রাইটিস / গাউট)',
    specialist: 'Orthopedic / Rheumatologist',
    specialistBn: 'বাত ও অস্থি বিশেষজ্ঞ (Orthopedic / Rheumatologist)',
    severity: 'moderate',
    confidenceBase: 86,
    description: 'Swollen, tender joints indicate localized synovial inflammation, uric acid crystal deposition, or autoimmune flare-up.',
    tips: [
      'Rest and elevate the affected joint to reduce swelling.',
      'Apply an ice pack wrapped in a cloth for 15 minutes at a time.',
      'Keep joints gently mobile with light range-of-motion stretching.',
      'Consult a rheumatologist for uric acid and ESR/CRP blood tests.'
    ],
    active: true
  },
  {
    id: 'rule-6',
    symptoms: ['abdominal_pain', 'nausea'],
    condition: 'Possible Gastric Issue / Peptic Ulcer / Gastroenteritis',
    conditionBn: 'গ্যাস্ট্রিক সমস্যা / পেপটিক আলসার বা গ্যাস্ট্রোএন্টারাইটিস',
    specialist: 'Gastroenterologist',
    specialistBn: 'পরিপাকতন্ত্র ও লিভার বিশেষজ্ঞ (Gastroenterologist)',
    severity: 'moderate',
    confidenceBase: 89,
    description: 'Epigastric discomfort with nausea may indicate acute gastritis, peptic ulcer disease, or early gastroenteritis.',
    tips: [
      'Eat small, bland meals (boiled rice, bananas, applesauce).',
      'Avoid oily, deep-fried, heavily spiced foods and caffeine.',
      'Stay hydrated with small, frequent sips of oral saline solution (ORS).',
      'Do not take NSAID pain relievers on an empty stomach.'
    ],
    active: true
  },
  {
    id: 'rule-7',
    symptoms: ['shortness_of_breath', 'wheezing'],
    condition: 'Bronchial Asthma / Reactive Airway Disease',
    conditionBn: 'ব্রঙ্কিয়াল অ্যাজমা / শ্বাসনালীর তীব্র সংকোচন',
    specialist: 'Pulmonologist',
    specialistBn: 'বক্ষব্যাধি ও ফুসফুস বিশেষজ্ঞ (Pulmonologist)',
    severity: 'urgent',
    confidenceBase: 94,
    description: 'Audible wheezing with dyspnea suggests airway constriction, bronchospasm, or exacerbated asthma.',
    tips: [
      'Use prescribed rescue bronchodilator inhaler with spacer as instructed.',
      'Sit upright and practice slow pursed-lip breathing.',
      'Remove yourself from smoke, dust, pollen, and cold air triggers.',
      'Seek emergency room care if lips/fingernails turn bluish or speaking is difficult.'
    ],
    active: true
  },
  {
    id: 'rule-8',
    symptoms: ['fever', 'chills', 'fatigue'],
    condition: 'Acute Systemic Infection (Dengue / Malaria / Typhoid concern)',
    conditionBn: 'তীব্র ইনফেকশন (ডেঙ্গু / ম্যালেরিয়া / টাইফয়েড লক্ষণ)',
    specialist: 'General Physician',
    specialistBn: 'মেডিসিন বিশেষজ্ঞ (General Physician)',
    severity: 'moderate',
    confidenceBase: 88,
    description: 'High spiking fever with shaking chills and profound fatigue in endemic zones requires complete blood count (CBC) testing.',
    tips: [
      'Get a Complete Blood Count (CBC) and NS1 antigen test promptly.',
      'Maintain adequate fluid hydration with coconut water, ORS, and fruit juices.',
      'Do not consume aspirin or ibuprofen (risk of bleeding in dengue).',
      'Use mosquito nets and repellent.'
    ],
    active: true
  },
  {
    id: 'rule-9',
    symptoms: ['ear_pain', 'hearing_loss'],
    condition: 'Otitis Media / Middle Ear Infection / Cerumen Impaction',
    conditionBn: 'কানের সংক্রমণ (ওটিটিস মিডিয়া) / কানের পর্দা ফোলা',
    specialist: 'ENT Specialist',
    specialistBn: 'নাক, কান ও গলা বিশেষজ্ঞ (ENT Specialist)',
    severity: 'moderate',
    confidenceBase: 87,
    description: 'Pain in the auditory canal with diminished sound perception typically stems from middle ear effusion or infection.',
    tips: [
      'Keep the ear canal completely dry when showering.',
      'Never insert cotton buds, pins, or sharp objects into the ear canal.',
      'Apply a warm dry cloth gently to the outside of the ear.',
      'Consult an ENT specialist for otoscopic examination before applying drops.'
    ],
    active: true
  },
  {
    id: 'rule-10',
    symptoms: ['palpitations', 'dizziness'],
    condition: 'Cardiac Arrhythmia / Postural Hypotension Concern',
    conditionBn: 'হৃৎস্পন্দনের অস্বাভাবিকতা (অ্যারিদমিয়া) বা রক্তচাপ হ্রাস',
    specialist: 'Cardiologist',
    specialistBn: 'কার্ডিওলজিস্ট (হৃদরোগ বিশেষজ্ঞ)',
    severity: 'moderate',
    confidenceBase: 85,
    description: 'Fluttering heartbeat sensation combined with lightheadedness suggests potential rhythm abnormalities or orthostatic pressure shifts.',
    tips: [
      'Sit or lie down immediately when feeling lightheaded.',
      'Avoid sudden standing or heavy physical exertion.',
      'Limit intake of strong caffeine, energy drinks, and tobacco.',
      'Schedule a 24-hour Holter monitor or resting ECG.'
    ],
    active: true
  }
];

export const INITIAL_HOSPITALS = [
  {
    id: 'hosp-1',
    name: 'Square Hospitals Ltd.',
    address: '18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath',
    city: 'Dhaka',
    location: { lat: 23.7533, lng: 90.3817 },
    specialties: ['Cardiologist', 'Neurologist', 'General Physician', 'Gastroenterologist', 'Pulmonologist', 'Orthopedic / Rheumatologist', 'Dermatologist'],
    contact: '+880 2 8159457',
    emergencyContact: '+880 1713-377773',
    rating: 4.8,
    totalBeds: 400,
    ambulanceAvailable: true,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'hosp-2',
    name: 'Evercare Hospital Dhaka (Apollo)',
    address: 'Plot 81, Block E, Bashundhara R/A',
    city: 'Dhaka',
    location: { lat: 23.8103, lng: 90.4312 },
    specialties: ['Cardiologist', 'Neurologist', 'ENT Specialist', 'Orthopedic / Rheumatologist', 'Dermatologist', 'Pulmonologist'],
    contact: '+880 2 8431661',
    emergencyContact: '10678',
    rating: 4.9,
    totalBeds: 450,
    ambulanceAvailable: true,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'hosp-3',
    name: 'United Hospital Limited',
    address: 'Plot 15, Road 71, Gulshan-2',
    city: 'Dhaka',
    location: { lat: 23.7978, lng: 90.4143 },
    specialties: ['Cardiologist', 'General Physician', 'Neurologist', 'Gastroenterologist', 'ENT Specialist'],
    contact: '+880 2 8836444',
    emergencyContact: '10666',
    rating: 4.7,
    totalBeds: 500,
    ambulanceAvailable: true,
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'hosp-4',
    name: 'Labaid Specialized Hospital',
    address: 'House 06, Road 04, Dhanmondi',
    city: 'Dhaka',
    location: { lat: 23.7423, lng: 90.3828 },
    specialties: ['Cardiologist', 'Gastroenterologist', 'Orthopedic / Rheumatologist', 'General Physician'],
    contact: '+880 2 9676356',
    emergencyContact: '10606',
    rating: 4.6,
    totalBeds: 350,
    ambulanceAvailable: true,
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'hosp-5',
    name: 'Dhaka Medical College Hospital',
    address: 'Secretariat Road, Ramna',
    city: 'Dhaka',
    location: { lat: 23.7258, lng: 90.3976 },
    specialties: ['General Physician', 'Cardiologist', 'Neurologist', 'Pulmonologist', 'Orthopedic / Rheumatologist', 'Dermatologist', 'ENT Specialist', 'Gastroenterologist'],
    contact: '+880 2 55165088',
    emergencyContact: '+880 2 9661051',
    rating: 4.5,
    totalBeds: 2300,
    ambulanceAvailable: true,
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'hosp-6',
    name: 'National Institute of Cardiovascular Diseases (NICVD)',
    address: 'Sher-e-Bangla Nagar',
    city: 'Dhaka',
    location: { lat: 23.7712, lng: 90.3701 },
    specialties: ['Cardiologist'],
    contact: '+880 2 9122560',
    emergencyContact: '+880 2 9122561',
    rating: 4.8,
    totalBeds: 800,
    ambulanceAvailable: true,
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80'
  }
];

export const INITIAL_DOCTORS = [
  {
    id: 'doc-1',
    role: 'doctor',
    name: 'Prof. Dr. Mohammad Shamsuzzaman',
    email: 'dr.shams@squarehospital.com',
    phone: '+880 1711-450921',
    isVerified: true,
    bmdcRegNumber: 'BMDC-A-12490',
    language: 'en',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    specialty: 'Cardiologist',
    experienceYears: 18,
    hospitalId: 'hosp-1',
    hospitalName: 'Square Hospitals Ltd.',
    qualifications: 'MBBS, FCPS (Medicine), MD (Cardiology), FACC (USA)',
    bio: 'Senior Consultant Interventional Cardiologist specializing in acute coronary syndromes, echocardiography, and hypertension management.',
    consultationFee: 1500,
    rating: 4.9,
    ratingCount: 142,
    availability: [
      { day: 'Mon', slots: ['10:00 AM', '11:00 AM', '04:00 PM', '05:30 PM'] },
      { day: 'Wed', slots: ['10:00 AM', '11:30 AM', '03:00 PM', '04:30 PM'] },
      { day: 'Sat', slots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:00 PM'] },
    ],
    createdAt: '2026-01-10T10:00:00.000Z'
  },
  {
    id: 'doc-2',
    role: 'doctor',
    name: 'Dr. Nusrat Jahan Chowdhury',
    email: 'dr.nusrat@evercarebd.com',
    phone: '+880 1819-234891',
    isVerified: true,
    bmdcRegNumber: 'BMDC-A-21844',
    language: 'en',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    specialty: 'Neurologist',
    experienceYears: 14,
    hospitalId: 'hosp-2',
    hospitalName: 'Evercare Hospital Dhaka',
    qualifications: 'MBBS, MD (Neurology), Fellow Royal College of Physicians (Edinburgh)',
    bio: 'Lead Neurologist dedicated to migraine management, stroke prevention, neuropathy, and neuro-visual disorders.',
    consultationFee: 1600,
    rating: 4.8,
    ratingCount: 98,
    availability: [
      { day: 'Sun', slots: ['11:00 AM', '12:00 PM', '05:00 PM', '06:00 PM'] },
      { day: 'Tue', slots: ['10:00 AM', '11:00 AM', '04:00 PM', '05:00 PM'] },
      { day: 'Thu', slots: ['02:00 PM', '03:30 PM', '06:00 PM'] },
    ],
    createdAt: '2026-01-15T10:00:00.000Z'
  },
  {
    id: 'doc-3',
    role: 'doctor',
    name: 'Dr. Tahmidur Rahman',
    email: 'dr.tahmid@unitedhospital.com',
    phone: '+880 1912-789012',
    isVerified: true,
    bmdcRegNumber: 'BMDC-A-33921',
    language: 'en',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    specialty: 'General Physician',
    experienceYears: 12,
    hospitalId: 'hosp-3',
    hospitalName: 'United Hospital Limited',
    qualifications: 'MBBS, FCPS (Internal Medicine), MRCGP (UK)',
    bio: 'Comprehensive internal medicine specialist addressing acute infections, flu, metabolic management, and preventative health.',
    consultationFee: 1200,
    rating: 4.9,
    ratingCount: 215,
    availability: [
      { day: 'Sun', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '03:00 PM'] },
      { day: 'Mon', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '03:00 PM'] },
      { day: 'Wed', slots: ['09:00 AM', '10:00 AM', '02:00 PM', '04:00 PM'] },
    ],
    createdAt: '2026-01-20T10:00:00.000Z'
  },
  {
    id: 'doc-4',
    role: 'doctor',
    name: 'Dr. Sharmin Akter',
    email: 'dr.sharmin@labaid.com',
    phone: '+880 1715-998822',
    isVerified: true,
    bmdcRegNumber: 'BMDC-A-44812',
    language: 'en',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    specialty: 'Dermatologist',
    experienceYears: 10,
    hospitalId: 'hosp-4',
    hospitalName: 'Labaid Specialized Hospital',
    qualifications: 'MBBS, DDV (Dermatology & Venereology), FCPS',
    bio: 'Consultant dermatologist focused on inflammatory skin disorders, contact dermatitis, eczema, and allergy patch testing.',
    consultationFee: 1300,
    rating: 4.7,
    ratingCount: 86,
    availability: [
      { day: 'Mon', slots: ['04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'] },
      { day: 'Tue', slots: ['04:00 PM', '05:00 PM', '06:00 PM'] },
      { day: 'Thu', slots: ['03:00 PM', '04:00 PM', '05:30 PM'] },
    ],
    createdAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'doc-5',
    role: 'doctor',
    name: 'Prof. Dr. Ashraful Hoque',
    email: 'dr.ashraf@squarehospital.com',
    phone: '+880 1817-665544',
    isVerified: true,
    bmdcRegNumber: 'BMDC-A-55903',
    language: 'en',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    specialty: 'Gastroenterologist',
    experienceYears: 20,
    hospitalId: 'hosp-1',
    hospitalName: 'Square Hospitals Ltd.',
    qualifications: 'MBBS, FCPS, MD (Gastroenterology), FACG',
    bio: 'Senior consultant specializing in peptic ulcer disease, GERD, endoscopic interventions, and irritable bowel disorders.',
    consultationFee: 1800,
    rating: 4.9,
    ratingCount: 167,
    availability: [
      { day: 'Sun', slots: ['05:00 PM', '06:00 PM', '07:00 PM'] },
      { day: 'Tue', slots: ['05:00 PM', '06:00 PM', '07:00 PM'] },
      { day: 'Thu', slots: ['05:00 PM', '06:00 PM', '07:00 PM'] },
    ],
    createdAt: '2026-02-05T10:00:00.000Z'
  },
  {
    id: 'doc-6',
    role: 'doctor',
    name: 'Dr. Farhana Yasmin',
    email: 'dr.farhana@evercarebd.com',
    phone: '+880 1712-334455',
    isVerified: false,
    bmdcRegNumber: 'BMDC-A-77391',
    language: 'en',
    avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&q=80',
    specialty: 'Pulmonologist',
    experienceYears: 11,
    hospitalId: 'hosp-2',
    hospitalName: 'Evercare Hospital Dhaka',
    qualifications: 'MBBS, DTCD, MD (Chest Diseases & Pulmonology)',
    bio: 'Specialist in bronchial asthma, COPD, chronic cough, and allergy-induced bronchospasm.',
    consultationFee: 1400,
    rating: 4.8,
    ratingCount: 79,
    availability: [
      { day: 'Mon', slots: ['10:00 AM', '11:30 AM', '03:00 PM'] },
      { day: 'Wed', slots: ['10:00 AM', '11:30 AM', '03:00 PM'] },
      { day: 'Sat', slots: ['04:00 PM', '05:30 PM', '07:00 PM'] },
    ],
    createdAt: '2026-02-10T10:00:00.000Z'
  },
  {
    id: 'doc-7',
    role: 'doctor',
    name: 'Dr. Tanvir Ahmed',
    email: 'dr.tanvir@dmch.gov.bd',
    phone: '+880 1914-112233',
    isVerified: true,
    bmdcRegNumber: 'BMDC-A-88219',
    language: 'en',
    avatar: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&w=400&q=80',
    specialty: 'Orthopedic / Rheumatologist',
    experienceYears: 15,
    hospitalId: 'hosp-5',
    hospitalName: 'Dhaka Medical College Hospital',
    qualifications: 'MBBS, MS (Orthopedics), Fellow in Joint Replacement (Singapore)',
    bio: 'Expert in arthritis, joint degeneration, spinal back pain, and musculoskeletal rehabilitation.',
    consultationFee: 1200,
    rating: 4.7,
    ratingCount: 112,
    availability: [
      { day: 'Sun', slots: ['02:00 PM', '03:30 PM', '05:00 PM'] },
      { day: 'Wed', slots: ['02:00 PM', '03:30 PM', '05:00 PM'] },
      { day: 'Fri', slots: ['09:00 AM', '10:30 AM', '12:00 PM'] },
    ],
    createdAt: '2026-02-12T10:00:00.000Z'
  },
  {
    id: 'doc-8',
    role: 'doctor',
    name: 'Dr. Sayeedul Islam Khan',
    email: 'dr.sayeed@unitedhospital.com',
    phone: '+880 1718-776655',
    isVerified: true,
    bmdcRegNumber: 'BMDC-A-91024',
    language: 'en',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80',
    specialty: 'ENT Specialist',
    experienceYears: 13,
    hospitalId: 'hosp-3',
    hospitalName: 'United Hospital Limited',
    qualifications: 'MBBS, DLO, FCPS (Otolaryngology & Head-Neck Surgery)',
    bio: 'Dedicated ENT consultant addressing ear infections, hearing loss, sinus congestion, and throat ailments.',
    consultationFee: 1400,
    rating: 4.8,
    ratingCount: 94,
    availability: [
      { day: 'Mon', slots: ['03:00 PM', '04:30 PM', '06:00 PM'] },
      { day: 'Wed', slots: ['03:00 PM', '04:30 PM', '06:00 PM'] },
      { day: 'Sat', slots: ['10:00 AM', '11:30 AM', '01:00 PM'] },
    ],
    createdAt: '2026-02-15T10:00:00.000Z'
  }
];

export const INITIAL_PATIENT = {
  id: 'pat-1',
  role: 'patient',
  name: 'Sajidul Islam',
  email: 'sajid@mediconnect.health',
  phone: '+880 1798-123456',
  isVerified: true,
  language: 'en',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  medicalHistory: ['Mild Seasonal Asthma', 'Penicillin Allergy'],
  allergies: ['Penicillin', 'Dust / Pollen'],
  age: 26,
  gender: 'male',
  bloodGroup: 'B+',
  emergencyContact: {
    name: 'Tashir Mahi',
    phone: '+880 1711-223344',
    relation: 'Brother'
  },
  location: {
    lat: 23.7508,
    lng: 90.3938,
    address: 'Dhanmondi, Dhaka 1205'
  },
  createdAt: '2026-01-01T08:00:00.000Z'
};

export const INITIAL_REMINDERS = [
  {
    id: 'rem-1',
    patientId: 'pat-1',
    medicineName: 'Amoxicillin + Clavulanic Acid (Augmentin)',
    dosage: '625 mg (1 Tablet)',
    instruction: 'Take after a meal with a full glass of water',
    times: ['08:00', '20:00'],
    frequency: 'daily',
    startDate: '2026-09-01',
    endDate: '2026-09-08',
    status: 'active',
    color: '#0D6E6E',
    logs: [
      { id: 'log-1', scheduledAt: '2026-09-04T08:00:00.000Z', state: 'taken', actedAt: '2026-09-04T08:05:00.000Z' },
      { id: 'log-2', scheduledAt: '2026-09-03T20:00:00.000Z', state: 'taken', actedAt: '2026-09-03T20:10:00.000Z' },
      { id: 'log-3', scheduledAt: '2026-09-03T08:00:00.000Z', state: 'taken', actedAt: '2026-09-03T08:02:00.000Z' },
      { id: 'log-4', scheduledAt: '2026-09-02T20:00:00.000Z', state: 'skipped', actedAt: '2026-09-02T21:00:00.000Z' },
      { id: 'log-5', scheduledAt: '2026-09-02T08:00:00.000Z', state: 'taken', actedAt: '2026-09-02T08:15:00.000Z' }
    ]
  },
  {
    id: 'rem-2',
    patientId: 'pat-1',
    medicineName: 'Salbutamol Inhaler (Ventolin)',
    dosage: '2 Puffs as needed',
    instruction: 'Inhale with spacer when wheezing occurs',
    times: ['14:00', '22:00'],
    frequency: 'daily',
    startDate: '2026-08-15',
    endDate: '2026-09-30',
    status: 'active',
    color: '#10b981',
    logs: [
      { id: 'log-6', scheduledAt: '2026-09-04T14:00:00.000Z', state: 'taken', actedAt: '2026-09-04T14:01:00.000Z' }
    ]
  },
  {
    id: 'rem-3',
    patientId: 'pat-1',
    medicineName: 'Vitamin D3 & Calcium',
    dosage: '1000 IU (1 Capsule)',
    instruction: 'Take in the morning with food',
    times: ['09:00'],
    frequency: 'daily',
    startDate: '2026-08-01',
    endDate: '2026-10-31',
    status: 'active',
    color: '#f59e0b',
    logs: [
      { id: 'log-7', scheduledAt: '2026-09-04T09:00:00.000Z', state: 'taken', actedAt: '2026-09-04T09:03:00.000Z' }
    ]
  }
];

export const INITIAL_REPORTS = [
  {
    id: 'rep-101',
    patientId: 'pat-1',
    patientName: 'Sajidul Islam',
    patientAge: 26,
    patientGender: 'Male',
    symptomCheckId: 'chk-1',
    symptoms: ['High Fever', 'Persistent Cough', 'Severe Fatigue'],
    condition: 'Flu / Viral Upper Respiratory Infection',
    specialist: 'General Physician',
    severity: 'low',
    confidence: 92,
    sharedWithDoctorIds: ['doc-3'],
    doctorNotes: [
      {
        id: 'note-1',
        doctorId: 'doc-3',
        doctorName: 'Dr. Tahmidur Rahman',
        doctorSpecialty: 'General Physician',
        diagnosis: 'Acute Viral Rhinitis with mild pharyngitis. Lungs clear on auscultation.',
        prescription: '1. Tab Paracetamol 500mg (1-1-1 for 3 days if fever > 100°F)\n2. Tab Fexofenadine 120mg (0-0-1 at night for 5 days)\n3. Steam inhalation twice daily',
        testsRecommended: ['CBC if fever persists beyond 5 days'],
        advice: 'Hydrate adequately. Rest for 48 hours. Report back if fever spikes above 102°F or shortness of breath develops.',
        createdAt: '2026-09-02T14:30:00.000Z'
      }
    ],
    createdAt: '2026-09-02T11:20:00.000Z'
  }
];
