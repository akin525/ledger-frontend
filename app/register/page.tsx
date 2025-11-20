'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Wallet, Mail, Lock, User, Phone, ArrowRight, Check, Shield } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...registerData } = formData
      await api.register(registerData)
      toast.success('Registration successful!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  // Password strength indicator
  const getPasswordStrength = () => {
    const password = formData.password
    if (!password) return { strength: 0, label: '', color: '' }

    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++

    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' }
    if (strength <= 3) return { strength, label: 'Fair', color: 'bg-yellow-500' }
    if (strength <= 4) return { strength, label: 'Good', color: 'bg-blue-500' }
    return { strength, label: 'Strong', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength()
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword

  return (
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-12 flex-col justify-between relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700" />

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Bills Ledger</span>
            </div>

            <div className="space-y-6 text-white/90 max-w-md">
              <h1 className="text-4xl font-bold text-white leading-tight">
                Start Your Financial Journey
              </h1>
              <p className="text-lg text-white/80">
                Join thousands of users who trust Bills Ledger to manage their expenses and split bills effortlessly.
              </p>

              <div className="space-y-4 pt-6">
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-1">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">100% Free to Start</h3>
                    <p className="text-sm text-white/70">No credit card required. Get started in seconds.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-1">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Bank-Level Security</h3>
                    <p className="text-sm text-white/70">Your data is encrypted and secure with us</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-1">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Easy Collaboration</h3>
                    <p className="text-sm text-white/70">Add friends and split bills in a few clicks</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-white/60 text-sm">
            © 2024 Bills Ledger. All rights reserved.
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-y-auto">
          <div className="w-full max-w-md my-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
              <div className="bg-primary p-2.5 rounded-xl">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Bills Ledger</span>
            </div>

            <Card className="border-0 shadow-2xl">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-3xl font-bold tracking-tight">
                  Create Account
                </CardTitle>
                <CardDescription className="text-base">
                  Get started with Bills Ledger today
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          className="pl-10 h-11"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          required
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                          id="username"
                          type="text"
                          placeholder="johndoe"
                          className="pl-10 h-11"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                          required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This will be your unique identifier
                    </p>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          className="pl-10 h-11"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium">
                      Phone Number <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          className="pl-10 h-11"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 h-11"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                      />
                    </div>
                    {/* Password Strength Indicator */}
                    {formData.password && (
                        <div className="space-y-1.5">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 flex-1 rounded-full transition-all ${
                                        i < passwordStrength.strength
                                            ? passwordStrength.color
                                            : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                />
                            ))}
                          </div>
                          <p className={`text-xs font-medium ${
                              passwordStrength.strength <= 2 ? 'text-red-600' :
                                  passwordStrength.strength <= 3 ? 'text-yellow-600' :
                                      passwordStrength.strength <= 4 ? 'text-blue-600' :
                                          'text-green-600'
                          }`}>
                            Password strength: {passwordStrength.label}
                          </p>
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters long
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className={`pl-10 h-11 ${
                              formData.confirmPassword && !passwordsMatch
                                  ? 'border-red-500 focus-visible:ring-red-500'
                                  : passwordsMatch
                                      ? 'border-green-500 focus-visible:ring-green-500'
                                      : ''
                          }`}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          required
                      />
                      {passwordsMatch && (
                          <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>
                    {formData.confirmPassword && !passwordsMatch && (
                        <p className="text-xs text-red-600">Passwords do not match</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-2">
                  <Button
                      type="submit"
                      className="w-full h-11 text-base font-medium group"
                      disabled={loading || !passwordsMatch}
                  >
                    {loading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Creating account...
                        </>
                    ) : (
                        <>
                          Create Account
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                  </Button>

                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Already have an account?
                    </span>
                    </div>
                  </div>

                  <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 font-medium"
                      onClick={() => router.push('/login')}
                  >
                    Sign In Instead
                  </Button>

                  <p className="text-xs text-center text-muted-foreground px-8">
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" className="underline hover:text-primary">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="underline hover:text-primary">
                      Privacy Policy
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
  )
}
