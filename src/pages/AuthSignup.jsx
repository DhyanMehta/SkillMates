import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, UserPlus, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/context/AuthContext'

const AuthSignup = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailSignup = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }

      const result = await signUp(email, password, { name })

      if (!result.success) {
        throw new Error(result.message || result.error)
      }

      // Store email for OTP verification
      localStorage.setItem('signup_email', email)

      toast({
        title: 'Check your email!',
        description: 'We sent you a verification code. Please check your inbox.'
      })

      navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
    } catch (err) {
      const msg = String(err?.message || '')
      const friendly = /already|exists|duplicate/i.test(msg)
        ? 'Email already registered. Try logging in.'
        : msg || 'Try again.'
      toast({
        title: 'Sign up failed',
        description: friendly,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Marketing copy */}
          <div className="space-y-6 order-2 lg:order-1">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">Join a community that learns by sharing.</h1>
            <p className="text-lg text-muted-foreground max-w-xl">Create your account and start exchanging skills with people who are excited to teach and learn.</p>
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              <div className="rounded-xl p-4 bg-background/40 border border-border/20">
                <div className="text-sm font-medium">No fees</div>
                <div className="text-sm text-muted-foreground">Swap knowledge, not money.</div>
              </div>
              <div className="rounded-xl p-4 bg-background/40 border border-border/20">
                <div className="text-sm font-medium">Flexible</div>
                <div className="text-sm text-muted-foreground">Choose when you're available.</div>
              </div>
            </div>
          </div>

          {/* Right: Auth card */}
          <div className="w-full order-1 lg:order-2">
            <div className="gradient-card rounded-2xl p-8 shadow-card border border-border/20 max-w-md">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">Create account</h2>
                <p className="text-sm text-muted-foreground">Let's get you set up in a minute.</p>
              </div>
              <form onSubmit={handleEmailSignup} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="pl-10 bg-background/50" placeholder="Alex Chen" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-background/50" placeholder="you@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 bg-background/50" placeholder="••••••••" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="confirm" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 bg-background/50" placeholder="••••••••" />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground shadow-glow py-3">
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...</> : <>Create account</>}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-6">Already have an account? <Link to="/login" className="text-primary">Log in</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthSignup


