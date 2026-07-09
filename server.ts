/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  User, 
  UserRole, 
  Profile, 
  Meeting, 
  DocumentItem, 
  Wallet, 
  Transaction, 
  NotificationItem, 
  ChatMessage, 
  AuditLogItem 
} from './src/types';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Nexus Full-Stack platform running on port ${PORT}`);
});

const JWT_SECRET = process.env.JWT_SECRET || 'nexus_super_secret_master_key_2026';

// Request JSON parsing
app.use(express.json({ limit: '50mb' }));

// -------------------------------------------------------------
// Gemini AI Setup
// -------------------------------------------------------------
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('Gemini AI initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Gemini AI:', err);
  }
} else {
  console.log('Gemini API key is not configured. AI Features will run in simulation mode.');
}

// -------------------------------------------------------------
// Database Path & Schema Setup
// -------------------------------------------------------------
const DB_FILE = path.join(process.cwd(), 'local_db.json');

interface Database {
  users: User[];
  passwords: Record<string, string>; // userId -> hashed_password
  profiles: Profile[];
  meetings: Meeting[];
  documents: DocumentItem[];
  wallets: Wallet[];
  transactions: Transaction[];
  notifications: NotificationItem[];
  messages: ChatMessage[];
  auditLogs: AuditLogItem[];
  rtcSignaling: Record<string, Array<{ type: string; sdp?: any; candidate?: any; senderId: string }>>; // roomId -> message list
}

const initialDb: Database = {
  users: [],
  passwords: {},
  profiles: [],
  meetings: [],
  documents: [],
  wallets: [],
  transactions: [],
  notifications: [],
  messages: [],
  auditLogs: [],
  rtcSignaling: {}
};

// Resilient load and save
function loadDb(): Database {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading database file, resetting to initial database:', err);
  }
  return initialDb;
}

function saveDb(db: Database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

// -------------------------------------------------------------
// Database Seeding
// -------------------------------------------------------------
function seedDatabase() {
  const db = loadDb();
  if (db.users.length > 0) return; // already seeded

  console.log('Seeding Nexus database with premium profiles...');

  const passwordHash = (p: string) => crypto.createHash('sha256').update(p).digest('hex');

  // 1. Create Users
  const users: User[] = [
    { id: 'usr_admin', email: 'admin@nexus.com', role: UserRole.ADMIN, createdAt: new Date().toISOString() },
    { id: 'usr_investor_1', email: 'investor@nexus.com', role: UserRole.INVESTOR, createdAt: new Date().toISOString() },
    { id: 'usr_investor_2', email: 'samantha@vanguard.vc', role: UserRole.INVESTOR, createdAt: new Date().toISOString() },
    { id: 'usr_entrepreneur_1', email: 'entrepreneur@nexus.com', role: UserRole.ENTREPRENEUR, createdAt: new Date().toISOString() },
    { id: 'usr_entrepreneur_2', email: 'david@greengrid.io', role: UserRole.ENTREPRENEUR, createdAt: new Date().toISOString() },
  ];

  const passwords: Record<string, string> = {
    usr_admin: passwordHash('nexus123'),
    usr_investor_1: passwordHash('nexus123'),
    usr_investor_2: passwordHash('nexus123'),
    usr_entrepreneur_1: passwordHash('nexus123'),
    usr_entrepreneur_2: passwordHash('nexus123'),
  };

  // 2. Profiles
  const profiles: Profile[] = [
    {
      userId: 'usr_admin',
      name: 'Nexus Admin Team',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      bio: 'General administrator account for platform management and compliance.',
      industry: 'Software',
      skills: ['Operations', 'Security', 'Compliance'],
      experience: '10 years running startup ecosystems',
      experiences: []
    },
    {
      userId: 'usr_investor_1',
      name: 'Marcus Sterling',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
      bio: 'Managing Partner at Sterling Ventures. Focused on early-stage enterprise software and artificial intelligence.',
      industry: 'Artificial Intelligence',
      skills: ['Venture Capital', 'SaaS Scaling', 'Product Strategy', 'M&A'],
      experience: '15 years VC and ex-Google Product Lead',
      experiences: [
        { id: 'exp_1', title: 'Managing Partner', company: 'Sterling Ventures', years: 8 },
        { id: 'exp_2', title: 'Product Director', company: 'Google Cloud AI', years: 7 }
      ],
      totalInvested: 24500000,
      investmentsCount: 18,
      preferredStages: ['Seed', 'Series A'],
      preferredIndustries: ['Artificial Intelligence', 'SaaS', 'Fintech', 'Cybersecurity'],
      ticketSizeMin: 250000,
      ticketSizeMax: 2000000
    },
    {
      userId: 'usr_investor_2',
      name: 'Samantha Chen',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      bio: 'GP at Vanguard BioTech & Health. Investing in the future of life sciences, remote diagnostics, and digital health.',
      industry: 'Healthcare & Life Sciences',
      skills: ['Biomedical Engineering', 'Clinical Trial Strategy', 'FDA Approvals', 'Venture Capital'],
      experience: '12 years healthcare investment practitioner',
      experiences: [
        { id: 'exp_3', title: 'General Partner', company: 'Vanguard Health', years: 6 },
        { id: 'exp_4', title: 'Senior Associate', company: 'OrbiMed', years: 6 }
      ],
      totalInvested: 18000000,
      investmentsCount: 11,
      preferredStages: ['Series A', 'Series B'],
      preferredIndustries: ['Healthcare & Life Sciences', 'Deeptech', 'SaaS'],
      ticketSizeMin: 500000,
      ticketSizeMax: 3000000
    },
    {
      userId: 'usr_entrepreneur_1',
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      bio: 'Founder & CEO of OmniMind AI. Building localized, super-efficient LLM orchestrators that run inside secure enterprise perimeters.',
      industry: 'Artificial Intelligence',
      skills: ['Machine Learning', 'Docker', 'Kubernetes', 'Enterprise Sales', 'Team Building'],
      experience: '7 years ML Engineering at Apple and Meta',
      experiences: [
        { id: 'exp_5', title: 'Founder & CEO', company: 'OmniMind AI', years: 2 },
        { id: 'exp_6', title: 'Senior ML Engineer', company: 'Apple AI Group', years: 5 }
      ],
      startupName: 'OmniMind AI',
      startupDescription: 'OmniMind delivers secure, private, and localized generative AI orchestrators designed exclusively for healthcare, finance, and defense industries.',
      pitchDeckUrl: 'OmniMind_PitchDeck_Q3_2026.pdf',
      fundingStage: 'Seed',
      fundingGoal: 1500000,
      fundingRaised: 450000
    },
    {
      userId: 'usr_entrepreneur_2',
      name: 'David Kojo',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      bio: 'Founder of GreenGrid. Building next-generation micro-grid analytics powered by smart contracts to balance clean energy distribution.',
      industry: 'ClimateTech',
      skills: ['Smart Grids', 'Renewable Energy', 'Solidity', 'Go', 'IoT Systems'],
      experience: '8 years systems engineer',
      experiences: [
        { id: 'exp_7', title: 'Founder', company: 'GreenGrid.io', years: 3 },
        { id: 'exp_8', title: 'Principal Grid Analyst', company: 'Tesla Energy', years: 5 }
      ],
      startupName: 'GreenGrid.io',
      startupDescription: 'GreenGrid optimizes clean power distribution on localized smart grids through autonomous IoT power routers and blockchain ledger validation.',
      pitchDeckUrl: 'GreenGrid_ExecutiveSummary.pdf',
      fundingStage: 'Pre-Seed',
      fundingGoal: 750000,
      fundingRaised: 120000
    }
  ];

  // 3. Wallets
  const wallets: Wallet[] = [
    { userId: 'usr_admin', balance: 0, currency: 'USD', updatedAt: new Date().toISOString() },
    { userId: 'usr_investor_1', balance: 5000000, currency: 'USD', updatedAt: new Date().toISOString() },
    { userId: 'usr_investor_2', balance: 8000000, currency: 'USD', updatedAt: new Date().toISOString() },
    { userId: 'usr_entrepreneur_1', balance: 450000, currency: 'USD', updatedAt: new Date().toISOString() },
    { userId: 'usr_entrepreneur_2', balance: 120000, currency: 'USD', updatedAt: new Date().toISOString() }
  ];

  // 4. Initial Notifications
  const notifications: NotificationItem[] = [
    {
      id: 'not_1',
      userId: 'usr_investor_1',
      title: 'Welcome to Nexus!',
      message: 'Explore early-stage startups matching your AI preferences, and use the integrated calendar to schedule meetings directly.',
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'not_2',
      userId: 'usr_entrepreneur_1',
      title: 'Welcome to Nexus!',
      message: 'Upload your Pitch Deck and Financials to your Document Chamber, and use the AI Matchmaker to analyze your pitch alignment.',
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    }
  ];

  // 5. Initial Messages
  const messages: ChatMessage[] = [
    {
      id: 'msg_1',
      senderId: 'usr_entrepreneur_1',
      receiverId: 'usr_investor_1',
      content: 'Hi Marcus, I saw your investment focus on secure enterprise AI systems. I would love for you to review OmniMind AI.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'msg_2',
      senderId: 'usr_investor_1',
      receiverId: 'usr_entrepreneur_1',
      content: 'Hello Alex, that sounds highly relevant to our recent thesis. Please upload your pitch deck to the Document Chamber here so I can take a look.',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  // 6. Audit logs
  const auditLogs: AuditLogItem[] = [
    {
      id: 'aud_seed',
      userId: 'usr_admin',
      userEmail: 'admin@nexus.com',
      action: 'SYSTEM_SEED',
      details: 'Nexus premium platform successfully seeded with initial accounts.',
      ip: '127.0.0.1',
      createdAt: new Date().toISOString()
    }
  ];

  // 7. Seed sample documents
  const documents: DocumentItem[] = [
    {
      id: 'doc_1',
      userId: 'usr_entrepreneur_1',
      userName: 'Alex Rivera (OmniMind AI)',
      title: 'OmniMind_PitchDeck_Q3_2026.pdf',
      description: 'Main Series Seed pitch deck illustrating product architecture, pricing model, and enterprise market traction.',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', // visual thumbnail fallback
      category: 'pitch_deck',
      approvalStatus: 'approved',
      electronicSignatures: [],
      versions: [
        { version: 1, url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', uploadedAt: new Date().toISOString(), uploadedBy: 'Alex Rivera' }
      ],
      createdAt: new Date().toISOString()
    }
  ];

  db.users = users;
  db.passwords = passwords;
  db.profiles = profiles;
  db.wallets = wallets;
  db.notifications = notifications;
  db.messages = messages;
  db.auditLogs = auditLogs;
  db.documents = documents;

  saveDb(db);
  console.log('Nexus seeding complete.');
}

// Seed upon load
seedDatabase();

// -------------------------------------------------------------
// Authentication Helper Functions
// -------------------------------------------------------------
function generateToken(payload: { id: string; email: string; role: UserRole }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 86400 })).toString('base64');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const computedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64');
    if (computedSig !== signature) return null;

    const decodedBody = JSON.parse(Buffer.from(body, 'base64').toString('utf8'));
    if (decodedBody.exp < Math.floor(Date.now() / 1000)) {
      return null; // expired
    }
    return decodedBody;
  } catch (e) {
    return null;
  }
}

// -------------------------------------------------------------
// Middleware: Authentication & Authorization
// -------------------------------------------------------------
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authorization header with token is required' });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(403).json({ error: 'Invalid or expired authentication token' });
  }

  req.user = user;
  next();
}

function requireRole(roles: UserRole[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Requires one of the following roles: ${roles.join(', ')}` });
    }
    next();
  };
}

// Helper for capturing client IP safely
function getClientIp(req: any): string {
  return (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
}

// Helper to write audit logs
function logAudit(userId: string, email: string, action: string, details: string, ip: string) {
  const db = loadDb();
  const newLog: AuditLogItem = {
    id: 'aud_' + crypto.randomUUID(),
    userId,
    userEmail: email,
    action,
    details,
    ip,
    createdAt: new Date().toISOString()
  };
  db.auditLogs.unshift(newLog);
  // Cap logs size to prevent file bloat
  if (db.auditLogs.length > 500) {
    db.auditLogs.pop();
  }
  saveDb(db);
}

// Helper to trigger notifications
function sendNotification(userId: string, title: string, message: string, type: 'meeting' | 'document' | 'wallet' | 'system' | 'message') {
  const db = loadDb();
  const newNotification: NotificationItem = {
    id: 'not_' + crypto.randomUUID(),
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  };
  db.notifications.unshift(newNotification);
  saveDb(db);
}

// -------------------------------------------------------------
// REST API Routes
// -------------------------------------------------------------

// -- Health Check --
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), database: 'resilient_local_json' });
});

// -- Auth: Register --
app.post('/api/auth/register', (req, res) => {
  const { email, password, role, name, industry } = req.body;

  if (!email || !password || !role || !name) {
    return res.status(400).json({ error: 'Email, password, role, and full name are required' });
  }

  if (!Object.values(UserRole).includes(role)) {
    return res.status(400).json({ error: 'Invalid role selection' });
  }

  const db = loadDb();
  const normalizedEmail = email.toLowerCase().trim();

  if (db.users.some(u => u.email === normalizedEmail)) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const userId = 'usr_' + crypto.randomUUID();
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

  // Create User
  const newUser: User = {
    id: userId,
    email: normalizedEmail,
    role: role as UserRole,
    createdAt: new Date().toISOString()
  };

  // Create empty profile
  const newProfile: Profile = {
    userId,
    name: name.trim(),
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    bio: `A premium ${role} looking to build future-defining ventures on Nexus.`,
    industry: industry || 'Technology',
    skills: [],
    experience: 'New to the platform',
    experiences: [],
    ...(role === UserRole.ENTREPRENEUR ? {
      startupName: `${name}'s Venture`,
      startupDescription: 'A newly registered startup on Nexus.',
      fundingStage: 'Pre-Seed',
      fundingGoal: 500000,
      fundingRaised: 0
    } : {
      totalInvested: 0,
      investmentsCount: 0,
      preferredStages: ['Pre-Seed', 'Seed'],
      preferredIndustries: [industry || 'Technology'],
      ticketSizeMin: 5000,
      ticketSizeMax: 100000
    })
  };

  // Create Wallet
  // Seed with initial demo capital
  const seedBalance = role === UserRole.INVESTOR ? 1000000 : 25000;
  const newWallet: Wallet = {
    userId,
    balance: seedBalance,
    currency: 'USD',
    updatedAt: new Date().toISOString()
  };

  db.users.push(newUser);
  db.passwords[userId] = passwordHash;
  db.profiles.push(newProfile);
  db.wallets.push(newWallet);

  saveDb(db);

  const ip = getClientIp(req);
  logAudit(userId, normalizedEmail, 'USER_REGISTER', `Created ${role} account for ${name}`, ip);
  sendNotification(userId, 'Welcome to Nexus!', `Your full-featured ${role} workspace is ready. Click Dashboard to begin!`, 'system');

  const token = generateToken({ id: userId, email: normalizedEmail, role: role as UserRole });
  res.status(201).json({
    token,
    user: newUser,
    profile: newProfile,
    wallet: newWallet
  });
});

// -- Auth: Login --
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = loadDb();
  const normalizedEmail = email.toLowerCase().trim();
  const user = db.users.find(u => u.email === normalizedEmail);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  if (db.passwords[user.id] !== passwordHash) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const profile = db.profiles.find(p => p.userId === user.id);
  const wallet = db.wallets.find(w => w.userId === user.id);

  const ip = getClientIp(req);
  logAudit(user.id, user.email, 'USER_LOGIN', `Logged into application dashboard`, ip);

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  res.json({
    token,
    user,
    profile,
    wallet
  });
});

// -- Auth: Current User --
app.get('/api/auth/me', authenticateToken, (req: any, res) => {
  const db = loadDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const profile = db.profiles.find(p => p.userId === req.user.id);
  const wallet = db.wallets.find(w => w.userId === req.user.id);

  res.json({
    user,
    profile,
    wallet
  });
});

// -- Profiles: Get All --
app.get('/api/profiles', authenticateToken, (req, res) => {
  const db = loadDb();
  const { industry, role, q } = req.query;
  
  let targetUserIds = db.users.map(u => u.id);
  if (role) {
    targetUserIds = db.users.filter(u => u.role === role).map(u => u.id);
  }

  let filteredProfiles = db.profiles.filter(p => targetUserIds.includes(p.userId));

  if (industry) {
    filteredProfiles = filteredProfiles.filter(p => p.industry.toLowerCase() === (industry as string).toLowerCase());
  }

  if (q) {
    const term = (q as string).toLowerCase();
    filteredProfiles = filteredProfiles.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.bio.toLowerCase().includes(term) || 
      p.industry.toLowerCase().includes(term) ||
      (p.startupName && p.startupName.toLowerCase().includes(term)) ||
      (p.startupDescription && p.startupDescription.toLowerCase().includes(term))
    );
  }

  res.json(filteredProfiles);
});

// -- Profile: Update --
app.put('/api/profile', authenticateToken, (req: any, res) => {
  const db = loadDb();
  const profileIndex = db.profiles.findIndex(p => p.userId === req.user.id);

  if (profileIndex === -1) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const oldProfile = db.profiles[profileIndex];
  const updatedProfile: Profile = {
    ...oldProfile,
    ...req.body,
    userId: req.user.id // ensure same ID
  };

  db.profiles[profileIndex] = updatedProfile;
  saveDb(db);

  const ip = getClientIp(req);
  logAudit(req.user.id, req.user.email, 'PROFILE_UPDATE', `Updated user visual profile card`, ip);

  res.json(updatedProfile);
});

// -- Meetings: Get --
app.get('/api/meetings', authenticateToken, (req: any, res) => {
  const db = loadDb();
  const myMeetings = db.meetings.filter(m => m.requesterId === req.user.id || m.receiverId === req.user.id);
  res.json(myMeetings);
});

// -- Meetings: Request (Conflict Detection!) --
app.post('/api/meetings', authenticateToken, (req: any, res) => {
  const { receiverId, title, description, date, startTime, duration } = req.body;

  if (!receiverId || !title || !date || !startTime || !duration) {
    return res.status(400).json({ error: 'Receiver ID, Title, Date, Start Time, and Duration are required' });
  }

  const db = loadDb();
  const requesterProfile = db.profiles.find(p => p.userId === req.user.id);
  const receiverProfile = db.profiles.find(p => p.userId === receiverId);

  if (!receiverProfile) {
    return res.status(404).json({ error: 'Recipient profile not found' });
  }

  // Conflict Detection: check if requester or receiver has an overlapping meeting at the requested time
  const reqStart = new Date(`${date}T${startTime}`);
  const reqEnd = new Date(reqStart.getTime() + duration * 60000);

  const conflict = db.meetings.some(m => {
    if (m.status === 'cancelled' || m.status === 'rejected') return false;
    if (m.requesterId !== req.user.id && m.receiverId !== req.user.id && m.requesterId !== receiverId && m.receiverId !== receiverId) return false;

    // Check overlaps
    const mStart = new Date(`${m.date}T${m.startTime}`);
    const mEnd = new Date(mStart.getTime() + m.duration * 60000);

    return (reqStart < mEnd && reqEnd > mStart);
  });

  if (conflict) {
    return res.status(409).json({ 
      error: 'Conflict Detected: You or the participant already has a meeting scheduled that overlaps with this time slot.' 
    });
  }

  const newMeeting: Meeting = {
    id: 'meet_' + crypto.randomUUID(),
    requesterId: req.user.id,
    receiverId,
    requesterName: requesterProfile?.name || 'User',
    receiverName: receiverProfile?.name || 'Partner',
    title,
    description: description || '',
    date,
    startTime,
    duration: Number(duration),
    status: 'pending',
    videoRoomId: 'room_' + crypto.randomBytes(6).toString('hex'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.meetings.push(newMeeting);
  saveDb(db);

  const ip = getClientIp(req);
  logAudit(req.user.id, req.user.email, 'MEETING_REQUEST', `Scheduled a meeting request with ${receiverProfile.name}`, ip);
  sendNotification(receiverId, 'New Meeting Request', `${requesterProfile?.name || 'A partner'} has requested a meeting: "${title}" on ${date} at ${startTime}.`, 'meeting');

  res.status(201).json(newMeeting);
});

// -- Meetings: Update Status (Accept / Reject / Cancel) --
app.post('/api/meetings/:id/status', authenticateToken, (req: any, res) => {
  const { status } = req.body;
  if (!['accepted', 'rejected', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status update' });
  }

  const db = loadDb();
  const meetingIndex = db.meetings.findIndex(m => m.id === req.params.id);

  if (meetingIndex === -1) {
    return res.status(404).json({ error: 'Meeting not found' });
  }

  const m = db.meetings[meetingIndex];

  // Authorization check
  if (status === 'cancelled' && m.requesterId !== req.user.id && m.receiverId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized to cancel this meeting' });
  }
  if ((status === 'accepted' || status === 'rejected') && m.receiverId !== req.user.id) {
    return res.status(403).json({ error: 'Only the receiver can accept or reject a meeting' });
  }

  m.status = status;
  m.updatedAt = new Date().toISOString();
  saveDb(db);

  const ip = getClientIp(req);
  logAudit(req.user.id, req.user.email, `MEETING_${status.toUpperCase()}`, `Updated meeting "${m.title}" to status: ${status}`, ip);

  const recipientId = m.requesterId === req.user.id ? m.receiverId : m.requesterId;
  const responderName = m.requesterId === req.user.id ? m.requesterName : m.receiverName;
  sendNotification(recipientId, `Meeting ${status}`, `${responderName} has ${status} the meeting: "${m.title}" scheduled for ${m.date}.`, 'meeting');

  res.json(m);
});

// -- Meetings: Reschedule --
app.post('/api/meetings/:id/reschedule', authenticateToken, (req: any, res) => {
  const { date, startTime, duration } = req.body;
  if (!date || !startTime || !duration) {
    return res.status(400).json({ error: 'Date, start time, and duration are required' });
  }

  const db = loadDb();
  const meetingIndex = db.meetings.findIndex(m => m.id === req.params.id);
  if (meetingIndex === -1) {
    return res.status(404).json({ error: 'Meeting not found' });
  }

  const m = db.meetings[meetingIndex];
  if (m.requesterId !== req.user.id && m.receiverId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized to reschedule this meeting' });
  }

  // Overlap check excluding current meeting
  const reqStart = new Date(`${date}T${startTime}`);
  const reqEnd = new Date(reqStart.getTime() + duration * 60000);

  const conflict = db.meetings.some(other => {
    if (other.id === m.id) return false;
    if (other.status === 'cancelled' || other.status === 'rejected') return false;
    if (other.requesterId !== req.user.id && other.receiverId !== req.user.id && other.requesterId !== m.receiverId && other.receiverId !== m.receiverId) return false;

    const mStart = new Date(`${other.date}T${other.startTime}`);
    const mEnd = new Date(mStart.getTime() + other.duration * 60000);

    return (reqStart < mEnd && reqEnd > mStart);
  });

  if (conflict) {
    return res.status(409).json({ 
      error: 'Conflict Detected: One of the participants has an overlapping meeting at that time.' 
    });
  }

  m.date = date;
  m.startTime = startTime;
  m.duration = Number(duration);
  m.status = 'pending'; // reset to pending after reschedule for review
  m.updatedAt = new Date().toISOString();
  saveDb(db);

  const ip = getClientIp(req);
  logAudit(req.user.id, req.user.email, 'MEETING_RESCHEDULE', `Rescheduled meeting "${m.title}" to ${date} ${startTime}`, ip);

  const partnerId = m.requesterId === req.user.id ? m.receiverId : m.requesterId;
  const userProfile = db.profiles.find(p => p.userId === req.user.id);
  sendNotification(partnerId, 'Meeting Rescheduled', `${userProfile?.name || 'Partner'} rescheduled "${m.title}" to ${date} at ${startTime}. Please approve the new schedule.`, 'meeting');

  res.json(m);
});

// -- Documents: Get --
app.get('/api/documents', authenticateToken, (req: any, res) => {
  const db = loadDb();
  // Admin sees all. Investors and Entrepreneurs see documents belonging to themselves,
  // or documents from users they have/had meetings or conversations with.
  // For safety and premium flow, we let all registered users browse Approved documents,
  // and see their own private ones! This makes research simple.
  let list = db.documents;
  if (req.user.role !== UserRole.ADMIN) {
    list = db.documents.filter(d => d.userId === req.user.id || d.approvalStatus === 'approved');
  }
  res.json(list);
});

// -- Documents: Upload --
app.post('/api/documents/upload', authenticateToken, (req: any, res) => {
  const { title, description, category, url } = req.body;

  if (!title || !category || !url) {
    return res.status(400).json({ error: 'Title, category, and document file/url are required' });
  }

  const db = loadDb();
  const profile = db.profiles.find(p => p.userId === req.user.id);

  const newDoc: DocumentItem = {
    id: 'doc_' + crypto.randomUUID(),
    userId: req.user.id,
    userName: profile?.name || req.user.email,
    title,
    description: description || '',
    url, // can be a standard visual placeholder, file system path, or base64 data
    category,
    approvalStatus: 'approved', // auto-approve for seamless test flows
    electronicSignatures: [],
    versions: [
      {
        version: 1,
        url,
        uploadedAt: new Date().toISOString(),
        uploadedBy: profile?.name || req.user.email
      }
    ],
    createdAt: new Date().toISOString()
  };

  db.documents.unshift(newDoc);
  saveDb(db);

  const ip = getClientIp(req);
  logAudit(req.user.id, req.user.email, 'DOCUMENT_UPLOAD', `Uploaded document "${title}" under category: ${category}`, ip);

  res.status(201).json(newDoc);
});

// -- Documents: Electronic Signature --
app.post('/api/documents/:id/sign', authenticateToken, (req: any, res) => {
  const { title } = req.body; // signer title, e.g., "General Partner"
  const db = loadDb();
  const docIndex = db.documents.findIndex(d => d.id === req.params.id);

  if (docIndex === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const doc = db.documents[docIndex];
  const profile = db.profiles.find(p => p.userId === req.user.id);
  const signerName = profile?.name || req.user.email;

  // Check if already signed
  if (doc.electronicSignatures.some(s => s.userId === req.user.id)) {
    return res.status(400).json({ error: 'You have already signed this document' });
  }

  const ip = getClientIp(req);
  const signature = {
    userId: req.user.id,
    name: signerName,
    title: title || (req.user.role === UserRole.INVESTOR ? 'Investor Partner' : 'Founder'),
    signedAt: new Date().toISOString(),
    ip
  };

  doc.electronicSignatures.push(signature);
  saveDb(db);

  logAudit(req.user.id, req.user.email, 'DOCUMENT_SIGN', `Digitally signed document: "${doc.title}"`, ip);
  
  // Notify document owner
  if (doc.userId !== req.user.id) {
    sendNotification(doc.userId, 'Document Signed!', `${signerName} has electronically signed your document: "${doc.title}".`, 'document');
  }

  res.json(doc);
});

// -- Documents: Update Status (Admin Approval) --
app.post('/api/documents/:id/status', authenticateToken, requireRole([UserRole.ADMIN]), (req: any, res) => {
  const { approvalStatus } = req.body;
  if (!['approved', 'rejected'].includes(approvalStatus)) {
    return res.status(400).json({ error: 'Invalid approval status' });
  }

  const db = loadDb();
  const docIndex = db.documents.findIndex(d => d.id === req.params.id);

  if (docIndex === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const doc = db.documents[docIndex];
  doc.approvalStatus = approvalStatus;
  saveDb(db);

  const ip = getClientIp(req);
  logAudit(req.user.id, req.user.email, `DOCUMENT_APPROVE_${approvalStatus.toUpperCase()}`, `Admin updated document "${doc.title}" status to ${approvalStatus}`, ip);
  sendNotification(doc.userId, `Document Review Result`, `Your uploaded document "${doc.title}" has been ${approvalStatus} by the compliance team.`, 'document');

  res.json(doc);
});

// -- Documents: Delete --
app.delete('/api/documents/:id', authenticateToken, (req: any, res) => {
  const db = loadDb();
  const docIndex = db.documents.findIndex(d => d.id === req.params.id);

  if (docIndex === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const doc = db.documents[docIndex];
  if (doc.userId !== req.user.id && req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Unauthorized to delete this document' });
  }

  db.documents.splice(docIndex, 1);
  saveDb(db);

  const ip = getClientIp(req);
  logAudit(req.user.id, req.user.email, 'DOCUMENT_DELETE', `Deleted document "${doc.title}"`, ip);

  res.json({ message: 'Document successfully deleted' });
});

// -- Wallet: Get & Transactions --
app.get('/api/wallet', authenticateToken, (req: any, res) => {
  const db = loadDb();
  let wallet = db.wallets.find(w => w.userId === req.user.id);
  
  if (!wallet) {
    // Lazy create if missing
    wallet = {
      userId: req.user.id,
      balance: req.user.role === UserRole.INVESTOR ? 1000000 : 10000,
      currency: 'USD',
      updatedAt: new Date().toISOString()
    };
    db.wallets.push(wallet);
    saveDb(db);
  }

  const history = db.transactions.filter(t => t.userId === req.user.id);
  res.json({ wallet, history });
});

// -- Wallet: Get Transactions (Formatted for Frontend) --
app.get('/api/wallet/transactions', authenticateToken, (req: any, res) => {
  const db = loadDb();
  const myTxs = db.transactions.filter(t => t.userId === req.user.id);
  const formattedTxs = myTxs.map(t => {
    let senderUserId = '';
    let receiverName = '';
    let senderName = '';
    if (t.type === 'investment') {
      senderUserId = req.user.id;
      receiverName = t.targetName || 'Startup';
    } else if (t.type === 'transfer') {
      senderUserId = t.targetUserId || '';
      senderName = t.targetName || 'Investor';
    } else if (t.type === 'deposit') {
      senderUserId = '';
    } else if (t.type === 'withdraw') {
      senderUserId = req.user.id;
    }
    return {
      ...t,
      senderUserId,
      receiverName,
      senderName,
      message: t.reference
    };
  });
  res.json(formattedTxs);
});

// -- Wallet: Deposit (Stripe Checkout Simulation) --
app.post('/api/wallet/deposit', authenticateToken, (req: any, res) => {
  const { amount, source } = req.body;
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  const db = loadDb();
  const wallet = db.wallets.find(w => w.userId === req.user.id);
  if (!wallet) {
    return res.status(404).json({ error: 'Wallet not found' });
  }

  const depositVal = Number(amount);
  wallet.balance += depositVal;
  wallet.updatedAt = new Date().toISOString();

  const txId = 'tx_' + crypto.randomUUID();
  const newTx: Transaction = {
    id: txId,
    userId: req.user.id,
    walletId: req.user.id,
    type: 'deposit',
    amount: depositVal,
    status: 'completed',
    reference: source || 'Stripe Sandbox Credit Card',
    createdAt: new Date().toISOString()
  };

  db.transactions.unshift(newTx);
  saveDb(db);

  const ip = getClientIp(req);
  logAudit(req.user.id, req.user.email, 'WALLET_DEPOSIT', `Deposited $${depositVal} via simulated Stripe Session`, ip);
  sendNotification(req.user.id, 'Deposit Completed', `Your account balance was credited with $${depositVal.toLocaleString()} via Stripe Sandbox.`, 'wallet');

  res.json({ wallet, transaction: newTx });
});

// -- Wallet: Withdraw --
app.post('/api/wallet/withdraw', authenticateToken, (req: any, res) => {
  const { amount, routing } = req.body;
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  const db = loadDb();
  const wallet = db.wallets.find(w => w.userId === req.user.id);
  if (!wallet) {
    return res.status(404).json({ error: 'Wallet not found' });
  }

  const withdrawVal = Number(amount);
  if (wallet.balance < withdrawVal) {
    return res.status(400).json({ error: 'Insufficient wallet balance' });
  }

  wallet.balance -= withdrawVal;
  wallet.updatedAt = new Date().toISOString();

  const txId = 'tx_' + crypto.randomUUID();
  const newTx: Transaction = {
    id: txId,
    userId: req.user.id,
    walletId: req.user.id,
    type: 'withdraw',
    amount: withdrawVal,
    status: 'completed',
    reference: routing || 'Wire Transfer routing XXXXX',
    createdAt: new Date().toISOString()
  };

  db.transactions.unshift(newTx);
  saveDb(db);

  const ip = getClientIp(req);
  logAudit(req.user.id, req.user.email, 'WALLET_WITHDRAW', `Withdrew $${withdrawVal} to external account`, ip);
  sendNotification(req.user.id, 'Withdrawal Processed', `Successfully processed a wire withdrawal of $${withdrawVal.toLocaleString()} to your bank.`, 'wallet');

  res.json({ wallet, transaction: newTx });
});

// -- Wallet: Direct Investment Transfer --
app.post('/api/wallet/transfer', authenticateToken, (req: any, res) => {
  const { targetUserId, amount, message } = req.body;
  if (!targetUserId || !amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Target recipient and investment amount are required' });
  }

  const db = loadDb();
  const senderWallet = db.wallets.find(w => w.userId === req.user.id);
  const receiverWallet = db.wallets.find(w => w.userId === targetUserId);

  if (!senderWallet) return res.status(404).json({ error: 'Your wallet was not found' });
  if (!receiverWallet) return res.status(404).json({ error: 'Recipient startup wallet was not found' });

  const investVal = Number(amount);
  if (senderWallet.balance < investVal) {
    return res.status(400).json({ error: 'Insufficient funds in your investment ledger' });
  }

  // Deduct from Investor, Credit to Entrepreneur
  senderWallet.balance -= investVal;
  senderWallet.updatedAt = new Date().toISOString();

  receiverWallet.balance += investVal;
  receiverWallet.updatedAt = new Date().toISOString();

  const senderProfile = db.profiles.find(p => p.userId === req.user.id);
  const receiverProfile = db.profiles.find(p => p.userId === targetUserId);

  // 1. Log Transaction for Investor (Sender)
  const txSenderId = 'tx_' + crypto.randomUUID();
  const txSender: Transaction = {
    id: txSenderId,
    userId: req.user.id,
    walletId: req.user.id,
    type: 'investment',
    amount: investVal,
    targetUserId,
    targetName: receiverProfile?.startupName || receiverProfile?.name || 'Startup Ledger',
    status: 'completed',
    reference: message || `Capital Injection into ${receiverProfile?.startupName || 'Startup'}`,
    createdAt: new Date().toISOString()
  };

  // 2. Log Transaction for Entrepreneur (Receiver)
  const txReceiverId = 'tx_' + crypto.randomUUID();
  const txReceiver: Transaction = {
    id: txReceiverId,
    userId: targetUserId,
    walletId: targetUserId,
    type: 'transfer',
    amount: investVal,
    targetUserId: req.user.id,
    targetName: senderProfile?.name || 'Investor Ledger',
    status: 'completed',
    reference: message || `Venture Capital backing from ${senderProfile?.name || 'Investor'}`,
    createdAt: new Date().toISOString()
  };

  db.transactions.unshift(txSender);
  db.transactions.unshift(txReceiver);

  // Update entrepreneur funding goals
  if (receiverProfile) {
    receiverProfile.fundingRaised = (receiverProfile.fundingRaised || 0) + investVal;
  }

  // Update investor history metrics
  if (senderProfile) {
    senderProfile.totalInvested = (senderProfile.totalInvested || 0) + investVal;
    senderProfile.investmentsCount = (senderProfile.investmentsCount || 0) + 1;
  }

  saveDb(db);

  const ip = getClientIp(req);
  logAudit(req.user.id, req.user.email, 'INVESTMENT_TRANSFER', `Transferred $${investVal} venture capital to ${receiverProfile?.startupName}`, ip);
  
  // Notification to both
  sendNotification(req.user.id, 'Investment Completed', `Backing confirmed: You successfully transferred $${investVal.toLocaleString()} seed capital to ${receiverProfile?.startupName}.`, 'wallet');
  sendNotification(targetUserId, 'Capital Backing Received!', `Venture Backed! ${senderProfile?.name} has invested $${investVal.toLocaleString()} into your business wallet.`, 'wallet');

  res.json({ wallet: senderWallet, transaction: txSender });
});

// -- Notifications: Get --
app.get('/api/notifications', authenticateToken, (req: any, res) => {
  const db = loadDb();
  const list = db.notifications.filter(n => n.userId === req.user.id);
  res.json(list);
});

// -- Notifications: Mark as Read --
app.post('/api/notifications/:id/read', authenticateToken, (req: any, res) => {
  const db = loadDb();
  const notif = db.notifications.find(n => n.id === req.params.id && n.userId === req.user.id);
  if (notif) {
    notif.read = true;
    saveDb(db);
  }
  res.json({ success: true });
});

// -- Chat: Get Conversations / Peer Messages --
app.get('/api/messages', authenticateToken, (req: any, res) => {
  const db = loadDb();
  const { partnerId } = req.query;

  if (!partnerId) {
    return res.status(400).json({ error: 'Partner ID query param is required' });
  }

  const myMessages = db.messages.filter(m => 
    (m.senderId === req.user.id && m.receiverId === partnerId) || 
    (m.senderId === partnerId && m.receiverId === req.user.id)
  ).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  res.json(myMessages);
});

// -- Chat: Send Peer Message --
app.post('/api/messages', authenticateToken, (req: any, res) => {
  const { receiverId, content } = req.body;
  if (!receiverId || !content) {
    return res.status(400).json({ error: 'Receiver ID and content are required' });
  }

  const db = loadDb();
  const senderProfile = db.profiles.find(p => p.userId === req.user.id);

  const newMessage: ChatMessage = {
    id: 'msg_' + crypto.randomUUID(),
    senderId: req.user.id,
    receiverId,
    content: content.trim(),
    createdAt: new Date().toISOString()
  };

  db.messages.push(newMessage);
  saveDb(db);

  // Send real-time notification
  sendNotification(receiverId, 'New Message', `${senderProfile?.name || 'A partner'} says: "${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`, 'message');

  res.status(201).json(newMessage);
});

// -- WebRTC room Signaling REST fallback --
app.get('/api/rooms/:roomId/signals', authenticateToken, (req: any, res) => {
  const db = loadDb();
  const signals = db.rtcSignaling[req.params.roomId] || [];
  // return signals from other participants
  const otherSignals = signals.filter(s => s.senderId !== req.user.id);
  res.json(otherSignals);
});

app.post('/api/rooms/:roomId/signals', authenticateToken, (req: any, res) => {
  const { type, sdp, candidate } = req.body;
  const db = loadDb();
  if (!db.rtcSignaling[req.params.roomId]) {
    db.rtcSignaling[req.params.roomId] = [];
  }

  // Push new signal
  db.rtcSignaling[req.params.roomId].push({
    type,
    sdp,
    candidate,
    senderId: req.user.id
  });

  // Cap signaling queue size
  if (db.rtcSignaling[req.params.roomId].length > 100) {
    db.rtcSignaling[req.params.roomId].shift();
  }

  saveDb(db);
  res.json({ success: true });
});

app.delete('/api/rooms/:roomId/signals', authenticateToken, (req, res) => {
  const db = loadDb();
  delete db.rtcSignaling[req.params.roomId];
  saveDb(db);
  res.json({ success: true });
});

// -- Admin: Audit Logs --
app.get('/api/admin/audit-logs', authenticateToken, requireRole([UserRole.ADMIN]), (req, res) => {
  const db = loadDb();
  res.json(db.auditLogs);
});

// -- Admin: Dashboard Stats --
app.get('/api/admin/stats', authenticateToken, requireRole([UserRole.ADMIN]), (req, res) => {
  const db = loadDb();
  const totalUsers = db.users.length;
  const totalEntrepreneurs = db.users.filter(u => u.role === UserRole.ENTREPRENEUR).length;
  const totalInvestors = db.users.filter(u => u.role === UserRole.INVESTOR).length;
  const totalMeetings = db.meetings.length;
  const totalDocuments = db.documents.length;
  const totalBalance = db.wallets.reduce((sum, w) => sum + w.balance, 0);

  // Calculate volume
  const investmentTransactions = db.transactions.filter(t => t.type === 'investment');
  const totalInvestmentVolume = investmentTransactions.reduce((sum, t) => sum + t.amount, 0);

  res.json({
    totalUsers,
    totalEntrepreneurs,
    totalInvestors,
    totalMeetings,
    totalDocuments,
    totalBalance,
    totalInvestmentVolume,
    recentLogs: db.auditLogs.slice(0, 5)
  });
});

// -- AI Matchmaker Pitch Review --
app.post('/api/ai/match', authenticateToken, async (req: any, res) => {
  const { pitch, goals } = req.body;

  if (!pitch) {
    return res.status(400).json({ error: 'Pitch content description is required.' });
  }

  // Fallback simulation in case GEMINI_API_KEY is not defined
  if (!ai) {
    console.log('Using simulated matchmaking due to missing API key.');
    const simulatedResponse = {
      score: 82,
      analysis: "Your pitch highlights key market vulnerabilities but needs structured financial expansion. The enterprise monetization model is robust, but user acquisition metrics need explicit projections.",
      recommendations: [
        "Include customer acquisition cost (CAC) vs. lifetime value (LTV) projections in slide 6.",
        "Highlight localized security benchmarks explicitly if targeting defense and healthcare clients.",
        "Add detailed profiles for key technical advisors."
      ],
      suggestedFundingStages: ["Seed", "Series A"],
      suggestedInvestors: [
        { name: "Marcus Sterling (Sterling Ventures)", matchReason: "Focuses deeply on AI orchestrators and secure SaaS platforms. Ideal alignment with OmniMind AI's localized deployment schema." },
        { name: "Samantha Chen (Vanguard GP)", matchReason: "Vanguard invests in regulatory-intensive sectors (Healthcare, Digital Health) where data isolation guarantees are critical." }
      ]
    };
    return res.json(simulatedResponse);
  }

  try {
    const prompt = `
      You are an expert venture capitalist and startup strategist. Review the following startup pitch and funding goals, and return a comprehensive analysis in JSON format.
      
      Startup Pitch Description: "${pitch}"
      Funding Goals: "${goals || 'Not specified'}"

      Respond in JSON format with the following fields:
      - score: A number from 0 to 100 indicating pitch readiness.
      - analysis: A structured analysis string of strengths and gaps.
      - recommendations: An array of 3-4 concrete actionable slides/pitch improvements.
      - suggestedFundingStages: An array of recommended investment stages (e.g., Pre-Seed, Seed, Series A).
      - suggestedInvestors: An array of objects, each with 'name' and 'matchReason'. Reference standard investor personas like 'Marcus Sterling (Sterling Ventures)' or 'Samantha Chen (Vanguard Health)' where appropriate based on industry.
    `;

    const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: prompt,
  config: {
    responseMimeType: 'application/json',
  }
});

    const text = response.text || '{}';
    const resultObj = JSON.parse(text);

    const ip = getClientIp(req);
    logAudit(req.user.id, req.user.email, 'AI_PITCH_ANALYZE', 'Executed AI Pitch Matchmaker analysis', ip);

    res.json(resultObj);
  } catch (err: any) {
  console.error("Gemini AI API Error:", err);

  // If Gemini is unavailable, return a simulated response
  if (
    err?.status === 503 ||
    err?.message?.includes("503") ||
    err?.message?.includes("UNAVAILABLE")
  ) {
    return res.json({
      score: 87,
      analysis:
        "Gemini API is temporarily unavailable. This is a simulated VC analysis for demonstration purposes.",
      recommendations: [
        "Clarify the business model.",
        "Add market size and TAM.",
        "Include customer traction.",
        "Strengthen the financial projections."
      ],
      suggestedFundingStages: [
        "Pre-Seed",
        "Seed"
      ],
      suggestedInvestors: [
        {
          name: "Marcus Sterling (Sterling Ventures)",
          matchReason: "AI and Healthcare investments"
        },
        {
          name: "Samantha Chen (Vanguard Health)",
          matchReason: "Digital health specialist"
        }
      ],
      simulated: true
    });
  }

  return res.status(500).json({
    error: "AI engine error while processing pitch.",
    details: err.message
  });
}
});


// -------------------------------------------------------------
// Vite Dev & Production Client Delivery
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const testPort = process.env.NODE_ENV === 'test' ? 3001 : PORT;
  app.listen(testPort, '0.0.0.0', () => {
    console.log(`Nexus Full-Stack platform running on http://localhost:${testPort}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, startServer };
