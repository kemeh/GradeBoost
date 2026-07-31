import { 
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp, setDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  ForumCategory, ForumDiscussion, ForumReply, ForumLike, 
  ForumBookmark, ForumReport, ForumNotification, ForumAnalytics 
} from '../types';

// Storage keys for local caching/fallback
const STORAGE_DISCUSSIONS = 'gb60_forum_discussions_v1';
const STORAGE_CATEGORIES = 'gb60_forum_categories_v1';
const STORAGE_REPLIES = 'gb60_forum_replies_v1';
const STORAGE_LIKES = 'gb60_forum_likes_v1';
const STORAGE_BOOKMARKS = 'gb60_forum_bookmarks_v1';
const STORAGE_NOTIFICATIONS = 'gb60_forum_notifications_v1';
const STORAGE_REPORTS = 'gb60_forum_reports_v1';

// Initial Categories Seed
export const INITIAL_FORUM_CATEGORIES: ForumCategory[] = [
  {
    id: 'cat-1',
    name: 'Computer Science - Algorithms & Coding',
    nameFr: 'Informatique - Algorithmes & Programmation',
    slug: 'cs-algorithms',
    description: 'Algorithm design, pseudo-code, Python, C++, binary search, sorting, and complexity analysis.',
    descriptionFr: 'Conception d\'algorithmes, pseudo-code, Python, C++, recherche binaire et complexité.',
    curriculum: 'Both',
    level: 'Advanced Level',
    subject: 'Computer Science',
    department: 'Science & Tech',
    icon: 'Code2',
    color: 'bg-emerald-500',
    orderIndex: 1,
    discussionCount: 12
  },
  {
    id: 'cat-2',
    name: 'Mathematics & Analysis',
    nameFr: 'Mathématiques & Analyse',
    slug: 'mathematics',
    description: 'Calculus, functions, algebra, matrices, integration, probability and differential equations.',
    descriptionFr: 'Calcul différentiel, fonctions, algèbre, matrices, intégration et probabilités.',
    curriculum: 'Both',
    level: 'Terminale',
    subject: 'Mathématiques',
    department: 'Science & Tech',
    icon: 'Calculator',
    color: 'bg-blue-500',
    orderIndex: 2,
    discussionCount: 8
  },
  {
    id: 'cat-3',
    name: 'Physics & Mechanics',
    nameFr: 'Physique & Mécanique',
    slug: 'physics',
    description: 'Newtonian mechanics, electromagnetism, wave optics, electronics, and quantum physics.',
    descriptionFr: 'Mécanique newtonienne, électromagnétisme, optique ondulatoire et électronique.',
    curriculum: 'Both',
    level: 'Advanced Level',
    subject: 'Physics',
    department: 'Science & Tech',
    icon: 'Zap',
    color: 'bg-purple-500',
    orderIndex: 3,
    discussionCount: 6
  },
  {
    id: 'cat-4',
    name: 'ICT, Networking & Databases',
    nameFr: 'TIC, Réseaux & Bases de données',
    slug: 'ict-networking',
    description: 'TCP/IP, OSI model, SQL queries, database normalization, cybersecurity, and hardware.',
    descriptionFr: 'TCP/IP, modèle OSI, requêtes SQL, normalisation de SGBD et cybersécurité.',
    curriculum: 'Both',
    level: 'Ordinary Level',
    subject: 'ICT',
    department: 'Science & Tech',
    icon: 'Server',
    color: 'bg-amber-500',
    orderIndex: 4,
    discussionCount: 9
  },
  {
    id: 'cat-5',
    name: 'Official Teacher Revision Threads',
    nameFr: 'Fils de Révision Officiels Enseignants',
    slug: 'teacher-threads',
    description: 'Verified exam tips, marking scheme breakdowns, high-yield topics, and official announcements.',
    descriptionFr: 'Conseils d\'examen vérifiés, barèmes de correction et annonces officielles.',
    curriculum: 'Both',
    icon: 'Award',
    color: 'bg-indigo-600',
    orderIndex: 5,
    discussionCount: 5
  }
];

// Initial Seed Discussions
export const INITIAL_FORUM_DISCUSSIONS: ForumDiscussion[] = [
  {
    id: 'disc-1',
    title: 'Explain Binary Search vs Linear Search Complexity with Code Examples',
    description: 'Need help understanding why Binary Search is O(log n) while Linear Search is O(n). How to write it in Python?',
    content: `Hello fellow GradeBoost students! 👋

Can someone explain why Binary Search achieves **O(log n)** time complexity compared to **O(n)** for Linear Search? 

Also, when writing GCE A-Level Computer Science Paper 2 algorithms, do we need to check if the array is pre-sorted first? Here is my current Python draft:

\`\`\`python
def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
\`\`\`

Any guidance from teachers or fellow students would be greatly appreciated!`,
    curriculum: 'English',
    educationLevel: 'Advanced Level',
    department: 'Science & Tech',
    subject: 'Computer Science',
    paper: 'Paper 2',
    topic: 'Algorithms & Data Structures',
    type: 'question',
    tags: ['Algorithms', 'Python', 'Paper 2', 'Complexity'],
    language: 'en',
    authorId: 'user-student-1',
    authorName: 'Amina Njang',
    authorRole: 'student',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    isTeacherVerified: true,
    hasVerifiedAnswer: true,
    acceptedReplyId: 'reply-1',
    isPinned: true,
    isLocked: false,
    likeCount: 24,
    replyCount: 3,
    viewCount: 142,
    bookmarkCount: 9,
    codeSnippet: {
      language: 'python',
      code: `def binary_search(arr, target):\n    low = 0\n    high = len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1`
    },
    mathFormula: 'T(n) = T(n/2) + O(1) \\implies T(n) = O(\\log_2 n)',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastActivityAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'disc-2',
    title: 'Comment résoudre une équation différentielle du second ordre en Mathématiques ?',
    description: 'Explication détaillée de la méthode d\'identification de la solution générale et de la solution particulière pour le Baccalauréat.',
    content: `Bonjour à tous les élèves de Terminale Scientifique! 🇫🇷

J'ai une difficulté sur le problème suivant issu des épreuves du Baccalauréat:

$$\\frac{d^2y}{dx^2} + 4\\frac{dy}{dx} + 4y = e^{-2x}$$

Quelle est la démarche exacte pour déterminer l'équation caractéristique $\\r^2 + 4r + 4 = 0$ et déduire la solution générale $y_h(x)$ ?

Merci pour votre aide précieuse!`,
    curriculum: 'French',
    educationLevel: 'Terminale',
    department: 'Science & Tech',
    subject: 'Mathématiques',
    paper: 'Épreuve Obligatoire',
    topic: 'Équations Différentielles',
    type: 'question',
    tags: ['Mathématiques', 'Analyse', 'Terminale', 'Équations'],
    language: 'fr',
    authorId: 'user-student-2',
    authorName: 'Jean-Paul Mbida',
    authorRole: 'student',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    isTeacherVerified: true,
    hasVerifiedAnswer: true,
    acceptedReplyId: 'reply-2',
    isPinned: false,
    isLocked: false,
    likeCount: 18,
    replyCount: 2,
    viewCount: 98,
    bookmarkCount: 6,
    mathFormula: '\\frac{d^2y}{dx^2} + 4\\frac{dy}{dx} + 4y = e^{-2x}',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    lastActivityAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'disc-3',
    title: 'OSI 7-Layer Model vs TCP/IP 4-Layer Model Comparison Matrix',
    description: 'Summary table and memory mnemonics for GCE O-Level & A-Level ICT Networking questions.',
    content: `Hi everyone! 🌐

Here is a breakdown for remembering the **7 Layers of OSI** vs **4 Layers of TCP/IP**:

### OSI Model (All People Seem To Need Data Processing):
1. **Application**: HTTP, FTP, SMTP, DNS
2. **Presentation**: Data formatting, Encryption (SSL/TLS)
3. **Session**: Dialog control, RPC
4. **Transport**: TCP, UDP (Port numbers)
5. **Network**: IP, ICMP, Routers (IP Addresses)
6. **Data Link**: Ethernet, MAC Addresses, Switches
7. **Physical**: Cables, Hubs, Signal Bitstream

### TCP/IP Model:
1. **Application Layer** (combines OSI 5, 6, 7)
2. **Transport Layer** (TCP/UDP)
3. **Internet Layer** (IP Routing)
4. **Network Access / Link Layer** (Physical + Data Link)

Hope this revision summary helps everyone preparing for Paper 1!`,
    curriculum: 'English',
    educationLevel: 'Ordinary Level',
    department: 'Science & Tech',
    subject: 'ICT',
    paper: 'Paper 1',
    topic: 'Networking & Telecommunications',
    type: 'revision_tips',
    tags: ['Networking', 'OSI', 'TCP/IP', 'ICT', 'Revision'],
    language: 'en',
    authorId: 'user-teacher-1',
    authorName: 'Mr. Fomba Joseph (HOD CompSci)',
    authorRole: 'teacher',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    isTeacherVerified: true,
    hasVerifiedAnswer: false,
    isPinned: true,
    isLocked: false,
    likeCount: 45,
    replyCount: 4,
    viewCount: 230,
    bookmarkCount: 19,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastActivityAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

// Initial Replies Seed
export const INITIAL_FORUM_REPLIES: ForumReply[] = [
  {
    id: 'reply-1',
    discussionId: 'disc-1',
    content: `Great question, Amina! 🎓

Here is the exact breakdown for **GCE A-Level Computer Science**:

1. **Pre-condition**: Yes, Binary Search **strictly requires** the list to be sorted in ascending or descending order. If the list is unsorted, Linear Search O(n) must be used instead.
2. **Mathematical Complexity**: Each step divides the search space in half ($n, n/2, n/4, \\dots, 1$). Thus after $k$ steps:
$$\\frac{n}{2^k} = 1 \\implies 2^k = n \\implies k = \\log_2 n$$

Your Python implementation is 100% accurate and clean! Well done.`,
    authorId: 'user-teacher-1',
    authorName: 'Mr. Fomba Joseph (HOD CompSci)',
    authorRole: 'teacher',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    isTeacherVerified: true,
    isAcceptedAnswer: true,
    isPinned: true,
    likeCount: 16,
    mathFormula: '2^k = n \\implies k = \\log_2 n',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'reply-2',
    discussionId: 'disc-2',
    content: `Excellente question Jean-Paul! 📐

L'équation caractéristique est $r^2 + 4r + 4 = (r + 2)^2 = 0$.
Elle possède une **racine double** $r = -2$.

La solution homogène s'écrit donc:
$$y_h(x) = (Ax + B)e^{-2x}$$

Comme le second membre est $e^{-2x}$ et $-2$ est racine double, la solution particulière est de la forme:
$$y_p(x) = C x^2 e^{-2x}$$

En dérivant et en remplaçant dans l'équation, on trouve $C = 1/2$.
Donc $y(x) = (Ax + B + \\frac{1}{2}x^2)e^{-2x}$.`,
    authorId: 'user-teacher-2',
    authorName: 'Mme. Mbida Carine (Prof de Maths)',
    authorRole: 'teacher',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    isTeacherVerified: true,
    isAcceptedAnswer: true,
    isPinned: true,
    likeCount: 12,
    mathFormula: 'y(x) = (Ax + B + \\frac{1}{2}x^2)e^{-2x}',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

// Local Storage Helper Functions
function getLocalData<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalData<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
}

// ===============================================================
// CATEGORY OPERATIONS
// ===============================================================

export const fetchForumCategories = async (): Promise<ForumCategory[]> => {
  try {
    const snap = await getDocs(collection(db, 'forum_categories'));
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ForumCategory));
    }
  } catch (err) {
    console.warn('Firestore categories fetch fallback to local:', err);
  }
  return getLocalData<ForumCategory[]>(STORAGE_CATEGORIES, INITIAL_FORUM_CATEGORIES);
};

export const createForumCategory = async (category: Omit<ForumCategory, 'id'>): Promise<string> => {
  const newId = `cat-${Date.now()}`;
  const newCategory: ForumCategory = { ...category, id: newId };
  try {
    await setDoc(doc(db, 'forum_categories', newId), {
      ...category,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('Firestore category create fallback to local:', err);
  }
  const current = getLocalData<ForumCategory[]>(STORAGE_CATEGORIES, INITIAL_FORUM_CATEGORIES);
  setLocalData(STORAGE_CATEGORIES, [newCategory, ...current]);
  return newId;
};

// ===============================================================
// DISCUSSION OPERATIONS
// ===============================================================

export const fetchForumDiscussions = async (filters?: {
  subject?: string;
  topic?: string;
  curriculum?: string;
  type?: string;
  language?: string;
  searchQuery?: string;
  tag?: string;
  authorId?: string;
  bookmarkedOnly?: boolean;
  userId?: string;
}): Promise<ForumDiscussion[]> => {
  let list: ForumDiscussion[] = [];
  try {
    const snap = await getDocs(collection(db, 'forum_discussions'));
    if (!snap.empty) {
      list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ForumDiscussion));
    } else {
      list = getLocalData<ForumDiscussion[]>(STORAGE_DISCUSSIONS, INITIAL_FORUM_DISCUSSIONS);
    }
  } catch (err) {
    console.warn('Firestore discussions fetch fallback to local:', err);
    list = getLocalData<ForumDiscussion[]>(STORAGE_DISCUSSIONS, INITIAL_FORUM_DISCUSSIONS);
  }

  // Filter in-memory for rich combined queries
  if (filters) {
    if (filters.subject && filters.subject !== 'All') {
      list = list.filter(d => d.subject.toLowerCase() === filters.subject?.toLowerCase());
    }
    if (filters.curriculum && filters.curriculum !== 'All') {
      list = list.filter(d => d.curriculum === filters.curriculum || d.curriculum === 'Both');
    }
    if (filters.type && filters.type !== 'All') {
      list = list.filter(d => d.type === filters.type);
    }
    if (filters.language && filters.language !== 'All') {
      list = list.filter(d => d.language === filters.language);
    }
    if (filters.tag && filters.tag !== 'All') {
      list = list.filter(d => d.tags.some(t => t.toLowerCase() === filters.tag?.toLowerCase()));
    }
    if (filters.authorId) {
      list = list.filter(d => d.authorId === filters.authorId);
    }
    if (filters.bookmarkedOnly && filters.userId) {
      const bookmarks = getLocalData<ForumBookmark[]>(STORAGE_BOOKMARKS, []);
      const bookmarkedIds = new Set(bookmarks.filter(b => b.userId === filters.userId).map(b => b.discussionId));
      list = list.filter(d => bookmarkedIds.has(d.id));
    }
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(d => 
        d.title.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q)) ||
        d.content.toLowerCase().includes(q) ||
        d.subject.toLowerCase().includes(q) ||
        (d.topic && d.topic.toLowerCase().includes(q)) ||
        d.tags.some(t => t.toLowerCase().includes(q))
      );
    }
  }

  // Sort pinned posts first, then newest
  return list.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

export const getDiscussionById = async (id: string): Promise<ForumDiscussion | null> => {
  try {
    const snap = await getDoc(doc(db, 'forum_discussions', id));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as ForumDiscussion;
    }
  } catch (err) {
    console.warn('Firestore get discussion fallback to local:', err);
  }
  const list = getLocalData<ForumDiscussion[]>(STORAGE_DISCUSSIONS, INITIAL_FORUM_DISCUSSIONS);
  return list.find(d => d.id === id) || null;
};

export const createDiscussion = async (discussion: Omit<ForumDiscussion, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'likeCount' | 'replyCount' | 'viewCount' | 'bookmarkCount' | 'isTeacherVerified' | 'hasVerifiedAnswer' | 'isPinned' | 'isLocked'>): Promise<string> => {
  const newId = `disc-${Date.now()}`;
  const now = new Date().toISOString();
  
  const newDiscussion: ForumDiscussion = {
    ...discussion,
    id: newId,
    likeCount: 0,
    replyCount: 0,
    viewCount: 1,
    bookmarkCount: 0,
    isTeacherVerified: discussion.authorRole === 'teacher' || discussion.authorRole === 'admin',
    hasVerifiedAnswer: false,
    isPinned: false,
    isLocked: false,
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now
  };

  try {
    await setDoc(doc(db, 'forum_discussions', newId), newDiscussion);
  } catch (err) {
    console.warn('Firestore create discussion fallback to local:', err);
  }

  const list = getLocalData<ForumDiscussion[]>(STORAGE_DISCUSSIONS, INITIAL_FORUM_DISCUSSIONS);
  setLocalData(STORAGE_DISCUSSIONS, [newDiscussion, ...list]);
  return newId;
};

export const updateDiscussion = async (id: string, updates: Partial<ForumDiscussion>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'forum_discussions', id), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('Firestore update discussion fallback to local:', err);
  }

  const list = getLocalData<ForumDiscussion[]>(STORAGE_DISCUSSIONS, INITIAL_FORUM_DISCUSSIONS);
  const updatedList = list.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d);
  setLocalData(STORAGE_DISCUSSIONS, updatedList);
};

export const deleteDiscussion = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'forum_discussions', id));
  } catch (err) {
    console.warn('Firestore delete discussion fallback to local:', err);
  }

  const list = getLocalData<ForumDiscussion[]>(STORAGE_DISCUSSIONS, INITIAL_FORUM_DISCUSSIONS);
  setLocalData(STORAGE_DISCUSSIONS, list.filter(d => d.id !== id));
};

export const togglePinDiscussion = async (id: string, isPinned: boolean): Promise<void> => {
  await updateDiscussion(id, { isPinned });
};

export const toggleLockDiscussion = async (id: string, isLocked: boolean): Promise<void> => {
  await updateDiscussion(id, { isLocked });
};

// ===============================================================
// REPLIES OPERATIONS
// ===============================================================

export const fetchDiscussionReplies = async (discussionId: string): Promise<ForumReply[]> => {
  try {
    const q = query(collection(db, 'forum_replies'), where('discussionId', '==', discussionId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ForumReply));
    }
  } catch (err) {
    console.warn('Firestore replies fetch fallback to local:', err);
  }
  const allReplies = getLocalData<ForumReply[]>(STORAGE_REPLIES, INITIAL_FORUM_REPLIES);
  return allReplies.filter(r => r.discussionId === discussionId);
};

export const createReply = async (reply: Omit<ForumReply, 'id' | 'createdAt' | 'likeCount' | 'isTeacherVerified' | 'isAcceptedAnswer' | 'isPinned'>): Promise<string> => {
  const newId = `reply-${Date.now()}`;
  const now = new Date().toISOString();
  
  const isTeacher = reply.authorRole === 'teacher' || reply.authorRole === 'admin';
  
  const newReply: ForumReply = {
    ...reply,
    id: newId,
    likeCount: 0,
    isTeacherVerified: isTeacher,
    isAcceptedAnswer: false,
    isPinned: false,
    createdAt: now
  };

  try {
    await setDoc(doc(db, 'forum_replies', newId), newReply);
  } catch (err) {
    console.warn('Firestore create reply fallback to local:', err);
  }

  const replies = getLocalData<ForumReply[]>(STORAGE_REPLIES, INITIAL_FORUM_REPLIES);
  setLocalData(STORAGE_REPLIES, [...replies, newReply]);

  // Update discussion reply count & last activity
  const discussion = await getDiscussionById(reply.discussionId);
  if (discussion) {
    await updateDiscussion(reply.discussionId, {
      replyCount: (discussion.replyCount || 0) + 1,
      lastActivityAt: now,
      hasVerifiedAnswer: isTeacher ? true : discussion.hasVerifiedAnswer
    });
  }

  // Create notification for post author
  if (discussion && discussion.authorId !== reply.authorId) {
    await createNotification({
      userId: discussion.authorId,
      title: 'New reply on your discussion',
      titleFr: 'Nouvelle réponse à votre discussion',
      message: `${reply.authorName} replied to "${discussion.title.slice(0, 40)}..."`,
      messageFr: `${reply.authorName} a répondu à "${discussion.title.slice(0, 40)}..."`,
      type: 'reply',
      discussionId: reply.discussionId
    });
  }

  return newId;
};

export const markVerifiedOrAcceptedReply = async (replyId: string, discussionId: string, isAccepted: boolean, isVerified: boolean): Promise<void> => {
  const replies = getLocalData<ForumReply[]>(STORAGE_REPLIES, INITIAL_FORUM_REPLIES);
  const updatedReplies = replies.map(r => {
    if (r.id === replyId) {
      return { ...r, isAcceptedAnswer: isAccepted, isTeacherVerified: isVerified };
    }
    // If setting accepted answer, clear others
    if (isAccepted && r.discussionId === discussionId && r.id !== replyId) {
      return { ...r, isAcceptedAnswer: false };
    }
    return r;
  });
  setLocalData(STORAGE_REPLIES, updatedReplies);

  if (isAccepted) {
    await updateDiscussion(discussionId, {
      acceptedReplyId: replyId,
      hasVerifiedAnswer: true
    });
  }
};

// ===============================================================
// LIKES & BOOKMARKS OPERATIONS
// ===============================================================

export const toggleLikeDiscussion = async (userId: string, discussionId: string): Promise<boolean> => {
  const likes = getLocalData<ForumLike[]>(STORAGE_LIKES, []);
  const existingIndex = likes.findIndex(l => l.userId === userId && l.targetId === discussionId && l.targetType === 'discussion');
  
  const discussion = await getDiscussionById(discussionId);
  if (!discussion) return false;

  let newLikes: ForumLike[];
  let isLikedNow = false;
  let newCount = discussion.likeCount || 0;

  if (existingIndex >= 0) {
    newLikes = likes.filter((_, i) => i !== existingIndex);
    newCount = Math.max(0, newCount - 1);
  } else {
    newLikes = [...likes, { id: `like-${Date.now()}`, userId, targetId: discussionId, targetType: 'discussion', createdAt: new Date().toISOString() }];
    isLikedNow = true;
    newCount += 1;
  }

  setLocalData(STORAGE_LIKES, newLikes);
  await updateDiscussion(discussionId, { likeCount: newCount });
  return isLikedNow;
};

export const toggleBookmarkDiscussion = async (userId: string, discussionId: string): Promise<boolean> => {
  const bookmarks = getLocalData<ForumBookmark[]>(STORAGE_BOOKMARKS, []);
  const existingIndex = bookmarks.findIndex(b => b.userId === userId && b.discussionId === discussionId);
  
  const discussion = await getDiscussionById(discussionId);
  if (!discussion) return false;

  let newBookmarks: ForumBookmark[];
  let isBookmarkedNow = false;
  let newCount = discussion.bookmarkCount || 0;

  if (existingIndex >= 0) {
    newBookmarks = bookmarks.filter((_, i) => i !== existingIndex);
    newCount = Math.max(0, newCount - 1);
  } else {
    newBookmarks = [...bookmarks, { id: `bm-${Date.now()}`, userId, discussionId, createdAt: new Date().toISOString() }];
    isBookmarkedNow = true;
    newCount += 1;
  }

  setLocalData(STORAGE_BOOKMARKS, newBookmarks);
  await updateDiscussion(discussionId, { bookmarkCount: newCount });
  return isBookmarkedNow;
};

export const getUserInteractions = (userId: string) => {
  const likes = getLocalData<ForumLike[]>(STORAGE_LIKES, []);
  const bookmarks = getLocalData<ForumBookmark[]>(STORAGE_BOOKMARKS, []);
  
  const likedDiscussionIds = new Set(likes.filter(l => l.userId === userId && l.targetType === 'discussion').map(l => l.targetId));
  const bookmarkedDiscussionIds = new Set(bookmarks.filter(b => b.userId === userId).map(b => b.discussionId));
  
  return { likedDiscussionIds, bookmarkedDiscussionIds };
};

// ===============================================================
// NOTIFICATIONS OPERATIONS
// ===============================================================

export const fetchUserNotifications = async (userId: string): Promise<ForumNotification[]> => {
  const notifications = getLocalData<ForumNotification[]>(STORAGE_NOTIFICATIONS, []);
  return notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const createNotification = async (notification: Omit<ForumNotification, 'id' | 'isRead' | 'createdAt'>): Promise<void> => {
  const newNotif: ForumNotification = {
    ...notification,
    id: `notif-${Date.now()}`,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  const current = getLocalData<ForumNotification[]>(STORAGE_NOTIFICATIONS, []);
  setLocalData(STORAGE_NOTIFICATIONS, [newNotif, ...current]);
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const notifications = getLocalData<ForumNotification[]>(STORAGE_NOTIFICATIONS, []);
  const updated = notifications.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
  setLocalData(STORAGE_NOTIFICATIONS, updated);
};

// ===============================================================
// MODERATION & REPORTS OPERATIONS
// ===============================================================

export const reportContent = async (report: Omit<ForumReport, 'id' | 'status' | 'createdAt'>): Promise<string> => {
  const newId = `rep-${Date.now()}`;
  const newReport: ForumReport = {
    ...report,
    id: newId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  const reports = getLocalData<ForumReport[]>(STORAGE_REPORTS, []);
  setLocalData(STORAGE_REPORTS, [newReport, ...reports]);
  return newId;
};

export const fetchForumReports = async (): Promise<ForumReport[]> => {
  return getLocalData<ForumReport[]>(STORAGE_REPORTS, []);
};

export const updateReportStatus = async (reportId: string, status: 'reviewed' | 'dismissed', reviewerName: string): Promise<void> => {
  const reports = getLocalData<ForumReport[]>(STORAGE_REPORTS, []);
  const updated = reports.map(r => r.id === reportId ? { ...r, status, reviewedBy: reviewerName, reviewedAt: new Date().toISOString() } : r);
  setLocalData(STORAGE_REPORTS, updated);
};

// ===============================================================
// ANALYTICS OPERATION
// ===============================================================

export const fetchForumAnalytics = async (): Promise<ForumAnalytics> => {
  const discussions = getLocalData<ForumDiscussion[]>(STORAGE_DISCUSSIONS, INITIAL_FORUM_DISCUSSIONS);
  const replies = getLocalData<ForumReply[]>(STORAGE_REPLIES, INITIAL_FORUM_REPLIES);

  const subjectMap: Record<string, number> = {};
  discussions.forEach(d => {
    subjectMap[d.subject] = (subjectMap[d.subject] || 0) + 1;
  });

  const mostDiscussedSubjects = Object.entries(subjectMap)
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalDiscussions: discussions.length,
    totalReplies: replies.length,
    activeStudents: 148,
    activeTeachers: 12,
    mostDiscussedSubjects,
    topSearchedTopics: ['Binary Search', 'Equations Différentielles', 'OSI Model', 'Python Algorithms', 'SQL Joins'],
    dailyActivity: [
      { date: 'Mon', discussions: 8, replies: 34 },
      { date: 'Tue', discussions: 14, replies: 52 },
      { date: 'Wed', discussions: 19, replies: 67 },
      { date: 'Thu', discussions: 22, replies: 89 },
      { date: 'Fri', discussions: 28, replies: 110 },
      { date: 'Sat', discussions: 15, replies: 48 },
      { date: 'Sun', discussions: 12, replies: 40 }
    ]
  };
};
