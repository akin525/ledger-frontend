'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api'
import { socketClient } from '@/lib/socket'
import { getInitials } from '@/lib/utils'
import { Organization } from '@/types'
import { toast } from 'sonner'
import {
    Building2,
    Plus,
    Users,
    Settings,
    Crown,
    Shield,
    UserPlus,
    Search,
    Sparkles,
    TrendingUp,
    Calendar,
    ArrowRight,
    Globe,
    Lock,
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export default function OrganizationsPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [creating, setCreating] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        avatar: '',
    })

    useEffect(() => {
        fetchOrganizations()
        setupWebSocket()
    }, [])

    const fetchOrganizations = async () => {
        try {
            const response = await api.getOrganizations()
            setOrganizations(response.data)
        } catch (error) {
            console.error('Failed to fetch organizations:', error)
            toast.error('Failed to load organizations')
        } finally {
            setLoading(false)
        }
    }

    const setupWebSocket = () => {
        const token = localStorage.getItem('token')
        if (token) {
            socketClient.connect(token)

            socketClient.getSocket()?.on('organization_updated', (data: any) => {
                fetchOrganizations()
                toast.info('Organization updated', {
                    icon: '🔄',
                })
            })

            socketClient.getSocket()?.on('organization_member_added', (data: any) => {
                fetchOrganizations()
                toast.success('New member joined!', {
                    icon: '👋',
                })
            })

            socketClient.getSocket()?.on('organization_member_removed', (data: any) => {
                fetchOrganizations()
                toast.info('Member left the organization', {
                    icon: '👋',
                })
            })
        }
    }

    const handleCreateOrganization = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)

        try {
            await api.createOrganization(formData)
            toast.success('Organization created successfully!', {
                description: 'You can now invite members and start collaborating',
                icon: '🎉',
            })
            setShowCreateDialog(false)
            setFormData({ name: '', description: '', avatar: '' })
            fetchOrganizations()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create organization')
        } finally {
            setCreating(false)
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

    const filteredOrganizations = organizations.filter(
        (org) =>
            org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            org.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

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

    return (
        <div className="space-y-8 pb-8">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="relative z-10">
                    <div className="flex items-start justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                                    <Building2 className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-white mb-1">Organizations</h1>
                                    <p className="text-blue-100 text-lg">
                                        Manage your teams and collaborate effectively
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowCreateDialog(true)}
                            size="lg"
                            className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Create Organization
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-white/20">
                                    <Building2 className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{organizations.length}</p>
                                    <p className="text-sm text-blue-100">Total Organizations</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-white/20">
                                    <Users className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {organizations.reduce((sum, org) => sum + org.members.length, 0)}
                                    </p>
                                    <p className="text-sm text-blue-100">Total Members</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-white/20">
                                    <Crown className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {
                                            organizations.filter(
                                                (org) => org.creatorId === localStorage.getItem('userId')
                                            ).length
                                        }
                                    </p>
                                    <p className="text-sm text-blue-100">Owned by You</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            {organizations.length > 0 && (
                <Card className="shadow-lg border-2">
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search organizations by name or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12 text-base border-2 focus:border-blue-500"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Organizations Grid */}
            {filteredOrganizations.length === 0 ? (
                <Card className="shadow-xl border-2">
                    <CardContent className="py-16">
                        <div className="text-center">
                            <div className="relative mx-auto w-32 h-32 mb-6">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-xl">
                                    <Building2 className="h-16 w-16 text-blue-500" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                {searchQuery ? 'No organizations found' : 'No organizations yet'}
                            </h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                {searchQuery
                                    ? 'Try adjusting your search query'
                                    : 'Create your first organization to start collaborating with your team'}
                            </p>
                            {!searchQuery && (
                                <Button
                                    onClick={() => setShowCreateDialog(true)}
                                    size="lg"
                                    className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Create Your First Organization
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredOrganizations.map((org) => {
                        const userMember = org.members.find((m) => m.userId === localStorage.getItem('userId'))
                        const isOwner = org.creatorId === localStorage.getItem('userId')
                        const isAdmin = userMember?.role === 'ADMIN' || isOwner

                        return (
                            <Card
                                key={org.id}
                                className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-200 hover:-translate-y-1 overflow-hidden"
                            >
                                {/* Gradient Header */}
                                <div className="h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-grid-white/10"></div>
                                    {!org.isActive && (
                                        <div className="absolute top-2 right-2">
                                            <Badge variant="secondary" className="bg-white/90 shadow-md">
                                                <Lock className="h-3 w-3 mr-1" />
                                                Inactive
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                <CardHeader className="relative -mt-12 pb-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <Avatar className="h-20 w-20 border-4 border-white shadow-xl ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all">
                                            <AvatarImage src={org.avatar} />
                                            <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-100 to-purple-100">
                                                <Building2 className="h-10 w-10 text-blue-600" />
                                            </AvatarFallback>
                                        </Avatar>
                                        {userMember && <div className="mt-16">{getRoleBadge(userMember.role)}</div>}
                                    </div>

                                    <div>
                                        <CardTitle className="text-xl mb-1 group-hover:text-blue-600 transition-colors">
                                            {org.name}
                                        </CardTitle>
                                        {org.description && (
                                            <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                                                {org.description}
                                            </CardDescription>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <Separator />

                                    {/* Members Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center text-sm font-medium text-muted-foreground">
                                                <Users className="h-4 w-4 mr-2 text-blue-500" />
                                                <span className="text-gray-900 font-semibold">
                                                    {org.members.length}
                                                </span>
                                                <span className="ml-1">
                                                    member{org.members.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Member Avatars */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                {org.members.slice(0, 5).map((member) => (
                                                    <Avatar
                                                        key={member.id}
                                                        className="h-9 w-9 border-2 border-white shadow-md hover:z-10 hover:scale-110 transition-transform"
                                                    >
                                                        <AvatarImage src={member.user.avatar} />
                                                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-100 to-purple-100">
                                                            {getInitials(member.user.fullName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ))}
                                                {org.members.length > 5 && (
                                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white shadow-md flex items-center justify-center">
                                                        <span className="text-xs font-bold text-gray-700">
                                                            +{org.members.length - 5}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {isAdmin && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="ml-auto h-9 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                                                >
                                                    <UserPlus className="h-4 w-4 mr-1" />
                                                    Invite
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <Link href={`/dashboard/organizations/${org.id}`} className="flex-1">
                                            <Button
                                                variant="outline"
                                                className="w-full group/btn hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent transition-all"
                                            >
                                                View Details
                                                <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                        {isAdmin && (
                                            <Link href={`/dashboard/organizations/${org.id}/settings`}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="hover:bg-gray-100 hover:text-blue-600"
                                                >
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Create Organization Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100">
                                <Sparkles className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl">Create New Organization</DialogTitle>
                            </div>
                        </div>
                        <DialogDescription className="text-base">
                            Set up your organization to manage teams and collaborate with members
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateOrganization}>
                        <div className="space-y-5 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-semibold">
                                    Organization Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Tech Innovators Inc."
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="h-11 border-2 focus:border-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-base font-semibold">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Tell us about your organization and what it does..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="min-h-[100px] resize-none border-2 focus:border-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="avatar" className="text-base font-semibold">
                                    Logo URL
                                </Label>
                                <Input
                                    id="avatar"
                                    type="url"
                                    placeholder="https://example.com/logo.jpg"
                                    value={formData.avatar}
                                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                    className="h-11 border-2 focus:border-blue-500"
                                />
                                {formData.avatar && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed bg-gray-50">
                                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                            <AvatarImage src={formData.avatar} />
                                            <AvatarFallback>
                                                <Building2 className="h-6 w-6" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm text-muted-foreground">Logo Preview</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCreateDialog(false)}
                                disabled={creating}
                                className="border-2"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={creating}
                                className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-w-[140px]"
                            >
                                {creating ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Create Organization
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
