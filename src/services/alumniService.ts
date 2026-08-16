import { 
  collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { AlumniProfile, AlumniGalleryItem, AlumniApplication, AlumniStats } from '../types/alumni';

export const DEFAULT_ALUMNI_STATS: AlumniStats = {
  totalMembers: 75,
  partnerUniversities: 18,
  studentsMentored: 1250,
  impactRate: '98.5%'
};

export const DEFAULT_ALUMNI_PROFILES: AlumniProfile[] = [
  {
    id: 'prof-1',
    name: 'Dr. Vanessa Mbella',
    email: 'vanessa.mbella@alumni.edulpha.cm',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
    graduationYear: 2018,
    school: 'CCAST Bambili & Lycée Général Yaoundé',
    subSystem: 'General Education',
    currentRole: 'PhD Research Scientist',
    companyOrUniversity: 'Carnegie Mellon University Africa & AI Research Lab',
    specialization: 'Artificial Intelligence & Robotics',
    bio: 'Former GCE Advanced Level top scorer in Physics & Further Maths. Mentors 50+ Cameroonian high school students annually in STEM & AI.',
    badges: ['GCE Valedictorian', 'Lead STEM Mentor', 'Carnegie Fellow'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/vanessa-mbella-ai',
      twitter: 'https://twitter.com/vanessambella'
    },
    consentGranted: true,
    status: 'approved',
    featured: true,
    orderIndex: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prof-2',
    name: 'Emmanuel Nkem',
    email: 'emmanuel.nkem@google.com',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    graduationYear: 2019,
    school: 'Lycée Joss Douala',
    subSystem: 'Baccalauréat & French Sub-System',
    currentRole: 'Senior Cloud Engineer',
    companyOrUniversity: 'Google Cloud Africa (Accra Hub)',
    specialization: 'Distributed Systems & Cloud Architecture',
    bio: 'Passed Baccalauréat C with honors. Passionate about empowering technical and vocational students across Francophone and Anglophone Cameroon.',
    badges: ['Google Cloud Leader', 'Edulpha Tech Speaker', 'Bac C Laureate'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/emmanuel-nkem-cloud'
    },
    consentGranted: true,
    status: 'approved',
    featured: true,
    orderIndex: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prof-3',
    name: 'Brenda Taku',
    email: 'brenda@ecobuild.cm',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80',
    graduationYear: 2020,
    school: 'Government Technical High School (GTHS) Bamenda',
    subSystem: 'Technical & TVEE',
    currentRole: 'Founder & Managing Director',
    companyOrUniversity: 'EcoBuild Cameroon & TVEE Innovators Network',
    specialization: 'Civil Engineering & Sustainable Construction',
    bio: 'Top graduate in Building Construction TVEE Advanced Level. Championing women in technical fields and providing apprenticeships to TVEE students.',
    badges: ['TVEE Trailblazer', 'Green Tech Founder', 'GTHS Alumna Leader'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/brenda-taku-civil',
      website: 'https://ecobuild.cm'
    },
    consentGranted: true,
    status: 'approved',
    featured: true,
    orderIndex: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prof-4',
    name: 'Dr. Christian Fondungallah',
    email: 'christian.f@cuss-edu.cm',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80',
    graduationYear: 2021,
    school: 'Sacred Heart College Mankon',
    subSystem: 'General Education',
    currentRole: 'Resident Medical Officer',
    companyOrUniversity: 'Faculty of Medicine and Biomedical Sciences (CUSS) Yaoundé',
    specialization: 'Cardiology & Digital Health',
    bio: 'Achieved 5 A grades in GCE A-Level Biology, Chemistry, Physics. Leads the Edulpha Medical Aspirants Mentorship Program.',
    badges: ['CUSS Scholar', 'Medical Mentor of the Year'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/dr-christian-f'
    },
    consentGranted: true,
    status: 'approved',
    featured: false,
    orderIndex: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prof-5',
    name: 'Cynthia Ebot',
    email: 'ebot.cynthia@afdb.org',
    photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=500&auto=format&fit=crop&q=80',
    graduationYear: 2020,
    school: 'Bilingual Grammar School Buea',
    subSystem: 'Commercial Education',
    currentRole: 'Financial Analyst',
    companyOrUniversity: 'African Development Bank (AfDB)',
    specialization: 'Corporate Finance & Public Investment',
    bio: 'Specialized in Accounting & Economics. Conducts quarterly online workshops for Commercial & Accounting students across Africa.',
    badges: ['AfDB Analyst', 'Financial Literacy Advocate'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/cynthia-ebot'
    },
    consentGranted: true,
    status: 'approved',
    featured: false,
    orderIndex: 5,
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_ALUMNI_GALLERY: AlumniGalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Edulpha Alumni Leadership Summit 2025',
    description: 'Over 120 alumni leaders gathered at the Hilton Hotel Yaoundé to discuss mentorship frameworks for GCE & Baccalauréat candidates.',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    category: 'Summit',
    displayOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'gal-2',
    title: 'Mentorship Bootcamp at GTHS Douala',
    description: 'Alumni engineers and TVEE specialists hosting hands-on electrical and civil engineering workshops for technical students.',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
    category: 'Workshops',
    displayOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'gal-3',
    title: 'GCE Advanced Level Excellence Awards',
    description: 'Celebrating top Edulpha scholars admitted to world-class university engineering and medical faculties.',
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80',
    category: 'Graduation',
    displayOrder: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'gal-4',
    title: 'STEM & AI Career Orientation Seminar',
    description: 'Global virtual webinar linking Cameroonian high school students with international alumni researchers at Google and CMU.',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80',
    category: 'Mentorship',
    displayOrder: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: 'gal-5',
    title: 'Alumni Book & Tablet Donation Drive',
    description: 'Distributing offline learning tablets loaded with Edulpha past papers to underprivileged rural schools in Southwest Cameroon.',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80',
    category: 'Community',
    displayOrder: 5,
    createdAt: new Date().toISOString()
  }
];

export class AlumniService {
  // --- STATS ---
  static async getAlumniStats(): Promise<AlumniStats> {
    try {
      const docRef = doc(db, 'system_settings', 'alumni_stats');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as AlumniStats;
      }
    } catch (err) {
      console.warn('Using default alumni stats:', err);
    }
    return DEFAULT_ALUMNI_STATS;
  }

  static async saveAlumniStats(stats: AlumniStats): Promise<void> {
    const docRef = doc(db, 'system_settings', 'alumni_stats');
    await setDoc(docRef, {
      ...stats,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  // --- PUBLIC PROFILES ---
  static async getPublicAlumniProfiles(): Promise<AlumniProfile[]> {
    try {
      const q = query(
        collection(db, 'alumniProfiles'),
        where('status', '==', 'approved'),
        where('consentGranted', '==', true)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as AlumniProfile));
        return list.sort((a, b) => (a.orderIndex || 99) - (b.orderIndex || 99));
      }
    } catch (err) {
      console.warn('Falling back to default alumni profiles:', err);
    }
    return DEFAULT_ALUMNI_PROFILES;
  }

  // --- ADMIN PROFILES ---
  static async getAllAlumniProfiles(): Promise<AlumniProfile[]> {
    try {
      const q = query(collection(db, 'alumniProfiles'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as AlumniProfile));
      }
    } catch (err) {
      console.warn('Falling back to default alumni profiles for admin:', err);
    }
    return DEFAULT_ALUMNI_PROFILES;
  }

  static async createAlumniProfile(profile: Omit<AlumniProfile, 'id' | 'createdAt'>): Promise<string> {
    const colRef = collection(db, 'alumniProfiles');
    const docRef = await addDoc(colRef, {
      ...profile,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  }

  static async updateAlumniProfile(id: string, updates: Partial<AlumniProfile>): Promise<void> {
    const docRef = doc(db, 'alumniProfiles', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  static async deleteAlumniProfile(id: string): Promise<void> {
    const docRef = doc(db, 'alumniProfiles', id);
    await deleteDoc(docRef);
  }

  // --- GALLERY ---
  static async getAlumniGallery(): Promise<AlumniGalleryItem[]> {
    try {
      const q = query(collection(db, 'alumniGallery'), orderBy('displayOrder', 'asc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as AlumniGalleryItem));
      }
    } catch (err) {
      console.warn('Falling back to default alumni gallery:', err);
    }
    return DEFAULT_ALUMNI_GALLERY;
  }

  static async addGalleryItem(item: Omit<AlumniGalleryItem, 'id' | 'createdAt'>): Promise<string> {
    const colRef = collection(db, 'alumniGallery');
    const docRef = await addDoc(colRef, {
      ...item,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  }

  static async updateGalleryItem(id: string, updates: Partial<AlumniGalleryItem>): Promise<void> {
    const docRef = doc(db, 'alumniGallery', id);
    await updateDoc(docRef, updates);
  }

  static async deleteGalleryItem(id: string): Promise<void> {
    const docRef = doc(db, 'alumniGallery', id);
    await deleteDoc(docRef);
  }

  // --- APPLICATIONS ---
  static async submitApplication(application: Omit<AlumniApplication, 'id' | 'status' | 'createdAt'>): Promise<string> {
    const colRef = collection(db, 'alumniApplications');
    const docRef = await addDoc(colRef, {
      ...application,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  }

  static async getApplications(): Promise<AlumniApplication[]> {
    try {
      const q = query(collection(db, 'alumniApplications'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as AlumniApplication));
      }
    } catch (err) {
      console.warn('Error fetching alumni applications:', err);
    }
    return [];
  }

  static async updateApplicationStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    const docRef = doc(db, 'alumniApplications', id);
    await updateDoc(docRef, {
      status,
      reviewedAt: new Date().toISOString()
    });
  }

  static async convertApplicationToProfile(app: AlumniApplication): Promise<string> {
    // Approve application first
    await this.updateApplicationStatus(app.id, 'approved');

    // Create public alumni profile
    const profileId = await this.createAlumniProfile({
      name: app.fullName,
      email: app.email,
      phone: app.phone,
      photoUrl: app.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      graduationYear: app.graduationYear,
      school: app.school,
      subSystem: (app.subSystem as any) || 'General Education',
      currentRole: app.currentRole,
      companyOrUniversity: app.companyOrUniversity,
      specialization: app.specialization,
      bio: app.motivation || 'Dedicated Edulpha Alumni Leader inspiring the next generation.',
      badges: ['Verified Alumni Leader', 'Mentorship Contributor'],
      socialLinks: app.linkedin ? { linkedin: app.linkedin } : {},
      consentGranted: app.consentGranted,
      status: 'approved',
      featured: false,
      orderIndex: 10
    });

    return profileId;
  }

  static async deleteApplication(id: string): Promise<void> {
    const docRef = doc(db, 'alumniApplications', id);
    await deleteDoc(docRef);
  }

  // --- USER LOOKUPS ---
  static async getUserAlumniApplication(email: string): Promise<AlumniApplication | null> {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();
    try {
      const q = query(
        collection(db, 'alumniApplications'),
        where('email', '==', cleanEmail)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as AlumniApplication;
      }

      // Also search case-insensitive / local storage fallback
      const allApps = await this.getApplications();
      const match = allApps.find(a => a.email && a.email.toLowerCase().trim() === cleanEmail);
      if (match) return match;
    } catch (err) {
      console.warn('Error finding user alumni application:', err);
    }
    return null;
  }

  static async getUserAlumniProfile(email: string): Promise<AlumniProfile | null> {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();
    try {
      const q = query(
        collection(db, 'alumniProfiles'),
        where('email', '==', cleanEmail)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as AlumniProfile;
      }

      const allProfiles = await this.getAllAlumniProfiles();
      const match = allProfiles.find(p => p.email && p.email.toLowerCase().trim() === cleanEmail);
      if (match) return match;
    } catch (err) {
      console.warn('Error finding user alumni profile:', err);
    }
    return null;
  }
}
