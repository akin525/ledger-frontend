// @/components/transaction-detail-modal.tsx
'use client'

import { Transaction } from '@/types'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime, getInitials, cn } from '@/lib/utils'
import {
    ArrowUpRight,
    ArrowDownLeft,
    Copy,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    Receipt,
    Calendar,
    Hash,
    FileText,
    User,
    Wallet,
    Download,
} from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'


interface TransactionDetailModalProps {
    transaction: Transaction | null
    currentUserId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TransactionDetailModal({
                                           transaction,
                                           currentUserId,
                                           open,
                                           onOpenChange,
                                       }: TransactionDetailModalProps) {
    const { toast } = useToast()
    const [copied, setCopied] = useState<string | null>(null)

    if (!transaction) return null

    const isSender = transaction.senderId === currentUserId
    const other = isSender ? transaction.receiver : transaction.sender

    const getStatusConfig = (status: string) => {
        const s = status?.toUpperCase?.() || ''
        const configs = {
            COMPLETED: {
                variant: 'outline' as const,
                className: 'border-emerald-200 text-emerald-700 bg-emerald-50 font-medium',
                icon: CheckCircle2,
                label: 'Completed',
            },
            PENDING: {
                variant: 'outline' as const,
                className: 'border-amber-200 text-amber-700 bg-amber-50 font-medium',
                icon: Clock,
                label: 'Pending',
            },
            FAILED: {
                variant: 'destructive' as const,
                className: 'font-medium',
                icon: XCircle,
                label: 'Failed',
            },
            CANCELLED: {
                variant: 'outline' as const,
                className: 'border-gray-300 text-gray-600 bg-gray-50 font-medium',
                icon: AlertCircle,
                label: 'Cancelled',
            },
        }
        return configs[s as keyof typeof configs] || {
            variant: 'secondary' as const,
            className: '',
            icon: AlertCircle,
            label: status || 'Unknown',
        }
    }

    const statusConfig = getStatusConfig(transaction.status)
    const StatusIcon = statusConfig.icon

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        setCopied(label)
        toast({
            title: 'Copied',
            description: `${label} copied to clipboard`,
        })
        setTimeout(() => setCopied(null), 2000)
    }

    const handleDownloadReceipt = () => {
        // Generate a simple receipt
        const receipt = `
TRANSACTION RECEIPT
═══════════════════════════════════════

Transaction ID: ${transaction.id}
Reference: ${transaction.reference}
Date: ${formatDateTime(transaction.createdAt)}

${isSender ? 'SENT TO' : 'RECEIVED FROM'}
Name: ${other?.fullName || 'Unknown'}
Username: @${other?.username || 'n/a'}

AMOUNT: ${formatCurrency(transaction.amount, transaction.currency)}
Status: ${transaction.status}
Type: ${transaction.type.replace(/_/g, ' ')}

${transaction.description ? `Description: ${transaction.description}` : ''}
${transaction.bill ? `Bill: ${transaction.bill.title}` : ''}

═══════════════════════════════════════
Generated on ${new Date().toLocaleString()}
    `.trim()

        const blob = new Blob([receipt], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `receipt-${transaction.reference}.txt`
        a.click()
        window.URL.revokeObjectURL(url)

        toast({
            title: 'Downloaded',
            description: 'Receipt downloaded successfully',
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center",
                            isSender ? "bg-red-100" : "bg-emerald-100"
                        )}>
                            {isSender ? (
                                <ArrowUpRight className="h-5 w-5 text-red-600" />
                            ) : (
                                <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
                            )}
                        </div>
                        Transaction Details
                    </DialogTitle>
                    <DialogDescription>
                        View complete information about this transaction
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Amount & Status */}
                    <div className="text-center py-6 bg-gradient-to-r from-gray-50 to-white rounded-lg border-2">
                        <p className={cn(
                            "text-4xl font-bold mb-3",
                            isSender ? "text-red-600" : "text-emerald-600"
                        )}>
                            {isSender ? '-' : '+'}
                            {formatCurrency(transaction.amount, transaction.currency)}
                        </p>
                        <Badge variant={statusConfig.variant} className={cn(statusConfig.className, "text-base px-4 py-1")}>
                            <StatusIcon className="h-4 w-4 mr-2" />
                            {statusConfig.label}
                        </Badge>
                    </div>

                    <Separator />

                    {/* Transaction Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Receipt className="h-4 w-4" />
                            Transaction Information
                        </h3>

                        <div className="grid gap-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Hash className="h-4 w-4" />
                                    <span>Reference</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <code className="font-mono text-sm font-medium">{transaction.reference}</code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => copyToClipboard(transaction.reference, 'Reference')}
                                    >
                                        {copied === 'Reference' ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span>Type</span>
                                </div>
                                <span className="font-medium capitalize">
                  {transaction.type.replace(/_/g, ' ').toLowerCase()}
                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Date & Time</span>
                                </div>
                                <span className="font-medium">{formatDateTime(transaction.createdAt)}</span>
                            </div>

                            {transaction.description && (
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                        <FileText className="h-4 w-4" />
                                        <span>Description</span>
                                    </div>
                                    <p className="text-sm">{transaction.description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Sender/Receiver Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {isSender ? 'Recipient' : 'Sender'} Information
                        </h3>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <Avatar className="h-14 w-14">
                                <AvatarImage src={other?.avatar || undefined} />
                                <AvatarFallback className="text-lg">
                                    {getInitials(other?.fullName || 'Unknown')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold text-lg">{other?.fullName || 'Unknown'}</p>
                                <p className="text-sm text-muted-foreground">@{other?.username || 'n/a'}</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(other?.id || '', 'User ID')}
                            >
                                {copied === 'User ID' ? (
                                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                ) : (
                                    <Copy className="h-4 w-4 mr-2" />
                                )}
                                Copy ID
                            </Button>
                        </div>
                    </div>

                    {/* Bill Info */}
                    {transaction.bill && (
                        <>
                            <Separator />
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Receipt className="h-4 w-4" />
                                    Bill Information
                                </h3>
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{transaction.bill.title}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Bill ID: {transaction.bill.id}
                                            </p>
                                        </div>
                                        <Badge variant="outline">{transaction.bill.status}</Badge>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Metadata */}
                    {transaction.metadata && (
                        <>
                            <Separator />
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Wallet className="h-4 w-4" />
                                    Additional Information
                                </h3>
                                <div className="p-4 bg-gray-50 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(transaction.metadata, null, 2)}
                  </pre>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleDownloadReceipt}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download Receipt
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => copyToClipboard(transaction.id, 'Transaction ID')}
                        >
                            {copied === 'Transaction ID' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
