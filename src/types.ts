/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  INVESTOR = 'investor',
  ENTREPRENEUR = 'entrepreneur',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  years: number;
}

export interface Profile {
  userId: string;
  name: string;
  avatar: string; // Base64 or URL
  bio: string;
  industry: string;
  skills: string[];
  experience: string;
  experiences: ExperienceItem[];
  // Entrepreneur fields
  startupName?: string;
  startupDescription?: string;
  pitchDeckUrl?: string;
  fundingStage?: string; // 'Pre-Seed' | 'Seed' | 'Series A' etc.
  fundingGoal?: number;
  fundingRaised?: number;
  // Investor fields
  totalInvested?: number;
  investmentsCount?: number;
  preferredStages?: string[];
  preferredIndustries?: string[];
  ticketSizeMin?: number;
  ticketSizeMax?: number;
}

export interface Meeting {
  id: string;
  requesterId: string;
  receiverId: string;
  requesterName: string;
  receiverName: string;
  title: string;
  description: string;
  date: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:MM'
  duration: number; // in minutes
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  videoRoomId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSignature {
  userId: string;
  name: string;
  title: string;
  signedAt: string;
  ip: string;
}

export interface DocumentVersion {
  version: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface DocumentItem {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  url: string; // can be base64 or file content mock
  category: 'pitch_deck' | 'financials' | 'term_sheet' | 'cap_table' | 'legal';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  electronicSignatures: DocumentSignature[];
  versions: DocumentVersion[];
  createdAt: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'investment';
  amount: number;
  targetUserId?: string;
  targetName?: string; // Startup or Investor name
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'meeting' | 'document' | 'wallet' | 'system' | 'message';
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export interface CallSession {
  roomId: string;
  participants: string[];
  active: boolean;
  startedAt: string;
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  ip: string;
  createdAt: string;
}
