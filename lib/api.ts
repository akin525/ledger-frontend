import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // ← Add this for cookies/credentials
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }

  // Auth endpoints
  async register(data: {
    email: string
    username: string
    fullName: string
    password: string
    phoneNumber?: string
  }) {
    const response = await this.client.post('/auth/register', data)
    if (response.data.data.token) {
      this.setToken(response.data.data.token)
    }
    return response.data
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password })
    if (response.data.data.token) {
      this.setToken(response.data.data.token)
    }
    return response.data
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me')
    return response.data
  }

  async updateProfile(data: any) {
    const response = await this.client.put('/auth/profile', data)
    return response.data
  }

  async forgotPassword(email: string) {
    const response = await this.client.post('/auth/forgot-password', { email })
    return response.data
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await this.client.post('/auth/reset-password', { token, newPassword })
    return response.data
  }

  logout() {
    this.clearToken()
  }

  // Bills endpoints
  async getBills(params?: { status?: string; type?: string }) {
    const response = await this.client.get('/bills', { params })
    return response.data
  }

  async getBillById(billId: string) {
    const response = await this.client.get(`/bills/${billId}`)
    return response.data
  }

  async createBill(data: any) {
    const response = await this.client.post('/bills', data)
    return response.data
  }

  async updateBillStatus(billId: string, status: string) {
    const response = await this.client.put(`/bills/${billId}/status`, { status })
    return response.data
  }

  async payBill(billId: string, amount?: number) {
    const response = await this.client.post(`/bills/${billId}/pay`, { amount })
    return response.data
  }

  async deleteBill(billId: string) {
    const response = await this.client.delete(`/bills/${billId}`)
    return response.data
  }

  async getBillSummary() {
    const response = await this.client.get('/bills/summary')
    return response.data
  }

  // Friends endpoints
  async getFriends() {
    const response = await this.client.get('/friends')
    return response.data
  }

  async searchUsers(query: string) {
    const response = await this.client.get('/friends/search', { params: { query } })
    return response.data
  }

  async sendFriendRequest(receiverId: string) {
    const response = await this.client.post('/friends/request', { receiverId })
    return response.data
  }

  async getPendingRequests() {
    const response = await this.client.get('/friends/requests')
    return response.data
  }

  async acceptFriendRequest(requestId: string) {
    const response = await this.client.post(`/friends/request/${requestId}/accept`)
    return response.data
  }

  async rejectFriendRequest(requestId: string) {
    const response = await this.client.post(`/friends/request/${requestId}/reject`)
    return response.data
  }

  async removeFriend(friendId: string) {
    const response = await this.client.delete(`/friends/${friendId}`)
    return response.data
  }

  // Transactions endpoints
  async getTransactions(params?: { page?: number; limit?: number; type?: string; status?: string }) {
    const response = await this.client.get('/transactions', { params })
    return response.data
  }

  async getTransactionById(transactionId: string) {
    const response = await this.client.get(`/transactions/${transactionId}`)
    return response.data
  }

  async createTransaction(data: any) {
    const response = await this.client.post('/transactions', data)
    return response.data
  }

  async cancelTransaction(transactionId: string) {
    const response = await this.client.post(`/transactions/${transactionId}/cancel`)
    return response.data
  }

  async getTransactionStats() {
    const response = await this.client.get('/transactions/stats')
    return response.data
  }

  // Conversations endpoints
  async getConversations() {
    const response = await this.client.get('/conversations')
    return response.data
  }

  async getConversationById(conversationId: string) {
    const response = await this.client.get(`/conversations/${conversationId}`)
    return response.data
  }

  async createDirectConversation(participantId: string) {
    const response = await this.client.post('/conversations/direct', { participantId })
    return response.data
  }

  async createGroupConversation(name: string, participantIds: string[]) {
    const response = await this.client.post('/conversations/group', { name, participantIds })
    return response.data
  }

  async getConversationMessages(conversationId: string, params?: { page?: number; limit?: number }) {
    const response = await this.client.get(`/conversations/${conversationId}/messages`, { params })
    return response.data
  }

  async sendMessage(data: any) {
    const response = await this.client.post('/conversations/messages', data)
    return response.data
  }

  async addParticipant(conversationId: string, participantId: string) {
    const response = await this.client.post(`/conversations/${conversationId}/participants`, { participantId })
    return response.data
  }

  async leaveConversation(conversationId: string) {
    const response = await this.client.delete(`/conversations/${conversationId}/leave`)
    return response.data
  }

  // Notifications endpoints
  async getNotifications(params?: { page?: number; limit?: number; isRead?: boolean }) {
    const response = await this.client.get('/notifications', { params })
    return response.data
  }

  async getUnreadCount() {
    const response = await this.client.get('/notifications/unread-count')
    return response.data
  }

  async markAsRead(notificationId: string) {
    const response = await this.client.put(`/notifications/${notificationId}/read`)
    return response.data
  }

  async markAllAsRead() {
    const response = await this.client.put('/notifications/read-all')
    return response.data
  }

  async deleteNotification(notificationId: string) {
    const response = await this.client.delete(`/notifications/${notificationId}`)
    return response.data
  }

  // Organizations endpoints
  async getOrganizations() {
    const response = await this.client.get('/organizations')
    return response.data
  }

  async getOrganizationById(organizationId: string) {
    const response = await this.client.get(`/organizations/${organizationId}`)
    return response.data
  }

  async createOrganization(data: any) {
    const response = await this.client.post('/organizations', data)
    return response.data
  }

  async updateOrganization(organizationId: string, data: any) {
    const response = await this.client.put(`/organizations/${organizationId}`, data)
    return response.data
  }

  async addOrganizationMember(organizationId: string, userId: string, role: string) {
    const response = await this.client.post(`/organizations/${organizationId}/members`, { userId, role })
    return response.data
  }

  async removeOrganizationMember(organizationId: string, memberId: string) {
    const response = await this.client.delete(`/organizations/${organizationId}/members/${memberId}`)
    return response.data
  }

  async updateMemberRole(organizationId: string, memberId: string, role: string) {
    const response = await this.client.put(`/organizations/${organizationId}/members/${memberId}/role`, { role })
    return response.data
  }

  async leaveOrganization(organizationId: string) {
    const response = await this.client.delete(`/organizations/${organizationId}/leave`)
    return response.data
  }

  async deleteOrganization(organizationId: string) {
    const response = await this.client.delete(`/organizations/${organizationId}`)
    return response.data
  }
}

export const api = new ApiClient()