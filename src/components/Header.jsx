import { useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Home, Users, Send, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/context/AppStore';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { requests, currentUserId, isAdmin } = useAppStore();
  
  const isLoggedIn = Boolean(user);

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      navigate('/');
      setIsMobileMenuOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  const pendingCount = isLoggedIn && currentUserId != null
    ? requests.filter(r => r.toUserId === currentUserId && r.status === 'pending').length
    : 0;

  const navigationItems = [
    { name: 'Profile', path: '/profile', icon: User, authRequired: true },
    { name: 'Requests', path: '/requests', icon: Send, authRequired: true, badge: pendingCount },
    { name: 'Skill Change', path: '/skill-change', icon: Home, authRequired: true },
    { name: 'Admin', path: '/admin', icon: Shield, adminOnly: true },
  ];

  return (
    <header className="sticky top-0 z-50 glass-effect border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/home" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold transition-smooth group-hover:text-primary">
              SkillMates
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              if (item.authRequired && !isLoggedIn) return null;
              if (item.adminOnly && !isAdmin) return null;
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-smooth text-base ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  {item.name === 'Requests' && item.badge > 0 && (
                    <Badge className="ml-2 px-2 py-0 h-5 text-xs">{item.badge}</Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn && (
              <>
                <Button onClick={() => navigate('/login')} size="sm" variant="outline">Login</Button>
                <Button onClick={() => navigate('/register')} size="sm" className="gradient-primary text-primary-foreground shadow-glow">Sign Up</Button>
              </>
            )}
            {isLoggedIn ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 rounded-lg hover:bg-secondary/50 transition-smooth"
          >
            {isMobileMenuOpen ? (
              <X className="w-7 h-7" />
            ) : (
              <Menu className="w-7 h-7" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4 space-y-2">
            {navigationItems.map((item) => {
              if (item.authRequired && !isLoggedIn) return null;
              if (item.adminOnly && !isAdmin) return null;
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-3 rounded-lg transition-smooth text-base ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  {item.name === 'Requests' && item.badge > 0 && (
                    <Badge className="ml-2 px-2 py-0 h-5 text-xs">{item.badge}</Badge>
                  )}
                </Link>
              );
            })}
            
            <div className="pt-2 border-t border-border/50">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg w-full text-left text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-smooth"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="border border-border/50 text-foreground w-full px-3 py-2 rounded-lg font-medium transition-smooth"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      navigate('/register');
                      setIsMobileMenuOpen(false);
                    }}
                    className="gradient-primary text-primary-foreground shadow-glow w-full px-3 py-2 rounded-lg font-medium transition-smooth"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;