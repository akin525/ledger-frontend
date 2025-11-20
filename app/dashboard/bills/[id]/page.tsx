'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { api } from '@/lib/api'
import { formatCurrency, formatDate, getInitials, cn } from '@/lib/utils'
import { Bill } from '@/types'
import { toast } from 'sonner'
import {
  ArrowLeft, Calendar, User, Users, CheckCircle, XCircle,
  Clock, Trash2
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import Link from 'next/link'

export default function BillDetailPage() {
  const router = useRouter()
  const params = useParams()
  const billId = params.id as string

  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')

  useEffect(() => {
    fetchCurrentUser()
    fetchBill()
  }, [billId])

  const fetchCurrentUser = async () => {
    try {
      const resp = await api.getCurrentUser()
      setCurrentUserId(resp.data.id)
    } catch {
      console.error('Could not fetch current user')
    }
  }

  const fetchBill = async () => {
    try {
      const resp = await api.getBillById(billId)
      setBill(resp.data)
    } catch {
      toast.error('Failed to fetch bill details')
      router.push('/dashboard/bills')
    } finally {
      setLoading(false)
    }
  }

  const handlePayBill = async () => {
    if (!bill) return
    setActionLoading(true)
    try {
      await api.payBill(billId)
      toast.success('Bill marked as paid!')
      await fetchBill()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Payment failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteBill = async () => {
    setActionLoading(true)
    try {
      await api.deleteBill(billId)
      toast.success('Bill deleted successfully')
      router.push('/dashboard/bills')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Deletion failed')
    } finally {
      setActionLoading(false)
      setShowDeleteDialog(false)
    }
  }

  const getStatusConfig = (status: string) => {
    const map: Record<string, { variant: string, label: string }> = {
      PAID: { variant: 'success', label: 'Paid' },
      PENDING: { variant: 'warning', label: 'Pending' },
      PARTIALLY_PAID: { variant: 'secondary', label: 'Partially Paid' },
      OVERDUE: { variant: 'destructive', label: 'Overdue' },
      CANCELLED: { variant: 'outline', label: 'Cancelled' },
    }
    return map[status] || { variant: 'secondary', label: status || 'Unknown' }
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary"></div>
        </div>
    )
  }

  if (!bill) return null

  const isCreator = bill.creatorId === currentUserId
  const myParticipation = bill.participants.find(p => p.userId === currentUserId)
  const canPay = !!myParticipation && !myParticipation.isPaid

  const statusConfig = getStatusConfig(bill.status)

  return (
      <div className="max-w-3xl mx-auto space-y-8 px-4 sm:px-0 animate-in fade-in duration-300">
        {/* Back + Actions */}
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Bills
          </Button>
          {isCreator && (
              <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={actionLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Bill
              </Button>
          )}
        </div>

        {/* Header Card */}
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold truncate">{bill.title}</h2>
              <Badge variant={statusConfig.variant as any} className="text-sm uppercase">
                {statusConfig.label}
              </Badge>
            </div>
            {bill.description && (
                <p className="text-gray-600 text-base">{bill.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount */}
            <div className="text-center py-8 border-y">
              <p className="text-sm text-gray-500 mb-1">Total Amount</p>
              <p className={cn(
                  "text-5xl font-extrabold",
                  statusConfig.variant === 'destructive' ? 'text-red-600' : 'text-green-600'
              )}>
                {formatCurrency(bill.totalAmount, bill.currency)}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Created by</p>
                  <p className="font-medium">{bill.creator.fullName}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Created on</p>
                  <p className="font-medium">{formatDate(bill.createdAt)}</p>
                </div>
              </div>
              {bill.dueDate && (
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Due date</p>
                      <p className="font-medium">{formatDate(bill.dueDate)}</p>
                    </div>
                  </div>
              )}
            </div>

            {/* Action: Pay */}
            {canPay && (
                <Button
                    variant="default"
                    size="lg"
                    className="w-full"
                    onClick={handlePayBill}
                    disabled={actionLoading}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {actionLoading ? 'Processing...' : 'Mark as Paid'}
                </Button>
            )}
          </CardContent>
        </Card>

        {/* Participants Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Participants ({bill.participants.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bill.participants.map((participant) => {
              const isPaid = participant.isPaid
              return (
                  <div
                      key={participant.id}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={participant.user.avatar} />
                        <AvatarFallback>
                          {getInitials(participant.user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{participant.user.fullName}</p>
                        <p className="text-sm text-gray-500">@{participant.user.username}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-lg font-semibold">
                        {formatCurrency(participant.amount, bill.currency)}
                      </p>
                      <Badge variant={isPaid ? 'success' : 'warning'} className="text-xs">
                        {isPaid ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {isPaid ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </div>
                  </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Bill</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this bill? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                  variant="destructive"
                  onClick={handleDeleteBill}
                  disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Delete Bill'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}
