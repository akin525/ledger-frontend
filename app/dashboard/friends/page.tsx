'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { api } from '@/lib/api'
import { getInitials, cn } from '@/lib/utils'
import { Friend, FriendRequest, User } from '@/types'
import { toast } from 'sonner'
import {
  Search,
  UserPlus,
  UserMinus,
  Check,
  X,
  Users,
  Crown,
  Mail,
  UserCheck,
  Loader2,
  UserX,
  Sparkles,
  Heart,
  Shield,
} from 'lucide-react'

type Tab = 'all' | 'pending'

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [removingFriend, setRemovingFriend] = useState<string | null>(null)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null)

  useEffect(() => {
    fetchFriends()
    fetchPendingRequests()
  }, [])

  const fetchFriends = async () => {
    try {
      const response = await api.getFriends()
      setFriends(response.data)
    } catch (error) {
      console.error('Failed to fetch friends:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingRequests = async () => {
    try {
      const response = await api.getPendingRequests()
      setPendingRequests(response.data)
    } catch (error) {
      console.error('Failed to fetch pending requests:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await api.searchUsers(searchQuery)
      setSearchResults(response.data)
      if (response.data.length === 0) {
        toast.info('No users found')
      }
    } catch (error) {
      toast.error('Failed to search users')
    } finally {
      setSearching(false)
    }
  }

  const handleSendRequest = async (userId: string) => {
    try {
      await api.sendFriendRequest(userId)
      toast.success('Friend request sent!')
      setSearchResults(searchResults.filter((u) => u.id !== userId))
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send request')
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await api.acceptFriendRequest(requestId)
      toast.success('Friend request accepted!')
      fetchFriends()
      fetchPendingRequests()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept request')
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      await api.rejectFriendRequest(requestId)
      toast.success('Friend request rejected')
      fetchPendingRequests()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject request')
    }
  }

  const confirmRemoveFriend = (friend: Friend) => {
    setFriendToRemove(friend)
    setShowRemoveDialog(true)
  }

  const handleRemoveFriend = async () => {
    if (!friendToRemove) return

    setRemovingFriend(friendToRemove.friendId)
    try {
      await api.removeFriend(friendToRemove.friendId)
      toast.success('Friend removed')
      fetchFriends()
      setShowRemoveDialog(false)
      setFriendToRemove(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove friend')
    } finally {
      setRemovingFriend(null)
    }
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary mx-auto"></div>
              <Users className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Loading friends...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Friends
            </h1>
            <p className="text-muted-foreground mt-1">
              Connect and share expenses with your friends
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">{friends.length}</span>
              <span className="text-sm text-muted-foreground">Friends</span>
            </div>
          </div>
        </div>

        {/* Search Card */}
        <Card className="shadow-md border-2">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Find Friends</CardTitle>
                <CardDescription>Search by username, name, or email</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="e.g., john, john@example.com, @johndoe..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 h-11"
                />
              </div>
              <Button onClick={handleSearch} disabled={searching} size="lg" className="gap-2">
                {searching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching...
                    </>
                ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Search
                    </>
                )}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="mt-6 space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Search Results ({searchResults.length})
                  </p>
                  {searchResults.map((user) => (
                      <div
                          key={user.id}
                          className="flex items-center justify-between p-4 border-2 rounded-xl hover:border-primary/30 hover:bg-gray-50 transition-all"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12 border-2">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-sm font-semibold">
                              {getInitials(user.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{user.fullName}</p>
                              {user.isPremium && (
                                  <Badge
                                      variant="secondary"
                                      className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border-amber-200"
                                  >
                                    <Crown className="h-3 w-3 mr-1" />
                                    Premium
                                  </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                            {user.email && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Mail className="h-3 w-3" />
                                  {user.email}
                                </p>
                            )}
                          </div>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => handleSendRequest(user.id)}
                            className="gap-2"
                        >
                          <UserPlus className="h-4 w-4" />
                          Add Friend
                        </Button>
                      </div>
                  ))}
                </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b">
          <Button
              variant={activeTab === 'all' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('all')}
              className="gap-2"
          >
            <Users className="h-4 w-4" />
            All Friends ({friends.length})
          </Button>
          <Button
              variant={activeTab === 'pending' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('pending')}
              className="gap-2 relative"
          >
            <UserCheck className="h-4 w-4" />
            Pending Requests
            {pendingRequests.length > 0 && (
                <Badge
                    variant="destructive"
                    className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full"
                >
                  {pendingRequests.length}
                </Badge>
            )}
          </Button>
        </div>

        {/* Pending Requests Tab */}
        {activeTab === 'pending' && (
            <Card className="shadow-md border-2">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Pending Friend Requests ({pendingRequests.length})
                    </CardTitle>
                    <CardDescription>Review and respond to friend requests</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {pendingRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                        <UserCheck className="h-10 w-10 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No pending requests
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        You're all caught up! New friend requests will appear here.
                      </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                      {pendingRequests.map((request) => (
                          <div
                              key={request.id}
                              className="flex items-center justify-between p-4 border-2 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                          >
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-12 w-12 border-2">
                                <AvatarImage src={request.sender.avatar} />
                                <AvatarFallback className="text-sm font-semibold">
                                  {getInitials(request.sender.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold">{request.sender.fullName}</p>
                                  {request.sender.isPremium && (
                                      <Badge
                                          variant="secondary"
                                          className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border-amber-200 text-xs"
                                      >
                                        <Crown className="h-3 w-3 mr-1" />
                                        Premium
                                      </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  @{request.sender.username}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleAcceptRequest(request.id)}
                                  className="gap-2"
                              >
                                <Check className="h-4 w-4" />
                                Accept
                              </Button>
                              <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectRequest(request.id)}
                                  className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                              >
                                <X className="h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          </div>
                      ))}
                    </div>
                )}
              </CardContent>
            </Card>
        )}

        {/* All Friends Tab */}
        {activeTab === 'all' && (
            <Card className="shadow-md border-2">
              <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">My Friends ({friends.length})</CardTitle>
                      <CardDescription>Your trusted payment network</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {friends.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-emerald-100 to-green-50 flex items-center justify-center mb-6">
                        <Users className="h-12 w-12 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No friends yet
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        Start building your network! Search for friends above to send connection requests.
                      </p>
                      <Button variant="outline" onClick={() => setActiveTab('pending')}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Check Pending Requests
                      </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {friends.map((friend) => (
                          <div
                              key={friend.id}
                              className="group relative flex flex-col p-5 border-2 rounded-xl hover:border-emerald-300 hover:shadow-lg transition-all bg-white"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <Avatar className="h-14 w-14 border-2 ring-2 ring-emerald-100">
                                <AvatarImage src={friend.avatar} />
                                <AvatarFallback className="text-base font-semibold">
                                  {getInitials(friend.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => confirmRemoveFriend(friend)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                                  disabled={removingFriend === friend.friendId}
                              >
                                {removingFriend === friend.friendId ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <UserMinus className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-lg">{friend.fullName}</p>
                                {friend.isPremium && (
                                    <Crown className="h-4 w-4 text-amber-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                @{friend.username}
                              </p>
                              {friend.isPremium && (
                                  <Badge
                                      variant="secondary"
                                      className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border-amber-200 text-xs"
                                  >
                                    <Shield className="h-3 w-3 mr-1" />
                                    Premium Member
                                  </Badge>
                              )}
                            </div>
                          </div>
                      ))}
                    </div>
                )}
              </CardContent>
            </Card>
        )}

        {/* Remove Friend Confirmation Dialog */}
        <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-red-600" />
                Remove Friend
              </DialogTitle>
              <DialogDescription className="pt-2">
                Are you sure you want to remove{' '}
                <span className="font-semibold text-foreground">
                {friendToRemove?.fullName}
              </span>{' '}
                from your friends list? You can send them a new friend request later.
              </DialogDescription>
            </DialogHeader>
            {friendToRemove && (
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={friendToRemove.avatar} />
                    <AvatarFallback>
                      {getInitials(friendToRemove.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{friendToRemove.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      @{friendToRemove.username}
                    </p>
                  </div>
                </div>
            )}
            <DialogFooter>
              <Button
                  variant="outline"
                  onClick={() => {
                    setShowRemoveDialog(false)
                    setFriendToRemove(null)
                  }}
                  disabled={removingFriend !== null}
              >
                Cancel
              </Button>
              <Button
                  variant="destructive"
                  onClick={handleRemoveFriend}
                  disabled={removingFriend !== null}
                  className="gap-2"
              >
                {removingFriend ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Removing...
                    </>
                ) : (
                    <>
                      <UserMinus className="h-4 w-4" />
                      Remove Friend
                    </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}
