import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, User, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import SkillTag from '../components/SkillTag';
import { getUserById, getCurrentUserProfile } from '../services/userService';
import { requestService } from '../services/requestService';
import { useAuth } from '../context/AuthContext';

const SendRequest = ({ isLoggedIn }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [targetUser, setTargetUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    offeredSkill: '',
    requestedSkill: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);

        // Load current user profile
        const currentProfile = await getCurrentUserProfile();
        if (!currentProfile) {
          navigate('/profile');
          return;
        }
        setCurrentUser(currentProfile);

        // Load target user
        const targetUserResult = await getUserById(userId);
        if (!targetUserResult.success || !targetUserResult.data) {
          toast({
            title: 'User not found',
            description: 'The user you\'re trying to contact doesn\'t exist.',
            variant: 'destructive'
          });
          navigate('/');
          return;
        }

        if (currentProfile.id === targetUserResult.data.id) {
          toast({
            title: 'Invalid request',
            description: 'You cannot send a request to yourself.',
            variant: 'destructive'
          });
          navigate('/');
          return;
        }

        setTargetUser(targetUserResult.data);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user information.',
          variant: 'destructive'
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, isLoggedIn, user, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.offeredSkill || !formData.requestedSkill) {
      toast({
        title: "Missing information",
        description: "Please select both the skill you're offering and the skill you want to learn.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await requestService.createRequest({
        toUserId: targetUser.id,
        offeredSkill: formData.offeredSkill,
        requestedSkill: formData.requestedSkill,
        message: formData.message,
      });

      if (result.success) {
        toast({
          title: "Request sent!",
          description: `Your request has been sent to ${targetUser.name}.`,
        });
        navigate('/requests');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error sending request:', error);
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isLoggedIn || !targetUser || !currentUser) {
    return null;
  }

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

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Send className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Loading...</h3>
            <p className="text-muted-foreground">Preparing your skill request form.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!targetUser || !currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Button>

          <div className="text-center flex-1">
            <div className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-full shadow-glow mb-4">
              <Send className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Send Request
            </h1>
            <p className="text-muted-foreground">
              Propose a skill exchange with {targetUser.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Target User Info */}
          <div className="lg:col-span-1">
            <div className="gradient-card rounded-xl p-6 shadow-card border border-border/20 sticky top-24">
              <div className="text-center">
                <div className="relative mb-4">
                  <img
                    src={targetUser.avatar}
                    alt={targetUser.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto ring-2 ring-primary/20"
                  />
                  <div className="absolute -bottom-1 -right-8 w-4 h-4 bg-success rounded-full border-2 border-card" />
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {targetUser.name}
                </h3>

                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {renderStars(targetUser.rating)}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {targetUser.rating}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({targetUser.reviews} reviews)
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Skills They Offer</h4>
                    <div className="flex flex-wrap gap-2">
                      {(targetUser.skills_offered || []).map((skill, index) => (
                        <SkillTag key={index} skill={skill} variant="offered" />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Skills They Want</h4>
                    <div className="flex flex-wrap gap-2">
                      {(targetUser.skills_wanted || []).map((skill, index) => (
                        <SkillTag key={index} skill={skill} variant="wanted" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Request Form */}
          <div className="lg:col-span-2">
            <div className="gradient-card rounded-xl p-8 shadow-card border border-border/20">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      I can offer to teach: *
                    </Label>
                    <Select
                      value={formData.offeredSkill}
                      onValueChange={(value) => handleChange('offeredSkill', value)}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select a skill you can teach" />
                      </SelectTrigger>
                      <SelectContent>
                        {(currentUser.skills_offered || []).map((skill) => (
                          <SelectItem key={skill} value={skill}>
                            {skill}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Choose from your listed skills that you can offer to teach
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      I want to learn: *
                    </Label>
                    <Select
                      value={formData.requestedSkill}
                      onValueChange={(value) => handleChange('requestedSkill', value)}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select a skill you want to learn" />
                      </SelectTrigger>
                      <SelectContent>
                        {(targetUser.skills_offered || []).map((skill) => (
                          <SelectItem key={skill} value={skill}>
                            {skill}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Choose from the skills that {targetUser.name} offers
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground font-medium">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder={`Hi ${targetUser.name}! I'd love to learn ${formData.requestedSkill || '[skill]'} from you. I can help you with ${formData.offeredSkill || '[your skill]'} in return. Let me know if you're interested!`}
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    className="bg-background/50 min-h-[120px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Introduce yourself and explain why you're interested in this skill exchange
                  </p>
                </div>

                {/* Exchange Summary */}
                {formData.offeredSkill && formData.requestedSkill && (
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <h4 className="text-sm font-medium text-foreground mb-2">Exchange Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">You teach:</span>
                        <SkillTag skill={formData.offeredSkill} variant="offered" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">You learn:</span>
                        <SkillTag skill={formData.requestedSkill} variant="wanted" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/20">
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.offeredSkill || !formData.requestedSkill}
                    className="gradient-primary text-primary-foreground shadow-glow font-medium"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>Send Request</span>
                      </div>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendRequest;