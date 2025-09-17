import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Users as UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UserCard from '../components/UserCard';
import Pagination from '../components/Pagination';
import { availabilityOptions } from '../data/sampleData';
import { useAppStore } from '@/context/AppStore';

const Home = ({ isLoggedIn, currentUserId }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const { users } = useAppStore();

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
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
  }, [searchQuery, availabilityFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleRequest = (user) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate(`/send-request/${user.id}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-full shadow-glow mb-6">
            <UsersIcon className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Share Skills, Learn Together
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with talented individuals, exchange knowledge, and grow your skills through meaningful collaboration.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="gradient-card rounded-xl p-6 shadow-card border border-border/20 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or skills..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-background/50"
              />
            </div>
            <Select value={availabilityFilter} onValueChange={(value) => {
              setAvailabilityFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full sm:w-48 bg-background/50">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                {availabilityOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {!isLoggedIn && (
            <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm text-warning-foreground">
                <strong>Note:</strong> Please log in to send requests to other users.
              </p>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground">
            Available SkillMates
            <span className="text-lg text-muted-foreground ml-2">
              ({filteredUsers.length} {filteredUsers.length === 1 ? 'person' : 'people'})
            </span>
          </h2>
        </div>

        {/* Users Grid */}
        {paginatedUsers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedUsers.map(user => (
                <UserCard
                  key={user.id}
                  user={user}
                  onRequest={handleRequest}
                  isLoggedIn={isLoggedIn}
                  currentUserId={currentUserId}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={filteredUsers.length}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No matches found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find more SkillMates.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setAvailabilityFilter('all');
                setCurrentPage(1);
              }}
              variant="outline"
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;