import { io, Socket } from 'socket.io-client'
import { Message } from '@/types'

const WS_URL = 'https://bills-ledger.dev.5starcompany.com.ng'

class SocketClient {
  private socket: Socket | null = null
  private token: string | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected')
      return this.socket
    }

    this.token = token
    console.log('Connecting to WebSocket server:', WS_URL)

    this.socket = io(WS_URL, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000,
      autoConnect: true,
    })

    this.setupConnectionListeners()

    return this.socket
  }

  private setupConnectionListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully')
      console.log('Socket ID:', this.socket?.id)
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason)

      // Attempt to reconnect if disconnected unexpectedly
      if (reason === 'io server disconnect') {
        // Server disconnected the socket, reconnect manually
        this.socket?.connect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message)
      this.reconnectAttempts++

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
      }
    })

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error)
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('✅ WebSocket reconnected after', attemptNumber, 'attempts')
      this.reconnectAttempts = 0
    })

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Reconnection attempt:', attemptNumber)
    })

    this.socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket reconnection failed')
    })
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...')
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
      this.token = null
      this.reconnectAttempts = 0
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  // Conversation events
  joinConversation(conversationId: string) {
    if (!this.socket?.connected) {
      console.error('Cannot join conversation: Socket not connected')
      return
    }
    console.log('📥 Joining conversation:', conversationId)
    this.socket.emit('join_conversation', conversationId)
  }

  leaveConversation(conversationId: string) {
    if (!this.socket?.connected) {
      console.error('Cannot leave conversation: Socket not connected')
      return
    }
    console.log('📤 Leaving conversation:', conversationId)
    this.socket.emit('leave_conversation', conversationId)
  }

  sendMessage(data: {
    conversationId: string
    content: string
    type?: string
    attachments?: string[]
  }) {
    if (!this.socket?.connected) {
      console.error('Cannot send message: Socket not connected')
      throw new Error('Socket not connected')
    }
    console.log('📨 Sending message:', data)
    this.socket.emit('send_message', {
      conversationId: data.conversationId,
      content: data.content,
      type: data.type || 'TEXT',
      attachments: data.attachments || [],
    })
  }

  sendTyping(conversationId: string, isTyping: boolean) {
    if (!this.socket?.connected) {
      return
    }
    this.socket.emit('typing', { conversationId, isTyping })
  }

  // Bill events
  sendBillUpdate(billId: string, status: string) {
    if (!this.socket?.connected) {
      console.error('Cannot send bill update: Socket not connected')
      return
    }
    this.socket.emit('bill_update', { billId, status })
  }

  // Transaction events
  sendTransactionCreated(transactionId: string) {
    if (!this.socket?.connected) {
      console.error('Cannot send transaction notification: Socket not connected')
      return
    }
    this.socket.emit('transaction_created', { transactionId })
  }

  // Friend request events
  sendFriendRequest(receiverId: string) {
    if (!this.socket?.connected) {
      console.error('Cannot send friend request: Socket not connected')
      return
    }
    this.socket.emit('friend_request_sent', { receiverId })
  }

  // Event listeners
  onNewMessage(callback: (message: Message) => void) {
    if (!this.socket) {
      console.error('Cannot listen for messages: Socket not initialized')
      return
    }
    this.socket.on('new_message', (message: Message) => {
      console.log('📩 New message received:', message)
      callback(message)
    })
  }

  onUserTyping(callback: (data: {
    userId: string
    conversationId: string
    isTyping: boolean
  }) => void) {
    if (!this.socket) return
    this.socket.on('user_typing', callback)
  }

  onBillUpdated(callback: (data: {
    billId: string
    status: string
    updatedBy: string
  }) => void) {
    if (!this.socket) return
    this.socket.on('bill_updated', callback)
  }

  onTransactionReceived(callback: (transaction: any) => void) {
    if (!this.socket) return
    this.socket.on('transaction_received', callback)
  }

  onUserStatusChanged(callback: (data: {
    userId: string
    status: 'online' | 'offline'
  }) => void) {
    if (!this.socket) return
    this.socket.on('user_status_changed', callback)
  }

  onFriendRequestReceived(callback: (data: { senderId: string }) => void) {
    if (!this.socket) return
    this.socket.on('friend_request_received', callback)
  }

  onNotification(callback: (notification: any) => void) {
    if (!this.socket) return
    this.socket.on('notification', callback)
  }

  // Remove listeners - safer implementation
  offNewMessage() {
    if (this.socket) {
      this.socket.off('new_message')
    }
  }

  offUserTyping() {
    if (this.socket) {
      this.socket.off('user_typing')
    }
  }

  offBillUpdated() {
    if (this.socket) {
      this.socket.off('bill_updated')
    }
  }

  offTransactionReceived() {
    if (this.socket) {
      this.socket.off('transaction_received')
    }
  }

  offUserStatusChanged() {
    if (this.socket) {
      this.socket.off('user_status_changed')
    }
  }

  offFriendRequestReceived() {
    if (this.socket) {
      this.socket.off('friend_request_received')
    }
  }

  offNotification() {
    if (this.socket) {
      this.socket.off('notification')
    }
  }

  offAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners()
    }
  }

  // Utility methods
  reconnect() {
    if (this.socket && !this.socket.connected && this.token) {
      console.log('🔄 Manual reconnection...')
      this.socket.connect()
    }
  }

  getConnectionState(): 'connected' | 'disconnected' | 'connecting' {
    if (!this.socket) return 'disconnected'
    if (this.socket.connected) return 'connected'
    if (this.socket.disconnected) return 'disconnected'
    return 'connecting'
  }
}

export const socketClient = new SocketClient()
