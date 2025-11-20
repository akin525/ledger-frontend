'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { api } from '@/lib/api'
import { socketClient } from '@/lib/socket'
import { getInitials, formatDate } from '@/lib/utils'
import { Organization, User } from '@/types'
import { toast } from 'sonner'
import {
    ArrowLeft,
    Users,
    Crown,
    Shield,
    UserPlus,
    UserMinus,
    Settings,
    Trash2,
    Building2,
    Mail,
    Calendar,
    MoreVertical,
    Search,
    Sparkles,
    LogOut,
    UserCog,
    AlertCircle,
    Check,
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export default function OrganizationDetailPage() {
    const router = useRouter()
    const params = useParams()
    const organizationId = params.id as string

    const [organization, setOrganization] = useState<Organization | null>(null)
    const [loading, setLoading] = useState(true)
    const [showAddMember, setShowAddMember] = useState(false)
    const [friends, setFriends] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [memberSearchQuery, setMemberSearchQuery] = useState('')
    const [selectedFriend, setSelectedFriend] = useState<string>('')
    const [selectedRole, setSelectedRole] = useState<string>('MEMBER')
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        fetchOrganization()
        fetchFriends()
        fetchCurrentUser()
        setupWebSocket()
    }, [organizationId])

    const fetchCurrentUser = async () => {
        try {
            const response = await api.getCurrentUser()
            setCurrentUserId(response.data.id)
        } catch (error) {
            console.error('Failed to fetch current user')
        }
    }

    const fetchOrganization = async () => {
        try {
            const response = await api.getOrganizationById(organizationId)
            setOrganization(response.data)
        } catch (error) {
            toast.error('Failed to fetch organization details')
            router.push('/dashboard/organizations')
        } finally {
            setLoading(false)
        }
    }

    const fetchFriends = async () => {
        try {
            const response = await api.getFriends()
            setFriends(response.data)
        } catch (error) {
            console.error('Failed to fetch friends:', error)
        }
    }

    const setupWebSocket = () => {
        const token = localStorage.getItem('token')
        if (token) {
            socketClient.connect(token)

            socketClient.getSocket()?.on('organization_updated', (data: any) => {
                if (data.organizationId === organizationId) {
                    fetchOrganization()
                }
            })

            socketClient.getSocket()?.on('organization_member_added', (data: any) => {
                if (data.organizationId === organizationId) {
                    fetchOrganization()
                    toast.success('New member joined!', { icon: '👋' })
                }
            })

            socketClient.getSocket()?.on('organization_member_removed', (data: any) => {
                if (data.organizationId === organizationId) {
                    fetchOrganization()
                    toast.info('Member left the organization', { icon: '👋' })
                }
            })
        }
    }

    const handleAddMember = async () => {
        if (!selectedFriend) {
            toast.error('Please select a friend')
            return
        }

        setActionLoading(true)
        try {
            await api.addOrganizationMember(organizationId, selectedFriend, selectedRole)
            toast.success('Member added successfully!', { icon: '🎉' })
            setShowAddMember(false)
            setSelectedFriend('')
            setSelectedRole('MEMBER')
            setSearchQuery('')
            fetchOrganization()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add member')
        } finally {
            setActionLoading(false)
        }
    }

    const handleRemoveMember = async (memberId: string, memberName: string) => {
        if (!confirm(`Are you sure you want to remove ${memberName} from this organization?`)) return

        try {
            await api.removeOrganizationMember(organizationId, memberId)
            toast.success('Member removed successfully')
            fetchOrganization()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to remove member')
        }
    }

    const handleUpdateRole = async (memberId: string, newRole: string, memberName: string) => {
        try {
            await api.updateMemberRole(organizationId, memberId, newRole)
            toast.success(`$${memberName}'s role updated to$$ {newRole}`)
            fetchOrganization()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update role')
        }
    }

    const handleLeaveOrganization = async () => {
        if (!confirm('Are you sure you want to leave this organization? This action cannot be undone.')) return

        try {
            await api.leaveOrganization(organizationId)
            toast.success('You have left the organization')
            router.push('/dashboard/organizations')
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to leave organization')
        }
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'OWNER':
                return (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-md">
                        <Crown className="h-3 w-3 mr-1" />
                        Owner
                    </Badge>
                )
            case 'ADMIN':
                return (
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-md">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                    </Badge>
                )
            case 'MEMBER':
                return (
                    <Badge variant="secondary" className="shadow-sm">
                        <Users className="h-3 w-3 mr-1" />
                        Member
                    </Badge>
                )
            default:
                return <Badge variant="outline">{role}</Badge>
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                    <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
                </div>
            </div>
        )
    }

    if (!organization) return null

    const isOwner = organization.creatorId === currentUserId
    const userMember = organization.members.find((m) => m.userId === currentUserId)
    const isAdmin = userMember?.role === 'ADMIN' || isOwner
    const canManageMembers = isAdmin

    const availableFriends = friends.filter(
        (friend) => !organization.members.some((m) => m.userId === friend.friendId)
    )

    const filteredFriends = availableFriends.filter((friend) =>
        friend.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredMembers = organization.members.filter(
        (member) =>
            member.user.fullName.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
            member.user.username.toLowerCase().includes(memberSearchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6 pb-8">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="hover:bg-gray-100 hover:text-blue-600"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Organizations
                </Button>
                <div className="flex gap-2">
                    {!isOwner && userMember && (
                        <Button
                            variant="outline"
                            onClick={handleLeaveOrganization}
                            className="border-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Leave Organization
                        </Button>
                    )}
                    {isAdmin && (
                        <Button
                            onClick={() => router.push(`/dashboard/organizations/${organizationId}/settings`)}
                            className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </Button>
                    )}
                </div>
            </div>

            {/* Organization Header Card */}
            <Card className="overflow-hidden shadow-xl border-2">
                {/* Gradient Banner */}
                <div className="h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/10"></div>
                    {!organization.isActive && (
                        <div className="absolute top-4 right-4">
                            <Badge variant="secondary" className="bg-white/90 shadow-lg">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Inactive
                            </Badge>
                        </div>
                    )}
                </div>

                <CardHeader className="relative -mt-16 pb-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Avatar */}
                        <Avatar className="h-32 w-32 border-4 border-white shadow-2xl ring-4 ring-blue-100">
                            <AvatarImage src={organization.avatar} />
                            <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-100 to-purple-100">
                                <Building2 className="h-16 w-16 text-blue-600" />
                            </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-3xl font-bold mb-2">
                                        {organization.name}
                                    </CardTitle>
                                    {organization.description && (
                                        <CardDescription className="text-base leading-relaxed max-w-2xl">
                                            {organization.description}
                                        </CardDescription>
                                    )}
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="flex flex-wrap gap-6 pt-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <div className="p-2 rounded-lg bg-blue-100">
                                        <Users className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {organization.members.length} Members
                                        </p>
                                        <p className="text-xs text-muted-foreground">Active team</p>
                                    </div>
                                </div>

                                <Separator orientation="vertical" className="h-12" />

                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <div className="p-2 rounded-lg bg-purple-100">
                                        <Calendar className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatDate(organization.createdAt)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Created</p>
                                    </div>
                                </div>

                                {userMember && (
                                    <>
                                        <Separator orientation="vertical" className="h-12" />
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-green-100">
                                                <Check className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Your Role</p>
                                                <div className="mt-1">{getRoleBadge(userMember.role)}</div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Members Card */}
            <Card className="shadow-xl border-2">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                Team Members
                                <Badge variant="secondary" className="ml-2 text-base">
                                    {organization.members.length}
                                </Badge>
                            </CardTitle>
                            <CardDescription className="mt-2">
                                Manage your organization's team members and their roles
                            </CardDescription>
                        </div>
                        {canManageMembers && (
                            <Button
                                onClick={() => setShowAddMember(true)}
                                size="lg"
                                className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                <UserPlus className="h-5 w-5 mr-2" />
                                Add Member
                            </Button>
                        )}
                    </div>

                    {/* Search Members */}
                    {organization.members.length > 3 && (
                        <div className="relative mt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search members by name or username..."
                                value={memberSearchQuery}
                                onChange={(e) => setMemberSearchQuery(e.target.value)}
                                className="pl-10 h-11 border-2"
                            />
                        </div>
                    )}
                </CardHeader>

                <CardContent>
                    <div className="space-y-3">
                        {filteredMembers.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                    <Search className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-muted-foreground">No members found</p>
                            </div>
                        ) : (
                            filteredMembers.map((member) => {
                                const isSelf = member.userId === currentUserId
                                const canModify = canManageMembers && !isSelf && member.role !== 'OWNER'

                                return (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-4 border-2 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <Avatar className="h-14 w-14 border-2 border-white shadow-md ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all">
                                                <AvatarImage src={member.user.avatar} />
                                                <AvatarFallback className="text-lg bg-gradient-to-br from-blue-100 to-purple-100 font-semibold">
                                                    {getInitials(member.user.fullName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-base truncate">
                                                        {member.user.fullName}
                                                    </p>
                                                    {isSelf && (
                                                        <Badge variant="outline" className="text-xs">
                                                            You
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    @{member.user.username}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Joined {formatDate(member.joinedAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {getRoleBadge(member.role)}

                                            {canModify && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="hover:bg-gray-100"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        {member.role === 'MEMBER' && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleUpdateRole(
                                                                        member.id,
                                                                        'ADMIN',
                                                                        member.user.fullName
                                                                    )
                                                                }
                                                            >
                                                                <Shield className="h-4 w-4 mr-2 text-blue-600" />
                                                                Promote to Admin
                                                            </DropdownMenuItem>
                                                        )}
                                                        {member.role === 'ADMIN' && isOwner && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleUpdateRole(
                                                                        member.id,
                                                                        'MEMBER',
                                                                        member.user.fullName
                                                                    )
                                                                }
                                                            >
                                                                <Users className="h-4 w-4 mr-2" />
                                                                Demote to Member
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleRemoveMember(member.id, member.user.fullName)
                                                            }
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <UserMinus className="h-4 w-4 mr-2" />
                                                            Remove Member
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Add Member Dialog */}
            <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100">
                                <UserPlus className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl">Add Team Member</DialogTitle>
                            </div>
                        </div>
                        <DialogDescription className="text-base">
                            Invite a friend to join {organization.name} and start collaborating
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        {/* Search Friends */}
                        <div className="space-y-2">
                            <Label htmlFor="search" className="text-base font-semibold">
                                Search Friends
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-11 border-2"
                                />
                            </div>
                        </div>

                        {/* Friends List */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">
                                Select Friend <span className="text-destructive">*</span>
                            </Label>
                            <ScrollArea className="h-[280px] rounded-xl border-2 p-2">
                                {filteredFriends.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                            <Users className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="text-sm font-medium mb-1">
                                            {searchQuery ? 'No friends found' : 'No available friends'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {searchQuery
                                                ? 'Try a different search term'
                                                : 'All your friends are already members'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredFriends.map((friend) => (
                                            <div
                                                key={friend.id}
                                                onClick={() => setSelectedFriend(friend.friendId)}
                                                className={cn(
                                                    'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2',
                                                    selectedFriend === friend.friendId
                                                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-500 shadow-md'
                                                        : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                                                )}
                                            >
                                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                                    <AvatarImage src={friend.avatar} />
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100">
                                                        {getInitials(friend.fullName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold truncate">{friend.fullName}</p>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        @{friend.username}
                                                    </p>
                                                </div>
                                                {selectedFriend === friend.friendId && (
                                                    <div className="p-1 rounded-full bg-blue-600">
                                                        <Check className="h-4 w-4 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-base font-semibold">
                                Assign Role <span className="text-destructive">*</span>
                            </Label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="h-11 border-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MEMBER">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            <div>
                                                <p className="font-medium">Member</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Basic access and collaboration
                                                </p>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="ADMIN">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            <div>
                                                <p className="font-medium">Admin</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Full management permissions
                                                </p>
                                            </div>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowAddMember(false)
                                setSelectedFriend('')
                                setSearchQuery('')
                            }}
                            disabled={actionLoading}
                            className="border-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddMember}
                            disabled={actionLoading || !selectedFriend}
                            className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-w-[140px]"
                        >
                            {actionLoading ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Add Member
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
