import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Send, Clock, CheckCircle, XCircle, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import SkillTag from '../components/SkillTag';
import Pagination from '../components/Pagination';
import RatingDialog from '@/components/RatingDialog';
import { requestService } from '../services/requestService';
import { getCurrentUserProfile } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const Requests = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate('/login');
      return;
    }

    // Load current user profile and requests
    const loadData = async () => {
      try {
        setLoading(true);

        // Get current user profile
        const profile = await getCurrentUserProfile();
        setCurrentUser(profile);

        // Load both sent and received requests
        const [sentResult, receivedResult] = await Promise.all([
          requestService.getSentRequests(user.id),
          requestService.getReceivedRequests(user.id)
        ]);

        const allRequests = [];
        if (sentResult.success) {
          allRequests.push(...sentResult.data);
        }
        if (receivedResult.success) {
          // Add received requests that aren't already in sent requests
          const sentIds = new Set(allRequests.map(r => r.id));
          receivedResult.data.forEach(req => {
            if (!sentIds.has(req.id)) {
              allRequests.push(req);
            }
          });
        }

        setRequests(allRequests);
      } catch (error) {
        console.error('Error loading requests:', error);
        toast({
          title: 'Error',
          description: 'Failed to load requests.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isLoggedIn, user, navigate, toast]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!user) return [];

    return requests.filter(request => {
      const isInvolved = request.fromUserId === user.id || request.toUserId === user.id;
      if (!isInvolved) return false;

      const otherUser = request.fromUserId === user.id ? request.toUser : request.fromUser;
      const matchesSearch = !q ||
        (otherUser?.name?.toLowerCase().includes(q)) ||
        request.offeredSkill.toLowerCase().includes(q) ||
        request.requestedSkill.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, statusFilter, user]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  const handleAcceptRequest = async (requestId) => {
    try {
      const result = await requestService.updateRequestStatus(requestId, 'accepted');
      if (result.success) {
        // Update local state
        setRequests(prev => prev.map(req =>
          req.id === requestId ? { ...req, status: 'accepted' } : req
        ));
        toast({ title: 'Request accepted!', description: "You can now start collaborating." });
        // Navigate to skill change page for this request
        setTimeout(() => {
          navigate(`/skill-change/${requestId}`);
        }, 0);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept request. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const result = await requestService.updateRequestStatus(requestId, 'rejected');
      if (result.success) {
        // Update local state
        setRequests(prev => prev.map(req =>
          req.id === requestId ? { ...req, status: 'rejected' } : req
        ));
        toast({ title: 'Request rejected', description: "You've rejected the request." });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject request. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (requestId) => {
    try {
      const result = await requestService.deleteRequest(requestId);
      if (result.success) {
        // Update local state
        setRequests(prev => prev.filter(req => req.id !== requestId));
        toast({ title: 'Request deleted', description: 'The request has been removed.' });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete request. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <Send className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              SkillMates Requests
            </h1>
            <p className="text-muted-foreground">
              Manage your incoming and outgoing skill exchange requests
            </p>
          </div>
        </div>

        {/* Search and Filter */}
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
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full sm:w-48 bg-background/50">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground">
            Your Requests
            <span className="text-lg text-muted-foreground ml-2">
              ({filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'})
            </span>
          </h2>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Send className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Loading Requests...</h3>
            <p className="text-muted-foreground">Fetching your skill exchange requests.</p>
          </div>
        ) : (
          <>
            {/* Requests List */}
            {paginatedRequests.length > 0 ? (
              <>
                <div className="space-y-4 mb-8">
                  {paginatedRequests.map(request => {
                    const isIncoming = user && request.toUserId === user.id;
                    const otherUser = request.fromUserId === user?.id ? request.toUser : request.fromUser;

                    return (
                      <div key={request.id} className="gradient-card rounded-xl p-6 shadow-card hover-lift transition-smooth border border-border/20">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          {/* User Info */}
                          <div className="flex items-center space-x-4 flex-1">
                            <img
                              src={otherUser?.avatar}
                              alt={otherUser?.name}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-lg font-semibold text-foreground truncate">
                                  {otherUser?.name}
                                </h3>
                                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${request.status === 'pending' ? 'status-pending' :
                                    request.status === 'accepted' ? 'status-accepted' :
                                      'status-rejected'
                                  }`}>
                                  {getStatusIcon(request.status)}
                                  <span>{getStatusText(request.status)}</span>
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {isIncoming ? 'Wants to learn from you' : 'You requested to learn from them'}
                              </p>
                            </div>
                          </div>

                          {/* Skills Exchange */}
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                  {isIncoming ? 'They offer:' : 'You offer:'}
                                </span>
                                <SkillTag skill={request.offeredSkill} variant="offered" />
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                  {isIncoming ? 'They want:' : 'You want:'}
                                </span>
                                <SkillTag skill={request.requestedSkill} variant="wanted" />
                              </div>
                            </div>

                            {request.message && (
                              <div className="mt-3 p-3 bg-background/30 rounded-lg">
                                <p className="text-sm text-foreground">"{request.message}"</p>
                              </div>
                            )}
                          </div>

                          {/* Actions and Date */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="text-sm text-muted-foreground text-center sm:text-right">
                              {formatDate(request.createdAt)}
                            </div>

                            {isIncoming && request.status === 'pending' && (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleAcceptRequest(request.id)}
                                  className="flex items-center space-x-1"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Accept</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectRequest(request.id)}
                                  className="flex items-center space-x-1 hover:border-destructive hover:text-destructive"
                                >
                                  <XCircle className="w-4 h-4" />
                                  <span>Reject</span>
                                </Button>
                              </div>
                            )}

                            {/* Outgoing: allow delete if not accepted */}
                            {!isIncoming && request.status !== 'accepted' && (
                              <div>
                                <Button size="sm" variant="outline" onClick={() => handleDelete(request.id)} className="hover:border-destructive hover:text-destructive">
                                  <XCircle className="w-4 h-4" /> Delete
                                </Button>
                              </div>
                            )}

                            {/* Accepted: allow rating by both sides */}
                            {request.status === 'accepted' && (
                              <div>
                                {(() => {
                                  const chat = getChatByRequestId(request.id);
                                  const bothCompleted = chat?.isCompleted;
                                  if (!bothCompleted) return null;
                                  return (
                                    <RatingDialog
                                      triggerLabel={isIncoming ? (request.ratingFromRecipient ? 'Rated' : 'Rate') : (request.ratingFromSender ? 'Rated' : 'Rate')}
                                      disabled={isIncoming ? !!request.ratingFromRecipient : !!request.ratingFromSender}
                                      onSubmit={(stars, feedback) => {
                                        rateRequest(request.id, stars, feedback);
                                        toast({ title: 'Thanks for your rating!', description: 'Your feedback helps the community.' });
                                      }}
                                    />
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredRequests.length}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No requests found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search terms or filters.'
                    : 'You haven\'t sent or received any requests yet.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {(searchQuery || statusFilter !== 'all') && (
                    <Button
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                        setCurrentPage(1);
                      }}
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                  )}
                  <Button
                    onClick={() => navigate('/')}
                    className="gradient-primary text-primary-foreground shadow-glow"
                  >
                    Find SkillMates
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Requests;