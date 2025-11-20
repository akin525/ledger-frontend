'use client'

import { useEffect, useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api'
import { socketClient } from '@/lib/socket'
import { getInitials, cn } from '@/lib/utils'
import { Conversation, Message, User } from '@/types'
import { toast } from 'sonner'
import {
    MessageSquare,
    Send,
    Plus,
    Search,
    Users,
    Phone,
    Video,
    Loader2,
    Paperclip,
    Smile,
    CheckCheck,
    MoreVertical,
    Archive,
    Trash2,
    Pin,
    Bell,
    Info,
    Image as ImageIcon,
    Mic,
    Circle,
    ArrowLeft,
    Settings2,
    Filter,
} from 'lucide-react'

type LastMessageUnion = string | Message | undefined | null

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [messageInput, setMessageInput] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map())
    const [showNewConversation, setShowNewConversation] = useState(false)
    const [friends, setFriends] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [socketConnected, setSocketConnected] = useState(false)
    const [conversationSearchQuery, setConversationSearchQuery] = useState('')
    const [showMobileSidebar, setShowMobileSidebar] = useState(true)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout>()
    const isSocketSetup = useRef(false)
    const previousConversationId = useRef<string | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        fetchCurrentUser()
    }, [])

    useEffect(() => {
        if (currentUser && !isSocketSetup.current) {
            setupWebSocket()
            isSocketSetup.current = true
        }
    }, [currentUser])

    useEffect(() => {
        if (currentUser) {
            fetchConversations()
            fetchFriends()
        }
    }, [currentUser])

    useEffect(() => {
        if (selectedConversation) {
            handleConversationSelect(selectedConversation)
            setShowMobileSidebar(false)
        }
    }, [selectedConversation?.id])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        return () => {
            if (previousConversationId.current) {
                socketClient.leaveConversation(previousConversationId.current)
            }
            socketClient.offNewMessage()
            socketClient.offUserTyping()
            socketClient.offUserStatusChanged()
        }
    }, [])

    const fetchCurrentUser = async () => {
        try {
            const response = await api.getCurrentUser()
            setCurrentUser(response.data)
        } catch (error) {
            console.error('Failed to fetch current user:', error)
            toast.error('Failed to load user data')
        }
    }

    const fetchConversations = async () => {
        try {
            setLoading(true)
            const response = await api.getConversations()
            setConversations(response.data || [])
        } catch (error) {
            console.error('Failed to fetch conversations:', error)
            toast.error('Failed to load conversations')
        } finally {
            setLoading(false)
        }
    }

    const fetchFriends = async () => {
        try {
            const response = await api.getFriends()
            setFriends(response.data || [])
        } catch (error) {
            console.error('Failed to fetch friends:', error)
        }
    }

    const setupWebSocket = () => {
        const token = localStorage.getItem('token')
        if (!token) {
            console.error('No authentication token found')
            toast.error('Please login to use messaging')
            return
        }

        socketClient.connect(token)

        setTimeout(() => {
            const connected = socketClient.isConnected()
            setSocketConnected(connected)
            if (connected) {
                toast.success('Connected', { duration: 2000 })
            }
        }, 1000)

        socketClient.onNewMessage((message: Message) => {
            if (selectedConversation && message.conversationId === selectedConversation.id) {
                setMessages((prev) => {
                    if (prev.some((m) => m.id === message.id)) return prev
                    return [...prev, message]
                })
            }

            setConversations((prev) =>
                prev
                    .map((conv) => {
                        if (conv.id === message.conversationId) {
                            return {
                                ...conv,
                                lastMessage: message,
                                lastMessageAt: message.createdAt,
                                unreadCount:
                                    selectedConversation?.id === conv.id
                                        ? conv.unreadCount
                                        : (conv.unreadCount || 0) + 1,
                            }
                        }
                        return conv
                    })
                    .sort((a, b) => {
                        const aTime = new Date(a.lastMessageAt || a.createdAt).getTime()
                        const bTime = new Date(b.lastMessageAt || b.createdAt).getTime()
                        return bTime - aTime
                    })
            )
        })

        socketClient.onUserTyping((data: {
            userId: string
            conversationId: string
            isTyping: boolean
        }) => {
            if (!selectedConversation || data.conversationId !== selectedConversation.id) return
            if (data.userId === currentUser?.id) return

            if (data.isTyping) {
                const participant = selectedConversation.participants?.find(
                    (p) => p.userId === data.userId
                )
                const username = participant?.user?.fullName || 'Someone'

                setTypingUsers((prev) => {
                    const newMap = new Map(prev)
                    newMap.set(data.userId, username)
                    return newMap
                })
            } else {
                setTypingUsers((prev) => {
                    const newMap = new Map(prev)
                    newMap.delete(data.userId)
                    return newMap
                })
            }
        })

        socketClient.onUserStatusChanged((data) => {
            console.log('User status:', data)
        })
    }

    const handleConversationSelect = (conversation: Conversation) => {
        if (previousConversationId.current && previousConversationId.current !== conversation.id) {
            socketClient.leaveConversation(previousConversationId.current)
        }

        setMessages(conversation.messages || [])
        setTypingUsers(new Map())

        setConversations((prev) =>
            prev.map((conv) => (conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv))
        )

        if (socketClient.isConnected()) {
            socketClient.joinConversation(conversation.id)
            previousConversationId.current = conversation.id
        } else {
            toast.error('Connection unavailable')
        }
    }

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault()

        if (!messageInput.trim() || !selectedConversation || sending) return
        if (!socketClient.isConnected()) {
            toast.error('Not connected')
            return
        }

        const tempMessage = messageInput.trim()
        setSending(true)

        try {
            setMessageInput('')
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto'
            }
            socketClient.sendTyping(selectedConversation.id, false)

            const messageData = {
                conversationId: selectedConversation.id,
                content: tempMessage,
                type: 'TEXT',
            }

            socketClient.sendMessage(messageData)
        } catch (error: any) {
            toast.error('Failed to send message')
            setMessageInput(tempMessage)
        } finally {
            setSending(false)
        }
    }

    const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        setMessageInput(value)

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
        }

        if (!selectedConversation || !socketClient.isConnected()) return

        if (value.trim()) {
            socketClient.sendTyping(selectedConversation.id, true)
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        typingTimeoutRef.current = setTimeout(() => {
            socketClient.sendTyping(selectedConversation.id, false)
        }, 2000)
    }

    const handleCreateConversation = async (friendId: string) => {
        try {
            const response = await api.createDirectConversation(friendId)
            const newConversation = response.data

            setConversations([newConversation, ...conversations])
            setSelectedConversation(newConversation)
            setShowNewConversation(false)
            setSearchQuery('')
            toast.success('Conversation created!')
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create conversation')
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const getConversationName = (conversation: Conversation) => {
        if (conversation.type === 'GROUP') {
            return conversation.name || 'Group Chat'
        }
        const otherParticipant = conversation.participants?.find((p) => p.userId !== currentUser?.id)
        return otherParticipant?.user?.fullName || 'Unknown'
    }

    const getConversationAvatar = (conversation: Conversation) => {
        if (conversation.type === 'GROUP') {
            return conversation.avatar || null
        }
        const otherParticipant = conversation.participants?.find((p) => p.userId !== currentUser?.id)
        return otherParticipant?.user?.avatar || null
    }

    const getTypingText = () => {
        const users = Array.from(typingUsers.values())
        if (users.length === 0) return null
        if (users.length === 1) return `${users[0]} is typing...`
        if (users.length === 2) return `${users[0]} and ${users[1]} are typing...`
        return `${users[0]} and ${users.length - 1} others are typing...`
    }

    const formatMessageTime = (date: string | Date) => {
        const messageDate = new Date(date)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (messageDate.toDateString() === today.toDateString()) {
            return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday'
        } else {
            return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' })
        }
    }

    const filteredFriends = friends.filter(
        (friend) =>
            friend.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredConversations = conversations.filter((conv) =>
        getConversationName(conv).toLowerCase().includes(conversationSearchQuery.toLowerCase())
    )

    const getLastMessagePreview = (lastMessage: LastMessageUnion): string => {
        if (!lastMessage) return 'No messages yet'
        if (typeof lastMessage === 'string') return lastMessage
        return lastMessage.content ?? ''
    }

    const getLastMessageTime = (conversation: Conversation): string | null => {
        const iso =
            conversation.lastMessageAt ||
            (typeof conversation.lastMessage === 'object' ? conversation.lastMessage?.createdAt : null)

        if (!iso) return null
        try {
            return formatMessageTime(iso)
        } catch {
            return null
        }
    }

    const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="text-center space-y-4">
                    <div className="relative mx-auto w-20 h-20">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
                        <MessageSquare className="absolute inset-0 m-auto h-8 w-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground font-medium">Loading messages...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-6">
            {/* Modern Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-20"></div>
                            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                                <MessageSquare className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                                Messages
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-muted-foreground">
                                    {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                                </p>
                                {socketConnected && (
                                    <>
                                        <span className="text-muted-foreground">•</span>
                                        <div className="flex items-center gap-1.5">
                                            <div className="relative">
                                                <Circle className="h-2 w-2 text-green-500 fill-green-500" />
                                                <Circle className="h-2 w-2 text-green-500 fill-green-500 absolute inset-0 animate-ping" />
                                            </div>
                                            <span className="text-xs text-green-600 font-medium">Connected</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <Button
                    onClick={() => setShowNewConversation(true)}
                    size="default"
                    className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                </Button>
            </div>

            {/* Main Chat Interface */}
            <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-16rem)]">
                {/* Sidebar - Conversations List */}
                <div
                    className={cn(
                        'lg:col-span-4 flex flex-col h-full',
                        !showMobileSidebar && selectedConversation && 'hidden lg:flex'
                    )}
                >
                    <Card className="flex-1 flex flex-col overflow-hidden border-2 shadow-xl">
                        {/* Sidebar Header */}
                        <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-white space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h2 className="font-bold text-lg">Chats</h2>
                                    {totalUnread > 0 && (
                                        <Badge className="bg-red-500 text-white rounded-full px-2">
                                            {totalUnread}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Settings2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search conversations..."
                                    value={conversationSearchQuery}
                                    onChange={(e) => setConversationSearchQuery(e.target.value)}
                                    className="pl-9 h-10 bg-white border-2 focus-visible:ring-2"
                                />
                            </div>
                        </div>

                        {/* Conversations List */}
                        <ScrollArea className="flex-1">
                            {filteredConversations.length === 0 ? (
                                <div className="text-center py-16 px-6">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-4 shadow-inner">
                                        <MessageSquare className="h-10 w-10 text-gray-400" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">No conversations</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {conversationSearchQuery
                                            ? 'Try a different search'
                                            : 'Start chatting with your friends'}
                                    </p>
                                    {!conversationSearchQuery && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowNewConversation(true)}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            New Chat
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {filteredConversations.map((conversation) => {
                                        const isActive = selectedConversation?.id === conversation.id
                                        const hasUnread = (conversation.unreadCount || 0) > 0

                                        return (
                                            <div
                                                key={conversation.id}
                                                onClick={() => setSelectedConversation(conversation)}
                                                className={cn(
                                                    'p-4 cursor-pointer transition-all relative group border-l-4',
                                                    isActive
                                                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-blue-500'
                                                        : 'border-l-transparent hover:bg-gray-50'
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Avatar */}
                                                    <div className="relative flex-shrink-0">
                                                        <Avatar
                                                            className={cn(
                                                                'h-14 w-14 border-2 transition-all',
                                                                isActive
                                                                    ? 'border-blue-500 shadow-lg'
                                                                    : 'border-gray-200'
                                                            )}
                                                        >
                                                            <AvatarImage
                                                                src={getConversationAvatar(conversation) || undefined}
                                                            />
                                                            <AvatarFallback className="font-semibold text-sm">
                                                                {conversation.type === 'GROUP' ? (
                                                                    <Users className="h-6 w-6" />
                                                                ) : (
                                                                    getInitials(getConversationName(conversation))
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                                                        {hasUnread && (
                                                            <Badge
                                                                variant="destructive"
                                                                className="absolute -top-1 -right-1 h-6 min-w-6 px-2 rounded-full shadow-lg"
                                                            >
                                                                {conversation.unreadCount}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between mb-1">
                                                            <h3 className="font-semibold text-sm truncate">
                                                                {getConversationName(conversation)}
                                                            </h3>
                                                            {getLastMessageTime(conversation) && (
                                                                <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                                                    {getLastMessageTime(conversation)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p
                                                            className={cn(
                                                                'text-sm truncate',
                                                                hasUnread
                                                                    ? 'font-semibold text-foreground'
                                                                    : 'text-muted-foreground'
                                                            )}
                                                        >
                                                            {getLastMessagePreview(conversation.lastMessage as any)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Hover Menu */}
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 bg-white shadow-md"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem>
                                                                <Pin className="h-4 w-4 mr-2" />
                                                                Pin Chat
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Bell className="h-4 w-4 mr-2" />
                                                                Mute
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Archive className="h-4 w-4 mr-2" />
                                                                Archive
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive">
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    </Card>
                </div>

                {/* Chat Area */}
                <div
                    className={cn(
                        'lg:col-span-8 flex flex-col h-full',
                        showMobileSidebar && selectedConversation && 'hidden lg:flex'
                    )}
                >
                    <Card className="flex-1 flex flex-col overflow-hidden border-2 shadow-xl">
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b bg-gradient-to-r from-white to-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="lg:hidden"
                                                onClick={() => setShowMobileSidebar(true)}
                                            >
                                                <ArrowLeft className="h-5 w-5" />
                                            </Button>
                                            <div className="relative">
                                                <Avatar className="h-12 w-12 border-2 border-gray-200 shadow-md">
                                                    <AvatarImage
                                                        src={getConversationAvatar(selectedConversation) || undefined}
                                                    />
                                                    <AvatarFallback className="font-semibold">
                                                        {selectedConversation.type === 'GROUP' ? (
                                                            <Users className="h-5 w-5" />
                                                        ) : (
                                                            getInitials(getConversationName(selectedConversation))
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">
                                                    {getConversationName(selectedConversation)}
                                                </h3>
                                                {getTypingText() ? (
                                                    <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                                                        <div className="flex gap-1">
                                                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                                                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                                                        </div>
                                                        <span>{getTypingText()}</span>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                        <Circle className="h-2 w-2 text-green-500 fill-green-500" />
                                                        {selectedConversation.type === 'GROUP'
                                                            ? `${selectedConversation.participants?.length || 0} members`
                                                            : 'Active now'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <Phone className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 hover:bg-purple-50 hover:text-purple-600"
                                            >
                                                <Video className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 hover:bg-gray-50"
                                            >
                                                <Info className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-gray-50/30 to-white">
                                    {messages.length === 0 ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">
                                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify
-center mx-auto mb-4 shadow-lg">
                                                    <MessageSquare className="h-12 w-12 text-blue-500" />
                                                </div>
                                                <h3 className="text-xl font-bold mb-2">Start the conversation</h3>
                                                <p className="text-sm text-muted-foreground max-w-sm">
                                                    Send your first message to{' '}
                                                    <span className="font-medium">
                                                        {getConversationName(selectedConversation)}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 max-w-4xl mx-auto">
                                            {messages.map((message, index) => {
                                                const isOwn = message.senderId === currentUser?.id
                                                const showAvatar =
                                                    !isOwn &&
                                                    (index === 0 || messages[index - 1]?.senderId !== message.senderId)
                                                const showTime =
                                                    index === messages.length - 1 ||
                                                    messages[index + 1]?.senderId !== message.senderId

                                                return (
                                                    <div
                                                        key={message.id}
                                                        className={cn(
                                                            'flex gap-3 items-end animate-in fade-in slide-in-from-bottom-4 duration-300',
                                                            isOwn ? 'justify-end' : 'justify-start'
                                                        )}
                                                    >
                                                        {!isOwn && (
                                                            <div className="w-8 flex-shrink-0 mb-1">
                                                                {showAvatar && (
                                                                    <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                                                                        <AvatarImage src={message.sender?.avatar} />
                                                                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-100 to-purple-100">
                                                                            {getInitials(message.sender?.fullName || 'U')}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div
                                                            className={cn(
                                                                'flex flex-col max-w-[70%] group',
                                                                isOwn ? 'items-end' : 'items-start'
                                                            )}
                                                        >
                                                            {!isOwn &&
                                                                showAvatar &&
                                                                selectedConversation.type === 'GROUP' && (
                                                                    <span className="text-xs font-semibold text-gray-600 mb-1 px-2">
                                                                        {message.sender?.fullName}
                                                                    </span>
                                                                )}

                                                            <div className="relative">
                                                                {/* Message Bubble */}
                                                                <div
                                                                    className={cn(
                                                                        'rounded-2xl px-4 py-2.5 shadow-sm transition-all',
                                                                        isOwn
                                                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md'
                                                                            : 'bg-white border-2 border-gray-100 text-gray-900 rounded-bl-md'
                                                                    )}
                                                                >
                                                                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                                                        {message.content}
                                                                    </p>
                                                                </div>

                                                                {/* Hover Actions */}
                                                                <div
                                                                    className={cn(
                                                                        'absolute top-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
                                                                        isOwn ? '-left-20' : '-right-20'
                                                                    )}
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 bg-white shadow-md hover:bg-gray-100"
                                                                    >
                                                                        <Smile className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-7 w-7 bg-white shadow-md hover:bg-gray-100"
                                                                            >
                                                                                <MoreVertical className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem>Reply</DropdownMenuItem>
                                                                            <DropdownMenuItem>Forward</DropdownMenuItem>
                                                                            <DropdownMenuItem>Copy</DropdownMenuItem>
                                                                            {isOwn && (
                                                                                <>
                                                                                    <DropdownMenuSeparator />
                                                                                    <DropdownMenuItem className="text-destructive">
                                                                                        Delete
                                                                                    </DropdownMenuItem>
                                                                                </>
                                                                            )}
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </div>

                                                            {showTime && (
                                                                <div
                                                                    className={cn(
                                                                        'flex items-center gap-1.5 mt-1.5 px-1',
                                                                        isOwn ? 'flex-row-reverse' : 'flex-row'
                                                                    )}
                                                                >
                                                                    <span className="text-xs text-muted-foreground font-medium">
                                                                        {formatMessageTime(message.createdAt)}
                                                                    </span>
                                                                    {isOwn && (
                                                                        <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    )}
                                </ScrollArea>

                                {/* Message Input Area */}
                                <div className="border-t p-4 bg-white">
                                    <form onSubmit={handleSendMessage}>
                                        <div className="flex items-end gap-2">
                                            {/* Attachment Button */}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="flex-shrink-0 h-10 w-10 hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <Paperclip className="h-5 w-5" />
                                            </Button>

                                            {/* Image Button */}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="flex-shrink-0 h-10 w-10 hover:bg-purple-50 hover:text-purple-600"
                                            >
                                                <ImageIcon className="h-5 w-5" />
                                            </Button>

                                            {/* Input Area */}
                                            <div className="flex-1 relative">
                                                <Textarea
                                                    ref={textareaRef}
                                                    placeholder="Type your message..."
                                                    value={messageInput}
                                                    onChange={handleTyping}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault()
                                                            handleSendMessage()
                                                        }
                                                    }}
                                                    disabled={sending || !socketConnected}
                                                    className="min-h-[44px] max-h-[120px] resize-none pr-20 py-3 border-2 focus-visible:ring-2 rounded-2xl"
                                                    rows={1}
                                                />
                                                {/* Emoji and Voice Buttons */}
                                                <div className="absolute right-2 bottom-2 flex gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-yellow-50 hover:text-yellow-600"
                                                    >
                                                        <Smile className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Mic className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Send Button */}
                                            <Button
                                                type="submit"
                                                disabled={sending || !messageInput.trim() || !socketConnected}
                                                size="icon"
                                                className="flex-shrink-0 h-11 w-11 rounded-xl shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                                            >
                                                {sending ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    <Send className="h-5 w-5" />
                                                )}
                                            </Button>
                                        </div>

                                        {/* Connection Warning */}
                                        {!socketConnected && (
                                            <div className="mt-2 text-xs text-amber-600 flex items-center gap-1.5">
                                                <Circle className="h-2 w-2 fill-amber-600" />
                                                Reconnecting...
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </>
                        ) : (
                            // Empty State
                            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-white">
                                <div className="text-center px-6 max-w-md">
                                    <div className="relative mx-auto w-32 h-32 mb-6">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                                        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-xl">
                                            <MessageSquare className="h-16 w-16 text-blue-500" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                        Your Messages
                                    </h3>
                                    <p className="text-muted-foreground mb-6 leading-relaxed">
                                        Select a conversation from the sidebar or start a new chat with your friends
                                    </p>
                                    <Button
                                        onClick={() => setShowNewConversation(true)}
                                        size="lg"
                                        className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    >
                                        <Plus className="h-5 w-5 mr-2" />
                                        Start New Chat
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* New Conversation Dialog */}
            <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Start New Conversation</DialogTitle>
                        <DialogDescription>Choose a friend to start chatting with</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search friends..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-11 border-2"
                            />
                        </div>

                        <Separator />

                        {/* Friends List */}
                        <ScrollArea className="h-[400px] pr-4">
                            {filteredFriends.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-4 shadow-inner">
                                        <Users className="h-10 w-10 text-gray-400" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">
                                        {searchQuery ? 'No friends found' : 'No friends yet'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {searchQuery
                                            ? 'Try searching for someone else'
                                            : 'Add friends to start conversations'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredFriends.map((friend) => (
                                        <div
                                            key={friend.id}
                                            onClick={() => handleCreateConversation(friend.friendId || friend.id)}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all group border-2 border-transparent hover:border-blue-100"
                                        >
                                            <div className="relative">
                                                <Avatar className="h-12 w-12 border-2 border-gray-200 group-hover:border-blue-300 transition-all shadow-sm">
                                                    <AvatarImage src={friend.avatar} />
                                                    <AvatarFallback className="font-semibold bg-gradient-to-br from-blue-100 to-purple-100">
                                                        {getInitials(friend.fullName || 'U')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate group-hover:text-blue-700 transition-colors">
                                                    {friend.fullName}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    @{friend.username}
                                                </p>
                                            </div>
                                            <MessageSquare className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
