import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight, ShieldCheck, Sparkles, Search, Send, Star } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen gradient-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-2xl shadow-glow mb-6">
            <Users className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Exchange Skills. Grow Together.</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            List what you can teach, find what you want to learn, and swap knowledge with the community.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/home">
              <Button size="lg" variant="outline">Browse Skills</Button>
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-16">
          <div className="gradient-card p-6 rounded-xl border border-border/20 shadow-card">
            <Sparkles className="w-6 h-6 text-accent mb-2" />
            <h3 className="text-xl font-semibold mb-1">Discover</h3>
            <p className="text-muted-foreground">Search by skills and availability to find the perfect match.</p>
          </div>
          <div className="gradient-card p-6 rounded-xl border border-border/20 shadow-card">
            <Users className="w-6 h-6 text-primary mb-2" />
            <h3 className="text-xl font-semibold mb-1">Request & Swap</h3>
            <p className="text-muted-foreground">Send requests, accept or reject, and start learning together.</p>
          </div>
          <div className="gradient-card p-6 rounded-xl border border-border/20 shadow-card">
            <ShieldCheck className="w-6 h-6 text-success mb-2" />
            <h3 className="text-xl font-semibold mb-1">Feedback</h3>
            <p className="text-muted-foreground">Rate your experience and help build a trusted community.</p>
          </div>
        </section>

        <section className="pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 gradient-card p-8 rounded-xl border border-border/20 shadow-card">
              <h2 className="text-2xl font-semibold mb-2">How it works</h2>
              <p className="text-muted-foreground mb-6">Three simple steps to start learning and sharing.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background/40 rounded-lg p-4">
                  <Search className="w-5 h-5 text-primary mb-2" />
                  <div className="font-medium mb-1">Find people</div>
                  <p className="text-sm text-muted-foreground">Filter by skills wanted/offered and availability.</p>
                </div>
                <div className="bg-background/40 rounded-lg p-4">
                  <Send className="w-5 h-5 text-accent mb-2" />
                  <div className="font-medium mb-1">Send request</div>
                  <p className="text-sm text-muted-foreground">Propose what you can teach and what you want to learn.</p>
                </div>
                <div className="bg-background/40 rounded-lg p-4">
                  <Star className="w-5 h-5 text-warning mb-2" />
                  <div className="font-medium mb-1">Rate after swap</div>
                  <p className="text-sm text-muted-foreground">Leave feedback to build trust in the community.</p>
                </div>
              </div>
            </div>
            <div className="gradient-card p-8 rounded-xl border border-border/20 shadow-card">
              <h3 className="text-xl font-semibold mb-2">For admins</h3>
              <p className="text-muted-foreground">Moderate users and send platform announcements.</p>
              <div className="mt-4 text-sm">
                <div>Use any email ending with <code>@admin</code> to access the admin panel after login.</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
