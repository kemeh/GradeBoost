import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  AmbassadorProfile, 
  AmbassadorApplication, 
  AmbassadorGalleryItem, 
  AmbassadorStats 
} from '../types/ambassador';

const PROFILES_COLLECTION = 'ambassadorProfiles';
const APPLICATIONS_COLLECTION = 'ambassadorApplications';
const GALLERY_COLLECTION = 'ambassadorGallery';

// Seed Initial Default Profiles
export const INITIAL_AMBASSADOR_PROFILES: AmbassadorProfile[] = [
  {
    id: 'amb-1',
    name: 'Brenda Nchang',
    photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400',
    school: 'GBHS Buea Town',
    schoolLocation: 'Buea',
    region: 'South West Region',
    classLevel: 'Upper Sixth',
    level: 'gold',
    bio: 'Passionate STEM advocate helping Upper Sixth Science students master Physics & Further Maths for the GCE A-Level.',
    referralCode: 'EDU-AMB-BRENDA84',
    recruitedCount: 68,
    status: 'active',
    featured: true,
    subjects: ['Physics', 'Chemistry', 'Pure Maths', 'Further Maths'],
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'amb-2',
    name: 'Emmanuel Mbarga',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    school: 'Lycée Général Leclerc',
    schoolLocation: 'Yaoundé',
    region: 'Centre Region',
    classLevel: 'Upper Sixth',
    level: 'gold',
    bio: 'Class captain and peer tutor organizing weekend mock study marathons using Edulpha practical simulations.',
    referralCode: 'EDU-AMB-EMMA237',
    recruitedCount: 54,
    status: 'active',
    featured: true,
    subjects: ['Mathématiques', 'Physique-Chimie', 'SVT', 'Informatique'],
    createdAt: '2026-02-01T09:30:00Z'
  },
  {
    id: 'amb-3',
    name: 'Grace Enow',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    school: 'Sacred Heart College Bamenda',
    schoolLocation: 'Bamenda',
    region: 'North West Region',
    classLevel: 'Form 5',
    level: 'silver',
    bio: 'Empowering GCE O-Level candidates in Bamenda to improve their grades through daily quiz challenges on Edulpha.',
    referralCode: 'EDU-AMB-GRACE11',
    recruitedCount: 38,
    status: 'active',
    featured: true,
    subjects: ['Biology', 'Chemistry', 'English Language', 'Economics'],
    createdAt: '2026-02-15T14:20:00Z'
  },
  {
    id: 'amb-4',
    name: 'Franck Tchakounté',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    school: 'Lycée Joss Douala',
    schoolLocation: 'Douala',
    region: 'Littoral Region',
    classLevel: 'Lower Sixth',
    level: 'silver',
    bio: 'Technology enthusiast introducing digital study groups and past-paper revision tactics to my schoolmates.',
    referralCode: 'EDU-AMB-FRANCK05',
    recruitedCount: 29,
    status: 'active',
    featured: false,
    subjects: ['Informatique', 'Mathématiques', 'Anglais'],
    createdAt: '2026-03-01T11:00:00Z'
  },
  {
    id: 'amb-5',
    name: 'Amina Ousmanou',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    school: 'Lycée Bilingue de Garoua',
    schoolLocation: 'Garoua',
    region: 'North Region',
    classLevel: 'Form 4',
    level: 'bronze',
    bio: 'Lover of literature and languages, encouraging younger students to build strong study habits early.',
    referralCode: 'EDU-AMB-AMINA99',
    recruitedCount: 16,
    status: 'active',
    featured: false,
    subjects: ['Français', 'Literature', 'History', 'Geography'],
    createdAt: '2026-03-12T08:45:00Z'
  }
];

export const INITIAL_GALLERY_ITEMS: AmbassadorGalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Edulpha Digital Study Session at GBHS Buea Town',
    description: 'Student Ambassador Brenda leading a group revision session using tablet devices for A-Level Physics.',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
    category: 'study_session',
    school: 'GBHS Buea Town',
    date: '2026-03-10'
  },
  {
    id: 'gal-2',
    title: 'Edulpha Awareness Campaign in Yaoundé',
    description: 'Emmanuel presenting Edulpha interactive practical simulations to class representatives.',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800',
    category: 'presentation',
    school: 'Lycée Général Leclerc',
    date: '2026-02-28'
  },
  {
    id: 'gal-3',
    title: 'Bamenda Regional Student Leadership Workshop',
    description: 'Ambassadors collaborating on strategies for promoting GCE O-Level study circles.',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800',
    category: 'ambassador_event',
    school: 'Sacred Heart College Bamenda',
    date: '2026-02-18'
  },
  {
    id: 'gal-4',
    title: 'Peer Tutoring & Science Lab Practice in Douala',
    description: 'Students testing virtual chemistry experiments facilitated by Ambassador Franck.',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
    category: 'school_activity',
    school: 'Lycée Joss Douala',
    date: '2026-03-05'
  }
];

// Helper to get Profiles
export async function getAmbassadorProfiles(): Promise<AmbassadorProfile[]> {
  try {
    const snap = await getDocs(collection(db, PROFILES_COLLECTION));
    if (snap.empty) {
      return INITIAL_AMBASSADOR_PROFILES;
    }
    const profiles: AmbassadorProfile[] = [];
    snap.forEach((docSnap) => {
      profiles.push({ id: docSnap.id, ...docSnap.data() } as AmbassadorProfile);
    });
    return profiles;
  } catch (err) {
    console.warn('Using local fallback for ambassador profiles:', err);
    return INITIAL_AMBASSADOR_PROFILES;
  }
}

// Helper to submit application
export async function submitAmbassadorApplication(appData: Omit<AmbassadorApplication, 'id' | 'status' | 'submittedAt'>): Promise<string> {
  const newId = 'app-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  const fullApp: AmbassadorApplication = {
    ...appData,
    id: newId,
    status: 'pending',
    submittedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, APPLICATIONS_COLLECTION, newId), fullApp);
  } catch (err) {
    console.warn('Saved application locally / fallback mode:', err);
    // save to localStorage fallback for seamless demo experience
    const localApps = JSON.parse(localStorage.getItem('edulpha_ambassador_apps') || '[]');
    localApps.unshift(fullApp);
    localStorage.setItem('edulpha_ambassador_apps', JSON.stringify(localApps));
  }
  return newId;
}

// Helper to get applications (Admin)
export async function getAmbassadorApplications(): Promise<AmbassadorApplication[]> {
  try {
    const snap = await getDocs(collection(db, APPLICATIONS_COLLECTION));
    const list: AmbassadorApplication[] = [];
    snap.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as AmbassadorApplication);
    });

    const localApps = JSON.parse(localStorage.getItem('edulpha_ambassador_apps') || '[]');
    const combined = [...list];
    localApps.forEach((la: AmbassadorApplication) => {
      if (!combined.some(item => item.id === la.id)) {
        combined.push(la);
      }
    });

    if (combined.length === 0) {
      // Seed sample pending application
      return [
        {
          id: 'app-sample-1',
          fullName: 'Patrick Nkem',
          gender: 'male',
          dob: '2009-05-14',
          phone: '+237 675 44 33 22',
          whatsapp: '+237 675 44 33 22',
          email: 'patrick.nkem@student.edulpha.cm',
          location: 'Bamenda',
          schoolName: 'GBHS Bamenda',
          schoolLocation: 'Bamenda',
          region: 'North West Region',
          classLevel: 'Lower Sixth',
          subjects: ['Mathematics', 'Physics', 'Computer Science'],
          motivationWhy: 'I want to help my classmates transition to digital study resources and score higher grades in the GCE.',
          motivationIdeas: 'I will set up weekend study sessions and share my referral code during morning assembly.',
          skills: ['Leadership', 'Communication', 'Technology'],
          weeklyHours: '3-5 hours',
          agreedToTerms: true,
          status: 'pending',
          submittedAt: new Date().toISOString()
        }
      ];
    }
    return combined;
  } catch (err) {
    console.warn('Error fetching applications, returning localStorage/defaults:', err);
    return JSON.parse(localStorage.getItem('edulpha_ambassador_apps') || '[]');
  }
}

// Update Application Status & Optionally Create Profile
export async function updateApplicationStatus(
  appId: string, 
  status: 'approved' | 'rejected' | 'active' | 'suspended',
  notes?: string,
  assignedLevel: 'bronze' | 'silver' | 'gold' = 'bronze'
): Promise<void> {
  try {
    await updateDoc(doc(db, APPLICATIONS_COLLECTION, appId), {
      status,
      assignedLevel,
      notes: notes || '',
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Error updating application in Firestore, updating local storage:', err);
    const localApps = JSON.parse(localStorage.getItem('edulpha_ambassador_apps') || '[]');
    const idx = localApps.findIndex((a: AmbassadorApplication) => a.id === appId);
    if (idx !== -1) {
      localApps[idx].status = status;
      localApps[idx].assignedLevel = assignedLevel;
      if (notes) localApps[idx].notes = notes;
      localStorage.setItem('edulpha_ambassador_apps', JSON.stringify(localApps));
    }
  }

  // If approved/active, automatically generate a profile
  if (status === 'approved' || status === 'active') {
    const apps = await getAmbassadorApplications();
    const app = apps.find(a => a.id === appId);
    if (app) {
      const codeName = app.fullName.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
      const refCode = `EDU-AMB-${codeName}${Math.floor(10 + Math.random() * 90)}`;
      
      const newProfile: AmbassadorProfile = {
        id: 'amb-' + Date.now(),
        name: app.fullName,
        photo: app.gender === 'female' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' 
          : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
        school: app.schoolName,
        schoolLocation: app.schoolLocation,
        region: app.region,
        classLevel: app.classLevel,
        level: assignedLevel,
        bio: app.motivationWhy || 'Empowering classmates through digital study habits and Edulpha learning tools.',
        referralCode: refCode,
        recruitedCount: 0,
        status: 'active',
        featured: false,
        subjects: app.subjects || ['General Studies'],
        createdAt: new Date().toISOString()
      };

      await saveAmbassadorProfile(newProfile);
    }
  }
}

// Save or Update Ambassador Profile
export async function saveAmbassadorProfile(profile: AmbassadorProfile): Promise<void> {
  try {
    await setDoc(doc(db, PROFILES_COLLECTION, profile.id), profile, { merge: true });
  } catch (err) {
    console.warn('Saved profile to localStorage fallback:', err);
    const localProfs = JSON.parse(localStorage.getItem('edulpha_ambassador_profiles') || '[]');
    const idx = localProfs.findIndex((p: AmbassadorProfile) => p.id === profile.id);
    if (idx !== -1) {
      localProfs[idx] = profile;
    } else {
      localProfs.push(profile);
    }
    localStorage.setItem('edulpha_ambassador_profiles', JSON.stringify(localProfs));
  }
}

// Delete Ambassador Profile
export async function deleteAmbassadorProfile(profileId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, PROFILES_COLLECTION, profileId));
  } catch (err) {
    console.warn('Deleted from local storage fallback:', err);
  }
}

// Get Gallery Items
export async function getAmbassadorGallery(): Promise<AmbassadorGalleryItem[]> {
  try {
    const snap = await getDocs(collection(db, GALLERY_COLLECTION));
    if (snap.empty) return INITIAL_GALLERY_ITEMS;
    const list: AmbassadorGalleryItem[] = [];
    snap.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as AmbassadorGalleryItem);
    });
    return list;
  } catch (err) {
    return INITIAL_GALLERY_ITEMS;
  }
}

// Save Gallery Item
export async function saveAmbassadorGalleryItem(item: AmbassadorGalleryItem): Promise<void> {
  try {
    await setDoc(doc(db, GALLERY_COLLECTION, item.id), item, { merge: true });
  } catch (err) {
    console.warn('Failed saving gallery item to Firestore:', err);
  }
}

// Delete Gallery Item
export async function deleteAmbassadorGalleryItem(itemId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, GALLERY_COLLECTION, itemId));
  } catch (err) {
    console.warn('Failed deleting gallery item from Firestore:', err);
  }
}

// User Lookups
export async function getUserAmbassadorApplication(email?: string, name?: string): Promise<AmbassadorApplication | null> {
  if (!email && !name) return null;
  const cleanEmail = email?.toLowerCase().trim();
  const cleanName = name?.toLowerCase().trim();

  try {
    const apps = await getAmbassadorApplications();
    const match = apps.find(a => 
      (cleanEmail && a.email && a.email.toLowerCase().trim() === cleanEmail) ||
      (cleanName && a.fullName && a.fullName.toLowerCase().trim() === cleanName)
    );
    if (match) return match;
  } catch (err) {
    console.warn('Error fetching user ambassador application:', err);
  }
  return null;
}

export async function getUserAmbassadorProfile(email?: string, name?: string): Promise<AmbassadorProfile | null> {
  if (!email && !name) return null;
  const cleanName = name?.toLowerCase().trim();

  try {
    const profiles = await getAmbassadorProfiles();
    const match = profiles.find(p => 
      (cleanName && p.name && p.name.toLowerCase().trim() === cleanName)
    );
    if (match) return match;
  } catch (err) {
    console.warn('Error fetching user ambassador profile:', err);
  }
  return null;
}

