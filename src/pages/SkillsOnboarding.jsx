import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { X, Plus, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const SkillsOnboarding = () => {
    const navigate = useNavigate();
    const { user, updateProfile, checkOnboardingStatus } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [checkingAccess, setCheckingAccess] = useState(true);

    // Check if user should be here (prevent completed users from accessing)
    useEffect(() => {
        const checkAccess = async () => {
            if (!user) {
                console.log('No user found, redirecting to login');
                navigate('/login');
                return;
            }

            try {
                console.log('Checking onboarding status for user:', user.id);
                const { needsOnboarding } = await checkOnboardingStatus(user.id);
                console.log('Onboarding check result:', { needsOnboarding });

                if (!needsOnboarding) {
                    // User has already completed onboarding, redirect to home
                    console.log('User has completed onboarding, redirecting to home');
                    navigate('/home', {
                        state: {
                            message: 'You have already completed your profile setup!',
                            type: 'info'
                        }
                    });
                    return;
                }

                console.log('User needs onboarding, showing form');
                setCheckingAccess(false);
            } catch (error) {
                console.error('Error checking onboarding status:', error);
                // On error, show the onboarding form anyway (better UX)
                setCheckingAccess(false);
            }
        };

        // Add timeout fallback
        const timeout = setTimeout(() => {
            console.log('Onboarding check timeout, showing form anyway');
            setCheckingAccess(false);
        }, 5000);

        checkAccess().finally(() => {
            clearTimeout(timeout);
        });

        return () => clearTimeout(timeout);
    }, [user, checkOnboardingStatus, navigate]);

    // Form data
    const [formData, setFormData] = useState({
        name: user?.user_metadata?.name || '',
        location: '',
        bio: '',
        availability: 'Flexible',
        skillsOffered: [],
        skillsWanted: [],
        currentSkill: '',
        currentSkillExperience: '',
        wantedSkill: ''
    });

    // Common skills list for suggestions
    const commonSkills = [
        'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'C#',
        'HTML/CSS', 'TypeScript', 'Vue.js', 'Angular', 'PHP', 'Ruby',
        'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter', 'React Native',
        'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST APIs',
        'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'DevOps',
        'Machine Learning', 'Data Science', 'AI', 'Blockchain', 'Cybersecurity',
        'UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Sketch',
        'Project Management', 'Agile', 'Scrum', 'Digital Marketing',
        'Content Writing', 'SEO', 'Social Media Marketing', 'Photography',
        'Video Editing', 'Music Production', 'Language Teaching',
        'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Accounting',
        'Finance', 'Business Analysis', 'Sales', 'Customer Service'
    ];

    const experienceLevels = [
        { value: 'beginner', label: 'Beginner (0-1 years)', icon: '🌱' },
        { value: 'intermediate', label: 'Intermediate (1-3 years)', icon: '🌿' },
        { value: 'advanced', label: 'Advanced (3-5 years)', icon: '🌳' },
        { value: 'expert', label: 'Expert (5+ years)', icon: '⭐' }
    ];

    const availabilityOptions = ['Morning', 'Afternoon', 'Evening', 'Flexible'];

    const addOfferedSkill = () => {
        if (formData.currentSkill.trim() && formData.currentSkillExperience) {
            const skillWithExp = `${formData.currentSkill.trim()} (${formData.currentSkillExperience})`;
            if (!formData.skillsOffered.includes(skillWithExp)) {
                setFormData(prev => ({
                    ...prev,
                    skillsOffered: [...prev.skillsOffered, skillWithExp],
                    currentSkill: '',
                    currentSkillExperience: ''
                }));
            }
        }
    };

    const removeOfferedSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skillsOffered: prev.skillsOffered.filter(skill => skill !== skillToRemove)
        }));
    };

    const addWantedSkill = () => {
        if (formData.wantedSkill.trim()) {
            const skill = formData.wantedSkill.trim();
            if (!formData.skillsWanted.includes(skill)) {
                setFormData(prev => ({
                    ...prev,
                    skillsWanted: [...prev.skillsWanted, skill],
                    wantedSkill: ''
                }));
            }
        }
    };

    const removeWantedSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skillsWanted: prev.skillsWanted.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleSuggestionClick = (skill, type) => {
        if (type === 'offered') {
            setFormData(prev => ({ ...prev, currentSkill: skill }));
        } else {
            setFormData(prev => ({ ...prev, wantedSkill: skill }));
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.name.trim()) {
                setError('Please enter your name');
                return;
            }
        } else if (step === 2) {
            if (formData.skillsOffered.length === 0) {
                setError('Please add at least one skill you can offer');
                return;
            }
        }
        setError('');
        setStep(step + 1);
    };

    const handlePrevious = () => {
        setError('');
        setStep(step - 1);
    };

    const handleSubmit = async () => {
        if (formData.skillsOffered.length === 0) {
            setError('Please add at least one skill you can offer');
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('Saving onboarding data:', {
                id: user.id,
                name: formData.name,
                email: user.email,
                location: formData.location,
                bio: formData.bio,
                availability: formData.availability,
                skills_offered: formData.skillsOffered,
                skills_wanted: formData.skillsWanted,
            });

            // Update user profile in database
            const { error: updateError } = await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    name: formData.name,
                    email: user.email,
                    location: formData.location,
                    bio: formData.bio,
                    availability: formData.availability,
                    skills_offered: formData.skillsOffered,
                    skills_wanted: formData.skillsWanted,
                    updated_at: new Date().toISOString()
                });

            if (updateError) {
                console.error('Database update error:', updateError);
                throw updateError;
            }

            console.log('✅ User profile saved successfully');

            // Update auth metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    name: formData.name,
                    onboarding_completed: true
                }
            });

            if (authError) {
                console.warn('Auth metadata update failed:', authError);
            }

            // Navigate to home
            navigate('/home', {
                state: {
                    message: 'Welcome to SkillMates! Your profile has been set up successfully. You can edit your skills anytime from your profile.',
                    type: 'success'
                }
            });
        } catch (error) {
            console.error('Onboarding error:', error);
            setError(error.message || 'Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Welcome to SkillMates! 👋</h2>
                <p className="text-muted-foreground">Let's set up your profile to get started</p>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g., New York, NY"
                    />
                </div>

                <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell others about yourself..."
                        rows={3}
                    />
                </div>

                <div>
                    <Label htmlFor="availability">Availability</Label>
                    <Select value={formData.availability} onValueChange={(value) => setFormData(prev => ({ ...prev, availability: value }))}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {availabilityOptions.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">What skills can you offer? 🚀</h2>
                <p className="text-muted-foreground">Add the skills you can teach or help others with</p>
            </div>

            <div className="space-y-4">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Label htmlFor="currentSkill">Skill Name *</Label>
                        <Input
                            id="currentSkill"
                            value={formData.currentSkill}
                            onChange={(e) => setFormData(prev => ({ ...prev, currentSkill: e.target.value }))}
                            placeholder="e.g., JavaScript, React, Python..."
                            onKeyPress={(e) => e.key === 'Enter' && formData.currentSkillExperience && addOfferedSkill()}
                        />
                    </div>
                    <div className="flex-1">
                        <Label htmlFor="experience">Experience Level *</Label>
                        <Select value={formData.currentSkillExperience} onValueChange={(value) => setFormData(prev => ({ ...prev, currentSkillExperience: value }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                                {experienceLevels.map(level => (
                                    <SelectItem key={level.value} value={level.value}>
                                        <span className="flex items-center gap-2">
                                            <span>{level.icon}</span>
                                            <span>{level.label}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        type="button"
                        onClick={addOfferedSkill}
                        disabled={!formData.currentSkill.trim() || !formData.currentSkillExperience}
                        className="mt-6"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Skills suggestions */}
                <div>
                    <Label className="text-sm text-muted-foreground">Popular skills:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {commonSkills.slice(0, 15).map(skill => (
                            <Badge
                                key={skill}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                onClick={() => handleSuggestionClick(skill, 'offered')}
                            >
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Added skills */}
                {formData.skillsOffered.length > 0 && (
                    <div>
                        <Label>Your Skills ({formData.skillsOffered.length})</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.skillsOffered.map(skill => (
                                <Badge key={skill} variant="default" className="flex items-center gap-1">
                                    {skill}
                                    <X
                                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                                        onClick={() => removeOfferedSkill(skill)}
                                    />
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">What skills do you want to learn? 📚</h2>
                <p className="text-muted-foreground">Add skills you'd like to learn from others (optional)</p>
            </div>

            <div className="space-y-4">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Label htmlFor="wantedSkill">Skill Name</Label>
                        <Input
                            id="wantedSkill"
                            value={formData.wantedSkill}
                            onChange={(e) => setFormData(prev => ({ ...prev, wantedSkill: e.target.value }))}
                            placeholder="e.g., Machine Learning, UI/UX Design..."
                            onKeyPress={(e) => e.key === 'Enter' && addWantedSkill()}
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={addWantedSkill}
                        disabled={!formData.wantedSkill.trim()}
                        className="mt-6"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Skills suggestions */}
                <div>
                    <Label className="text-sm text-muted-foreground">Popular skills:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {commonSkills.slice(15, 30).map(skill => (
                            <Badge
                                key={skill}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                onClick={() => handleSuggestionClick(skill, 'wanted')}
                            >
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Added skills */}
                {formData.skillsWanted.length > 0 && (
                    <div>
                        <Label>Skills You Want to Learn ({formData.skillsWanted.length})</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.skillsWanted.map(skill => (
                                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                                    {skill}
                                    <X
                                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                                        onClick={() => removeWantedSkill(skill)}
                                    />
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // Show loading while checking access
    if (checkingAccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Checking your profile status...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-primary" />
                            Skills Setup
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                            Step {step} of 3
                        </div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-md mb-4">
                            {error}
                        </div>
                    )}

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    <div className="flex justify-between mt-8">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={step === 1}
                        >
                            Previous
                        </Button>

                        {step < 3 ? (
                            <Button onClick={handleNext}>
                                Next
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Setting up...' : 'Complete Setup'}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SkillsOnboarding;