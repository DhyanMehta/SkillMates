import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Github, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/context/AuthContext'

const AuthLogin = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const result = await signIn(email, password)
      if (!result.success) throw new Error(result.message || 'Invalid credentials')

      toast({ title: 'Welcome back!', description: 'Logged in successfully.' })
      navigate('/home')
    } catch (err) {
      toast({ 
        title: 'Login failed', 
        description: err.message || 'Try again.', 
        variant: 'destructive' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGithub = async () => {
    toast({ title: 'Demo only', description: 'GitHub login is not available in demo mode.' })
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Marketing copy */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">Welcome back to a smarter way to learn.</h1>
            <p className="text-lg text-muted-foreground max-w-xl">Log in to continue exchanging skills with a community that grows together. Pick up where you left off.</p>
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              <div className="rounded-xl p-4 bg-background/40 border border-border/20">
                <div className="text-sm font-medium">Secure Auth</div>
                <div className="text-sm text-muted-foreground">Local session for demo.</div>
              </div>
              <div className="rounded-xl p-4 bg-background/40 border border-border/20">
                <div className="text-sm font-medium">Privacy First</div>
                <div className="text-sm text-muted-foreground">You control your profile.</div>
              </div>
            </div>
          </div>

          {/* Right: Auth card */}
          <div className="w-full">
            <div className="gradient-card rounded-2xl p-8 shadow-card border border-border/20 max-w-md ml-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">Log in</h2>
                <p className="text-sm text-muted-foreground">Enter your email and password to continue.</p>
              </div>
              <form onSubmit={handleEmailLogin} className="space-y-5">
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
                <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground shadow-glow py-3">
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging in...</> : <>Log In</>}
                </Button>
              </form>
              <div className="my-6 flex items-center"><div className="flex-1 h-px bg-border" /><span className="px-3 text-xs text-muted-foreground">or</span><div className="flex-1 h-px bg-border" /></div>
              <Button onClick={handleGithub} variant="outline" className="w-full">
                <Github className="w-4 h-4 mr-2" /> Continue with GitHub
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-6">Don't have an account? <Link to="/register" className="text-primary">Sign up</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLogin


