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
import userService from '../services/supabaseUserService';
import { useAuth } from '@/context/AuthContext';

const Profile = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    location: '',
    bio: '',
    avatar: '',
    skills_offered: [],
    skills_wanted: [],
    availability: availabilityOptions[0],
    is_public: true
  });

  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');

  // Load user profile data
  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        const result = await userService.getUserProfile(user.id);
        if (result.success && result.data) {
          const profile = result.data;
          setCurrentUser(profile);
          setProfileData({
            name: profile.name || '',
            email: profile.email || '',
            location: profile.location || '',
            bio: profile.bio || '',
            avatar: profile.avatar || '',
            skills_offered: profile.skillsOffered || [],
            skills_wanted: profile.skillsWanted || [],
            availability: profile.availability || availabilityOptions[0],
            is_public: profile.isPublic !== false
          });
        } else {
          throw new Error(result.message || 'Failed to load profile');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data.',
          variant: 'destructive'
        });
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [isLoggedIn, user, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Convert profile data to match AppUser format
      const updateData = {
        name: profileData.name,
        email: profileData.email,
        location: profileData.location,
        bio: profileData.bio,
        avatar: profileData.avatar,
        skillsOffered: profileData.skills_offered,
        skillsWanted: profileData.skills_wanted,
        availability: profileData.availability,
        isPublic: profileData.is_public
      };

      const result = await userService.updateUserProfile(user.id, updateData);
      if (result.success) {
        setCurrentUser(result.data);
        toast({
          title: "Profile updated!",
          description: "Your profile has been successfully updated.",
        });

        // Refresh homepage users list if the function exists
        if (typeof window.refreshHomepageUsers === 'function') {
          console.log('🔄 Triggering homepage refresh after profile update...');
          // Add small delay to ensure database update is complete
          setTimeout(() => {
            window.refreshHomepageUsers();
          }, 500);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
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
      name: currentUser.name || '',
      email: currentUser.email || '',
      location: currentUser.location || '',
      bio: currentUser.bio || '',
      avatar: currentUser.avatar || '',
      skills_offered: [...(currentUser.skills_offered || [])],
      skills_wanted: [...(currentUser.skills_wanted || [])],
      availability: currentUser.availability || availabilityOptions[0],
      is_public: currentUser.is_public !== false
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
    if (newSkillOffered.trim() && !profileData.skills_offered.includes(newSkillOffered.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills_offered: [...prev.skills_offered, newSkillOffered.trim()]
      }));
      setNewSkillOffered('');
    }
  };

  const removeSkillOffered = (skill) => {
    setProfileData(prev => ({
      ...prev,
      skills_offered: prev.skills_offered.filter(s => s !== skill)
    }));
  };

  const addSkillWanted = () => {
    if (newSkillWanted.trim() && !profileData.skills_wanted.includes(newSkillWanted.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills_wanted: [...prev.skills_wanted, newSkillWanted.trim()]
      }));
      setNewSkillWanted('');
    }
  };

  const removeSkillWanted = (skill) => {
    setProfileData(prev => ({
      ...prev,
      skills_wanted: prev.skills_wanted.filter(s => s !== skill)
    }));
  };

  if (!isLoggedIn) {
    return null;
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen gradient-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Loading Profile...</h3>
            <p className="text-muted-foreground">Fetching your profile information.</p>
          </div>
        </div>
      </div>
    );
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
                  {profileData.skills_offered.map((skill, index) => (
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
                  {profileData.skills_wanted.map((skill, index) => (
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
                      checked={profileData.is_public}
                      onCheckedChange={(checked) => handleChange('is_public', checked)}
                    />
                    <div className="flex items-center space-x-2">
                      {profileData.is_public ? (
                        <Eye className="w-4 h-4 text-success" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm text-foreground">
                        {profileData.is_public ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {profileData.is_public
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