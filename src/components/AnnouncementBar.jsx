import { X } from 'lucide-react';
import { useAppStore } from '@/context/AppStore';

const AnnouncementBar = () => {
  const { announcements, removeAnnouncement, isAdmin } = useAppStore();
  if (!announcements.length) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 space-y-2">
        {announcements.map(a => (
          <div key={a.id} className="flex items-center justify-between text-sm">
            <div className="text-primary-foreground/90">{a.message}</div>
            {isAdmin && (
              <button onClick={() => removeAnnouncement(a.id)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;


