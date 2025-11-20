'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Friend } from '@/types'
import {
  X, Plus, UserPlus, ArrowLeft, Receipt, Users,
  DollarSign, Calendar, FileText, Zap, AlertCircle,
  CheckCircle2, Divide
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

export default function CreateBillPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [friends, setFriends] = useState<Friend[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    totalAmount: '',
    currency: 'NGN',
    dueDate: '',
  })
  const [participants, setParticipants] = useState<{
    userId: string
    amount: string
    name: string
    avatar?: string
  }[]>([])

  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = async () => {
    try {
      const response = await api.getFriends()
      setFriends(response.data)
    } catch (error) {
      console.error('Failed to fetch friends:', error)
      toast.error('Could not load friends')
    }
  }

  const addParticipant = (friend: Friend) => {
    if (participants.find((p) => p.userId === friend.friendId)) {
      toast.error('Participant already added')
      return
    }

    setParticipants([
      ...participants,
      {
        userId: friend.id,
        amount: '',
        name: friend.fullName,
        avatar: friend.avatar
      },
    ])
    toast.success(`${friend.fullName} added`)
  }

  const removeParticipant = (userId: string) => {
    const participant = participants.find(p => p.userId === userId)
    setParticipants(participants.filter((p) => p.userId !== userId))
    if (participant) {
      toast.success(`${participant.name} removed`)
    }
  }

  const updateParticipantAmount = (userId: string, amount: string) => {
    setParticipants(
        participants.map((p) => (p.userId === userId ? { ...p, amount } : p))
    )
  }

  const splitEqually = () => {
    if (!formData.totalAmount || participants.length === 0) {
      toast.error('Please enter total amount and add participants')
      return
    }

    const totalAmount = parseFloat(formData.totalAmount)
    const splitAmount = (totalAmount / participants.length).toFixed(2)

    setParticipants(
        participants.map((p) => ({ ...p, amount: splitAmount }))
    )
    toast.success(`Split ₦${splitAmount} per person`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (participants.length === 0) {
      toast.error('Please add at least one participant')
      return
    }

    const totalParticipantAmount = participants.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0),
        0
    )

    const totalAmount = parseFloat(formData.totalAmount)

    if (Math.abs(totalParticipantAmount - totalAmount) > 0.01) {
      toast.error(`Total split ($${totalParticipantAmount.toFixed(2)}) must equal bill amount ($$ {totalAmount.toFixed(2)})`)
      return
    }

    setLoading(true)

    try {
      const billData = {
        ...formData,
        totalAmount: Math.round(totalAmount * 100), // Convert to cents
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        participants: participants.map((p) => ({
          userId: p.userId,
          amount: Math.round(parseFloat(p.amount) * 100), // Convert to cents
        })),
      }

      await api.createBill(billData)
      toast.success('Bill created successfully!')
      router.push('/dashboard/bills')
    } catch (error: any) {
      console.error('Error creating bill:', error)
      toast.error(error.response?.data?.message || 'Failed to create bill')
    } finally {
      setLoading(false)
    }
  }

  const filteredFriends = friends.filter(f =>
      f.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalSplit = participants.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
  const totalAmount = parseFloat(formData.totalAmount) || 0
  const amountMatches = Math.abs(totalSplit - totalAmount) < 0.01
  const isValid = formData.title && totalAmount > 0 && participants.length > 0 && amountMatches

  return (
      <div className="max-w-5xl mx-auto space-y-6 px-4 sm:px-0 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Button variant="ghost" onClick={() => router.back()} className="mb-2 -ml-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Create New Bill
            </h1>
            <p className="text-muted-foreground">Split expenses fairly with your friends</p>
          </div>
          <div className="hidden sm:block h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Receipt className="h-8 w-8 text-primary" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Progress Indicator */}
          <Card className="border-2 border-dashed">
            <CardContent className="py-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      formData.title && totalAmount > 0 ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"
                  )}>
                    {formData.title && totalAmount > 0 ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <span className={cn(
                      "font-medium",
                      formData.title && totalAmount > 0 ? "text-emerald-600" : "text-gray-500"
                  )}>
                  Bill Details
                </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      participants.length > 0 ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"
                  )}>
                    {participants.length > 0 ? <CheckCircle2 className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                  </div>
                  <span className={cn(
                      "font-medium",
                      participants.length > 0 ? "text-emerald-600" : "text-gray-500"
                  )}>
                  Add Participants
                </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      amountMatches && participants.length > 0 ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"
                  )}>
                    {amountMatches && participants.length > 0 ? <CheckCircle2 className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                  </div>
                  <span className={cn(
                      "font-medium",
                      amountMatches && participants.length > 0 ? "text-emerald-600" : "text-gray-500"
                  )}>
                  Split Amount
                </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bill Details */}
          <Card className="shadow-md border-2">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Bill Details</CardTitle>
                  <CardDescription>What are you splitting?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Bill Title <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="title"
                    placeholder="e.g., Team Lunch at Pizza Palace"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-11"
                    required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">Description</Label>
                <textarea
                    id="description"
                    placeholder="Add any additional details about this bill..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="totalAmount" className="text-base font-semibold">
                    Total Amount <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="totalAmount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.totalAmount}
                        onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                        className="h-11 pl-9"
                        required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-base font-semibold">Currency</Label>
                  <select
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="NGN">🇳🇬 NGN (₦)</option>
                    <option value="USD">🇺🇸 USD ($)</option>
                    <option value="EUR">🇪🇺 EUR (€)</option>
                    <option value="GBP">🇬🇧 GBP (£)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-base font-semibold">Due Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="h-11 pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card className="shadow-md border-2">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Participants ({participants.length})
                    </CardTitle>
                    <CardDescription>Who's splitting this bill?</CardDescription>
                  </div>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={splitEqually}
                    disabled={participants.length === 0 || !formData.totalAmount}
                    className="gap-2"
                >
                  <Divide className="h-4 w-4" />
                  Split Equally
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Add Friends */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Add Friends</Label>
                {friends.length > 0 && (
                    <Input
                        placeholder="Search friends..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mb-3"
                    />
                )}
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 max-h-64 overflow-y-auto p-1">
                  {filteredFriends.length > 0 ? (
                      filteredFriends.map((friend) => {
                        const isAdded = participants.some((p) => p.userId === friend.friendId)
                        return (
                            <Button
                                key={friend.id}
                                type="button"
                                variant={isAdded ? "secondary" : "outline"}
                                className="justify-start h-auto py-3"
                                onClick={() => addParticipant(friend)}
                                disabled={isAdded}
                            >
                              <Avatar className="h-8 w-8 mr-3">
                                <AvatarImage src={friend.avatar} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(friend.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 text-left">
                                <p className="font-medium text-sm">{friend.fullName}</p>
                                <p className="text-xs text-muted-foreground">@{friend.username}</p>
                              </div>
                              {isAdded ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              ) : (
                                  <UserPlus className="h-4 w-4" />
                              )}
                            </Button>
                        )
                      })
                  ) : friends.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-sm text-muted-foreground mb-4">
                          No friends yet. Add friends to split bills with them.
                        </p>
                        <Button variant="outline" onClick={() => router.push('/dashboard/friends')}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Friends
                        </Button>
                      </div>
                  ) : (
                      <p className="col-span-full text-center text-sm text-muted-foreground py-8">
                        No friends match your search
                      </p>
                  )}
                </div>
              </div>

              {/* Participant List */}
              {participants.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Split Amounts</Label>
                    <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                      {participants.map((participant) => (
                          <div key={participant.userId} className="flex items-center gap-3 bg-white p-3 rounded-lg border">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={participant.avatar} />
                              <AvatarFallback className="text-xs">
                                {getInitials(participant.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 font-medium">{participant.name}</div>
                            <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          {formData.currency === 'NGN' ? '₦' : formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '£'}
                        </span>
                              <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={participant.amount}
                                  onChange={(e) =>
                                      updateParticipantAmount(participant.userId, e.target.value)
                                  }
                                  className="pl-7 h-10"
                                  required
                              />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeParticipant(participant.userId)}
                                className="hover:bg-red-50 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                      ))}

                      {/* Total Summary */}
                      <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
                        <span className="font-semibold text-lg">Total Split:</span>
                        <div className="text-right">
                          <p className={cn(
                              "text-2xl font-bold",
                              amountMatches ? "text-emerald-600" : "text-red-600"
                          )}>
                            {formData.currency === 'NGN' ? '₦' : formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '£'}
                            {totalSplit.toFixed(2)}
                          </p>
                          {totalAmount > 0 && (
                              <p className="text-xs text-muted-foreground">
                                of {formData.currency === 'NGN' ? '₦' : formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '£'}{totalAmount.toFixed(2)}
                              </p>
                          )}
                        </div>
                      </div>

                      {/* Validation Message */}
                      {participants.length > 0 && totalAmount > 0 && !amountMatches && (
                          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium text-amber-900">Amount mismatch</p>
                              <p className="text-amber-700">
                                The split total must equal the bill amount.
                                {totalSplit > totalAmount
                                    ? ` Reduce by ${(totalSplit - totalAmount).toFixed(2)}`
                                    : ` Add ${(totalAmount - totalSplit).toFixed(2)}`
                                }
                              </p>
                            </div>
                          </div>
                      )}
                    </div>
                  </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pb-8">
            <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                size="lg"
                className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
                type="submit"
                disabled={loading || !isValid}
                size="lg"
                className="w-full sm:w-auto gap-2"
            >
              {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Creating...
                  </>
              ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Create Bill
                  </>
              )}
            </Button>
          </div>
        </form>
      </div>
  )
}
