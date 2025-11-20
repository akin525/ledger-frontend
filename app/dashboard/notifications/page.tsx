'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import { Notification } from '@/types'
import { toast } from 'sonner'
import {
  Bell,
  Check,
  Trash2,
  CheckCheck,
  UserPlus,
  Receipt,
  DollarSign,
  Users,
  MessageSquare,
  AlertCircle,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

type NotificationFilter = 'all' | 'unread'

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [unreadCount, setUnreadCount] = useState(0)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  })

  useEffect(() => {
    fetchNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, pagination.page])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      }
      if (filter === 'unread') params.isRead = false

      const response = await api.getNotifications(params)

      // Parse the nested response structure
      const data = response.data?.data || response.data
      const notificationsList = data?.notifications || []
      const count = data?.unreadCount ?? 0
      const paginationData = data?.pagination

      setNotifications(notificationsList)
      setUnreadCount(count)

      if (paginationData) {
        setPagination({
          page: paginationData.page || 1,
          limit: paginationData.limit || 20,
          total: paginationData.total || 0,
          totalPages: paginationData.totalPages || 1,
        })
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.markAsRead(notificationId)
      // Optimistic update
      setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
      toast.success('Marked as read')
    } catch (error: any) {
      toast.error('Failed to mark as read')
      fetchNotifications() // revert on error
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllAsRead()
      toast.success('All notifications marked as read')
      fetchNotifications()
    } catch (error: any) {
      toast.error('Failed to mark all as read')
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await api.deleteNotification(notificationId)
      // Optimistic update
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }))
      toast.success('Notification deleted')
    } catch (error: any) {
      toast.error('Failed to delete notification')
      fetchNotifications() // revert on error
    }
  }

  const getNotificationDetails = (notification: Notification) => {
    const type = (notification.type || '').toUpperCase()
    let icon = <Bell className="h-5 w-5" />
    let bgColor = 'bg-gray-100'
    let iconColor = 'text-gray-600'

    switch (type) {
      case 'FRIEND_REQUEST':
        icon = <UserPlus className="h-5 w-5" />
        bgColor = 'bg-blue-100'
        iconColor = 'text-blue-600'
        break
      case 'FRIEND_ACCEPTED':
        icon = <UserPlus className="h-5 w-5" />
        bgColor = 'bg-green-100'
        iconColor = 'text-green-600'
        break
      case 'BILL_CREATED':
      case 'BILL_UPDATED':
        icon = <Receipt className="h-5 w-5" />
        bgColor = 'bg-purple-100'
        iconColor = 'text-purple-600'
        break
      case 'BILL_PAYMENT':
      case 'PAYMENT_RECEIVED':
        icon = <DollarSign className="h-5 w-5" />
        bgColor = 'bg-green-100'
        iconColor = 'text-green-600'
        break
      case 'ORGANIZATION_INVITE':
        icon = <Users className="h-5 w-5" />
        bgColor = 'bg-indigo-100'
        iconColor = 'text-indigo-600'
        break
      case 'MESSAGE':
        icon = <MessageSquare className="h-5 w-5" />
        bgColor = 'bg-cyan-100'
        iconColor = 'text-cyan-600'
        break
      case 'ALERT':
        icon = <AlertCircle className="h-5 w-5" />
        bgColor = 'bg-red-100'
        iconColor = 'text-red-600'
        break
      default:
        icon = <Info className="h-5 w-5" />
    }

    return { icon, bgColor, iconColor }
  }

  const renderMetadata = (notification: Notification) => {
    const meta = notification.metadata as any
    if (!meta) return null

    const parts: string[] = []

    if (meta.amount) {
      const amount = (meta.amount / 100).toFixed(2)
      parts.push(`${amount}`)
    }

    if (meta.billId) {
      parts.push(`Bill: ${meta.billId.slice(0, 8)}...`)
    }

    if (meta.organizationId) {
      parts.push(`Org: ${meta.organizationId.slice(0, 8)}...`)
    }

    if (parts.length === 0) return null

    return (
        <div className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
          {parts.map((part, i) => (
              <span key={i}>{part}</span>
          ))}
        </div>
    )
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((p) => ({ ...p, page: newPage }))
    }
  }

  if (loading && notifications.length === 0) {
    return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    )
  }

  return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                  : 'All caught up! 🎉'}
            </p>
          </div>
          {unreadCount > 0 && (
              <Button onClick={handleMarkAllAsRead} size="sm">
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
          )}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => {
                setFilter('all')
                setPagination((p) => ({ ...p, page: 1 }))
              }}
              size="sm"
          >
            All
            {filter === 'all' && pagination.total > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pagination.total}
                </Badge>
            )}
          </Button>
          <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => {
                setFilter('unread')
                setPagination((p) => ({ ...p, page: 1 }))
              }}
              size="sm"
          >
            Unread
            {unreadCount > 0 && (
                <Badge
                    variant={filter === 'unread' ? 'secondary' : 'default'}
                    className="ml-2"
                >
                  {unreadCount}
                </Badge>
            )}
          </Button>
        </div>

        {/* Notifications List */}
        <Card>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Bell className="h-8 w-8 opacity-50" />
                  </div>
                  <p className="text-lg font-medium">No notifications</p>
                  <p className="text-sm mt-1">
                    {filter === 'unread'
                        ? 'No unread notifications'
                        : 'Youre all caught up!'}
                      </p>
                      </div>
                      ) : (
                      <>
                      <div className="divide-y">
                    {notifications.map((notification) => {
                      const { icon, bgColor, iconColor } = getNotificationDetails(notification)
                      return (
                      <div
                      key={notification.id}
                     className={`p-4 transition-colors hover:bg-muted/50 ${
                         !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-950/10' : ''
                     }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                          className={`flex-shrink-0 p-2.5 rounded-full ${
                              !notification.isRead ? bgColor : 'bg-muted'
                          } ${iconColor}`}
                      >
                        {icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start gap-2">
                          <h3 className="font-semibold text-sm leading-tight">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                              <Badge variant="default" className="text-[10px] px-1.5 py-0 h-5">
                                New
                              </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-snug">
                          {notification.message}
                        </p>
                        {renderMetadata(notification)}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDateTime(notification.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.isRead && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleMarkAsRead(notification.id)}
                                title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(notification.id)}
                            title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                </div>
            )
            })}
      </div>

{/* Pagination */}
{pagination.totalPages > 1 && (
      <div className="flex items-center justify-between p-4 border-t">
        <p className="text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.totalPages} • {pagination.total} total
        </p>
        <div className="flex items-center gap-2">
          <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || loading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
  )}
</>
)}
</CardContent>
</Card>
</div>
)
}
