import { Star, MapPin, Clock, Send } from 'lucide-react';
import { Button } from './ui/button';
import SkillTag from './SkillTag';

const UserCard = ({ user, onRequest, isLoggedIn, currentUserId }) => {
  const isOwnProfile = currentUserId === user.id;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-warning text-warning" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-warning/50 text-warning" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-muted-foreground/30" />);
    }

    return stars;
  };

  return (
    <div className="gradient-card rounded-xl p-6 shadow-card hover-lift transition-smooth border border-border/20">
      {/* Header with Avatar and Basic Info */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground truncate">
            {user.name}
          </h3>
          
          {user.location && (
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate">{user.location}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex items-center">
              {renderStars(user.rating)}
            </div>
            <span className="text-sm font-medium text-foreground">
              {user.rating}
            </span>
            <span className="text-sm text-muted-foreground">
              ({user.reviews} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="space-y-3 mb-4">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Skills Offered</h4>
          <div className="flex flex-wrap gap-2">
            {user.skillsOffered.map((skill, index) => (
              <SkillTag key={index} skill={skill} variant="offered" />
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Skills Wanted</h4>
          <div className="flex flex-wrap gap-2">
            {user.skillsWanted.map((skill, index) => (
              <SkillTag key={index} skill={skill} variant="wanted" />
            ))}
          </div>
        </div>
      </div>

      {/* Availability and Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="w-4 h-4 mr-1" />
          <span>{user.availability}</span>
        </div>
        
        {!isOwnProfile && (
          <Button
            size="sm"
            onClick={() => onRequest(user)}
            disabled={!isLoggedIn}
            className="gradient-primary text-primary-foreground shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 mr-2" />
            Request
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserCard;