export interface User {
  id: string
  email: string
  username: string
  fullName: string
  phoneNumber?: string
  avatar?: string
  bio?: string
  isVerified: boolean
  isPremium: boolean
  premiumUntil?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
  }
}

export interface Bill {
  id: string
  title: string
  description?: string
  totalAmount: number
  currency: string
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED' | 'OVERDUE'
  dueDate?: string
  createdAt: string
  updatedAt: string
  creatorId: string
  creator: User
  participants: BillParticipant[]
  conversationId?: string
}

export interface BillParticipant {
  id: string
  userId: string
  billId: string
  amount: number
  isPaid: boolean
  paidAmount: number
  paidAt?: string
  user: User
}

export interface Transaction {
  id: string
  senderId: string
  receiverId: string
  amount: number
  currency: string
  description?: string
  type: 'BILL_PAYMENT' | 'DIRECT_TRANSFER' | 'REFUND'
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  billId?: string
  createdAt: string
  updatedAt: string
  sender: User
  receiver: User
  bill?: Bill
}

export interface Friend {
  id: string
  userId: string
  avatar:string
  friendId: string
  fullName: string
  username: string
  createdAt: string
  isPremium: string
  friend: User
}

export interface FriendRequest {
  id: string
  senderId: string
  receiverId: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  sender: User
  receiver: User
}

// types/index.ts
export interface Conversation {
  id: string
  type: 'DIRECT' | 'GROUP'
  name?: string
  avatar?: string | null
  lastMessage?: string | Message | null   // <- union
  lastMessageAt?: string | null
  unreadCount: number
  createdAt: string
  updatedAt: string
  participants?: ConversationParticipant[]
  messages?: Message[]
}

export interface ConversationParticipant {
  id: string
  userId: string
  conversationId: string
  joinedAt: string
  user: User
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'BILL'
  attachments?: string[]
  createdAt: string
  sender: User
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data?: any
  isRead: boolean
  createdAt: string
}

export interface Organization {
  id: string
  name: string
  description?: string
  avatar?: string
  isActive: boolean
  createdAt: string
  creatorId: string
  creator: User
  members: OrganizationMember[]
}

export interface OrganizationMember {
  id: string
  userId: string
  organizationId: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  joinedAt: string
  user: User
}

export interface BillSummary {
  totalOwed: number
  totalOwing: number
  netBalance: number
  totalBills: number
  pendingBills: number
}

export interface TransactionStats {
  totalSent: number
  totalReceived: number
  netBalance: number
  totalTransactions: number
  sentCount: number
  receivedCount: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}