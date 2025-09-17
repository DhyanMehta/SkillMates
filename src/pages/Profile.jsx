import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Upload, User, MapPin, Eye, EyeOff, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { availabilityOptions } from '../data/sampleData';
import { useAppStore } from '@/context/AppStore';
import { useAuth } from '@/context/AuthContext';

const Profile = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { users, currentUserId, updateUser } = useAppStore();
  const { user: authUser } = useAuth();
  const currentUser = users.find(u => u.id === currentUserId);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(() => currentUser ? ({
    name: currentUser.name,
    email: currentUser.email,
    location: currentUser.location || '',
    bio: currentUser.bio || '',
    avatar: currentUser.avatar,
    skillsOffered: [...currentUser.skillsOffered],
    skillsWanted: [...currentUser.skillsWanted],
    availability: currentUser.availability,
    isPublic: currentUser.isPublic
  }) : {
    name: '', email: '', location: '', bio: '', avatar: '', skillsOffered: [], skillsWanted: [], availability: availabilityOptions[0], isPublic: true
  });

  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');

  useEffect(() => {
    if (!isLoggedIn || !currentUser) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!currentUser) return;
      updateUser({ ...currentUser, ...profileData });
      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    if (!currentUser) return;
    setProfileData({
      name: currentUser.name,
      email: currentUser.email,
      location: currentUser.location || '',
      bio: currentUser.bio || '',
      avatar: currentUser.avatar,
      skillsOffered: [...currentUser.skillsOffered],
      skillsWanted: [...currentUser.skillsWanted],
      availability: currentUser.availability,
      isPublic: currentUser.isPublic
    });
    setNewSkillOffered('');
    setNewSkillWanted('');
    
    toast({
      title: "Changes discarded",
      description: "All changes have been reset to original values.",
    });
  };

  const handleAvatarFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleChange('avatar', String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUrl = () => {
    const url = prompt('Enter image URL');
    if (url) handleChange('avatar', url);
  };

  const handleChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkillOffered = () => {
    if (newSkillOffered.trim() && !profileData.skillsOffered.includes(newSkillOffered.trim())) {
      setProfileData(prev => ({
        ...prev,
        skillsOffered: [...prev.skillsOffered, newSkillOffered.trim()]
      }));
      setNewSkillOffered('');
    }
  };

  const removeSkillOffered = (skill) => {
    setProfileData(prev => ({
      ...prev,
      skillsOffered: prev.skillsOffered.filter(s => s !== skill)
    }));
  };

  const addSkillWanted = () => {
    if (newSkillWanted.trim() && !profileData.skillsWanted.includes(newSkillWanted.trim())) {
      setProfileData(prev => ({
        ...prev,
        skillsWanted: [...prev.skillsWanted, newSkillWanted.trim()]
      }));
      setNewSkillWanted('');
    }
  };

  const removeSkillWanted = (skill) => {
    setProfileData(prev => ({
      ...prev,
      skillsWanted: prev.skillsWanted.filter(s => s !== skill)
    }));
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={() => navigate(-1)} className="inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div />
          </div>
          <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-full shadow-glow mb-6">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Edit Profile
          </h1>
          <p className="text-muted-foreground">
            Update your information and skills to connect with the right people
          </p>
          </div>
        </div>

        {/* Profile Overview */}
        <div className="gradient-card rounded-xl p-6 shadow-card border border-border/20 mb-6">
          <div className="flex items-start gap-4">
            <img src={profileData.avatar || currentUser?.avatar} alt={currentUser?.name} className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/20" />
            <div className="flex-1">
              <div className="text-xl font-semibold">{currentUser?.name}</div>
              <div className="text-muted-foreground text-sm">{currentUser?.email || authUser?.email}</div>
              {currentUser?.location && (
                <div className="text-sm mt-1">{currentUser.location}</div>
              )}
              {currentUser?.bio && (
                <div className="text-sm mt-2 text-muted-foreground">{currentUser.bio}</div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAvatarFile(e.target.files && e.target.files[0])}
                />
                <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current && fileInputRef.current.click()} className="inline-flex items-center">
                  <Upload className="w-4 h-4 mr-2" /> Change Avatar
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={handleAvatarUrl}>Use Image URL</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="gradient-card rounded-xl p-8 shadow-card border border-border/20">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="bg-background/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="bg-background/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-foreground font-medium">
                  Location
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="City, State/Country"
                    value={profileData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="pl-10 bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-foreground font-medium">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell others about yourself, your experience, and what you're passionate about..."
                  value={profileData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="bg-background/50 min-h-[100px]"
                />
              </div>
            </div>

            {/* Skills Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Skills</h2>
              
              {/* Skills Offered */}
              <div className="space-y-3">
                <Label className="text-foreground font-medium">Skills I Can Offer</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profileData.skillsOffered.map((skill, index) => (
                    <Badge
                      key={index}
                      className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-smooth"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkillOffered(skill)}
                        className="ml-2 hover:text-destructive transition-smooth"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill you can teach"
                    value={newSkillOffered}
                    onChange={(e) => setNewSkillOffered(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillOffered())}
                    className="bg-background/50"
                  />
                  <Button
                    type="button"
                    onClick={addSkillOffered}
                    variant="outline"
                    size="sm"
                    disabled={!newSkillOffered.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Skills Wanted */}
              <div className="space-y-3">
                <Label className="text-foreground font-medium">Skills I Want to Learn</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profileData.skillsWanted.map((skill, index) => (
                    <Badge
                      key={index}
                      className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 transition-smooth"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkillWanted(skill)}
                        className="ml-2 hover:text-destructive transition-smooth"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill you want to learn"
                    value={newSkillWanted}
                    onChange={(e) => setNewSkillWanted(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillWanted())}
                    className="bg-background/50"
                  />
                  <Button
                    type="button"
                    onClick={addSkillWanted}
                    variant="outline"
                    size="sm"
                    disabled={!newSkillWanted.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Preferences</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Availability</Label>
                  <Select 
                    value={profileData.availability} 
                    onValueChange={(value) => handleChange('availability', value)}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availabilityOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Profile Visibility</Label>
                  <div className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg">
                    <Switch
                      checked={profileData.isPublic}
                      onCheckedChange={(checked) => handleChange('isPublic', checked)}
                    />
                    <div className="flex items-center space-x-2">
                      {profileData.isPublic ? (
                        <Eye className="w-4 h-4 text-success" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm text-foreground">
                        {profileData.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {profileData.isPublic 
                      ? 'Your profile is visible to all users'
                      : 'Your profile is hidden from other users'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/20">
              <Button
                type="submit"
                disabled={isLoading}
                className="gradient-primary text-primary-foreground shadow-glow font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </div>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleDiscard}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Discard Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;