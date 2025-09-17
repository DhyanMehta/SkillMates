import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Megaphone, Ban, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/context/AppStore';

const Admin = () => {
  const navigate = useNavigate();
  const { users, setUserBanned, setUserApproved, addAnnouncement, isAdmin } = useAppStore();
  const [announcement, setAnnouncement] = useState('');

  if (!isAdmin) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
        <div className="gradient-card rounded-xl p-8 border border-border/20 shadow-card text-center">
          <ShieldAlert className="w-10 h-10 mx-auto text-warning mb-4" />
          <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground mb-4">You do not have permission to view this page.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if (!announcement.trim()) return;
    addAnnouncement(announcement.trim());
    setAnnouncement('');
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-full shadow-glow mb-6">
            <Megaphone className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Moderate users and send announcements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="gradient-card rounded-xl p-6 shadow-card border border-border/20">
            <h2 className="text-xl font-semibold mb-4">Send Announcement</h2>
            <Label className="mb-2 block">Message</Label>
            <Input value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="Platform-wide message..." className="mb-4" />
            <Button onClick={handleSend} className="gradient-primary text-primary-foreground">Send</Button>
          </div>

          <div className="gradient-card rounded-xl p-6 shadow-card border border-border/20">
            <h2 className="text-xl font-semibold mb-4">User Moderation</h2>
            <div className="space-y-3 max-h-[480px] overflow-auto pr-2">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between bg-background/30 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <div className="text-sm font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant={u.isProfileApproved ? 'outline' : 'default'} onClick={() => setUserApproved(u.id, !u.isProfileApproved)} className={u.isProfileApproved ? '' : 'gradient-primary text-primary-foreground'}>
                      <CheckCircle2 className="w-4 h-4 mr-1" /> {u.isProfileApproved ? 'Unapprove' : 'Approve'}
                    </Button>
                    <Button size="sm" variant={u.isBanned ? 'default' : 'outline'} onClick={() => setUserBanned(u.id, !u.isBanned)} className={u.isBanned ? 'bg-destructive text-destructive-foreground' : ''}>
                      <Ban className="w-4 h-4 mr-1" /> {u.isBanned ? 'Unban' : 'Ban'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;


