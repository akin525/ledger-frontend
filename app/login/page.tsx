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
import { Wallet, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.login(formData.email, formData.password)
      toast.success('Login successful!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 flex-col justify-between relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700" />

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
                Manage Your Bills with Ease
              </h1>
              <p className="text-lg text-white/80">
                Track expenses, split bills with friends, and stay on top of your finances—all in one place.
              </p>

              <div className="space-y-4 pt-6">
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-1">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Smart Bill Splitting</h3>
                    <p className="text-sm text-white/70">Automatically calculate and track shared expenses</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-1">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Real-time Updates</h3>
                    <p className="text-sm text-white/70">Get notified when bills are created or settled</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-1">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Secure & Private</h3>
                    <p className="text-sm text-white/70">Your financial data is encrypted and protected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-white/60 text-sm">
            © 2024 Bills Ledger. All rights reserved.
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="w-full max-w-md">
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
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-base">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-5">
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <Link
                          href="/forgot-password"
                          className="text-xs text-primary hover:underline font-medium"
                      >
                        Forgot?
                      </Link>
                    </div>
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
                  </div>

                  {/* Optional: Remember Me Checkbox */}
                  {/* <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me for 30 days
                  </label>
                </div> */}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-2">
                  <Button
                      type="submit"
                      className="w-full h-11 text-base font-medium group"
                      disabled={loading}
                  >
                    {loading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Signing in...
                        </>
                    ) : (
                        <>
                          Sign In
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
                      New to Bills Ledger?
                    </span>
                    </div>
                  </div>

                  <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 font-medium"
                      onClick={() => router.push('/register')}
                  >
                    Create an Account
                  </Button>

                  <p className="text-xs text-center text-muted-foreground px-8">
                    By continuing, you agree to our{' '}
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
