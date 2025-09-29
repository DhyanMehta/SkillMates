import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Users as UsersIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import UserCard from '../components/UserCard';
import Pagination from '../components/Pagination';
import { availabilityOptions } from '../data/sampleData';
import { useSupabaseStore } from '@/context/SupabaseStore';
import { useAuth } from '@/context/AuthContext';

const Home = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { users, isLoadingUsers } = useSupabaseStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Filter and search logic
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            // Don't show the current user in the list
            if (currentUser && user.id === currentUser.id) return false;

            if (!user.isPublic) return false;
            if (user.isBanned) return false;
            if (user.isProfileApproved === false) return false;

            const matchesSearch = !searchQuery ||
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.skillsOffered.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
                user.skillsWanted.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesAvailability = availabilityFilter === 'all' || user.availability === availabilityFilter;

            return matchesSearch && matchesAvailability;
        });
    }, [users, currentUser, searchQuery, availabilityFilter]);

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    const handleRequest = (user) => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        navigate(`/send-request/${user.id}`);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoadingUsers) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="text-lg text-gray-600">Loading users...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Discover Skill Exchange Partners
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Connect with talented individuals, share your expertise, and learn new skills through meaningful exchanges.
                    </p>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        {/* Search */}
                        <div className="flex-1">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                Search by name or skills
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="Search users, skills, or expertise..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Availability Filter */}
                        <div className="w-full md:w-48">
                            <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                                Availability
                            </label>
                            <Select
                                value={availabilityFilter}
                                onValueChange={(value) => {
                                    setAvailabilityFilter(value);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger>
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="All availability" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All availability</SelectItem>
                                    {availabilityOptions.map(option => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Results Info */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center text-gray-600">
                        <UsersIcon className="h-5 w-5 mr-2" />
                        <span>
                            Showing {paginatedUsers.length} of {filteredUsers.length} users
                            {searchQuery && (
                                <span className="ml-2 text-blue-600">
                                    matching "{searchQuery}"
                                </span>
                            )}
                        </span>
                    </div>

                    {searchQuery && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSearchQuery('');
                                setCurrentPage(1);
                            }}
                        >
                            Clear search
                        </Button>
                    )}
                </div>

                {/* No Results */}
                {filteredUsers.length === 0 && (
                    <Alert className="mb-8">
                        <AlertDescription>
                            {searchQuery ? (
                                <>
                                    No users found matching "{searchQuery}".
                                    <Button
                                        variant="link"
                                        className="p-0 h-auto ml-1"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        Clear search
                                    </Button> to see all users.
                                </>
                            ) : (
                                "No users available at the moment. Check back later!"
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {/* User Grid */}
                {paginatedUsers.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {paginatedUsers.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onRequest={() => handleRequest(user)}
                                showRequestButton={!!currentUser}
                                currentUserId={currentUser?.id}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}

                {/* Call to Action for Non-logged Users */}
                {!currentUser && (
                    <div className="text-center mt-12">
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                                Ready to start your skill exchange journey?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Join our community to connect with skill partners and start exchanging knowledge today.
                            </p>
                            <div className="space-x-4">
                                <Button
                                    onClick={() => navigate('/signup')}
                                    size="lg"
                                >
                                    Sign Up Now
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/login')}
                                    size="lg"
                                >
                                    Log In
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;