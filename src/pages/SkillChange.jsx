import { useMemo, useRef, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, SendHorizonal, MessageCircle, Check, Bell, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import chatService from '../services/supabaseChatService';
import requestService from '../services/supabaseRequestService';
import userService from '../services/supabaseUserService';
import { notificationService } from '../services/notificationService';
import { supabase } from '../lib/supabase';
import { ChatDebugUtils } from '../utils/chatDebug';

const SkillChange = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const requestIdParam = params.requestId ? Number(params.requestId) : null;

  const [message, setMessage] = useState('');
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('disconnected');
  const [debugMode, setDebugMode] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({ unreadMessages: 0, unreadNotifications: 0 });
  const [notifications, setNotifications] = useState([]);
  const [completingRequest, setCompletingRequest] = useState(false);
  const [completionStatus, setCompletionStatus] = useState({ completedByUsers: [], isFullyCompleted: false });
  const bottomRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Load accepted requests and chat data on component mount
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        console.log('Loading accepted requests for user:', user.id);
        const requestsResult = await requestService.getAcceptedRequests(user.id);
        console.log('Requests result:', requestsResult);

        if (requestsResult.success) {
          setAcceptedRequests(requestsResult.data || []);
          console.log('Loaded accepted requests:', requestsResult.data?.length || 0);
        } else {
          console.error('Failed to load requests:', requestsResult.message);
          toast({
            title: 'Error',
            description: requestsResult.message || 'Failed to load skill exchange requests',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error loading requests:', error);
        toast({
          title: 'Error',
          description: 'Failed to load skill exchange requests',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, toast]);

  // Load chat thread when requestIdParam changes
  useEffect(() => {
    if (!requestIdParam || !user) {
      setActiveThread(null);
      setMessages([]);
      setParticipants({});
      return;
    }

    const loadChatThread = async () => {
      try {
        console.log('Loading chat thread for request:', requestIdParam);

        // Get or create chat thread for this request
        const threadResult = await chatService.getOrCreateChatThread(requestIdParam);
        console.log('Thread result:', threadResult);

        if (threadResult.success && threadResult.data) {
          setActiveThread(threadResult.data);

          // Load messages for this thread
          console.log('Loading messages for thread:', threadResult.data.id);
          const messagesResult = await chatService.getChatMessages(threadResult.data.id, user.id);
          console.log('Messages result:', messagesResult);

          if (messagesResult.success) {
            setMessages(messagesResult.data || []);
            console.log('Loaded messages:', messagesResult.data?.length || 0);
          } else {
            console.error('Failed to load messages:', messagesResult.message);
            setMessages([]);
          }

          // Load participant details
          const participantDetails = await chatService.getChatParticipantDetails(threadResult.data.id);
          if (participantDetails.success) {
            setParticipants(participantDetails.data || {});
          }
        } else {
          console.error('Failed to load/create thread:', threadResult.message);
        }
      } catch (error) {
        console.error('Error loading chat:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat',
          variant: 'destructive'
        });
      }
    };

    loadChatThread();
  }, [requestIdParam, user, toast]);

  // Set up real-time message subscription
  useEffect(() => {
    if (!activeThread) {
      setSubscriptionStatus('no_thread');
      return;
    }

    console.log('Setting up real-time subscription for thread:', activeThread.id);
    setSubscriptionStatus('connecting');

    // Clean up existing subscription
    if (subscriptionRef.current) {
      console.log('Cleaning up existing subscription');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    const channel = supabase
      .channel(`chat_messages_${activeThread.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${activeThread.id}`
        },
        (payload) => {
          console.log('Real-time message received:', payload);
          setSubscriptionStatus('active');

          const newMessage = {
            id: payload.new.id,
            threadId: payload.new.thread_id,
            senderUserId: payload.new.sender_user_id,
            content: payload.new.content,
            createdAt: payload.new.created_at
          };

          // Add message if it doesn't already exist (prevents duplicates)
          setMessages(prev => {
            const exists = prev.find(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('Message already exists, skipping:', newMessage.id);
              return prev;
            }
            console.log('Adding new message to chat:', newMessage);
            return [...prev, newMessage];
          });
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        setSubscriptionStatus(status);

        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Subscription error');
          setSubscriptionStatus('error');
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Subscription timed out');
          setSubscriptionStatus('timeout');
        }
      });

    subscriptionRef.current = channel;

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [activeThread]);

  // Debug function
  const runDebugTests = async () => {
    console.log('🚀 Running debug tests...');
    setDebugMode(true);

    // Test user authentication
    console.log('Current user:', user);

    // Test direct database query
    try {
      const { data: testData, error } = await supabase
        .from('swap_requests')
        .select('*')
        .limit(5);
      console.log('Direct DB test:', { testData, error });
    } catch (err) {
      console.error('Direct DB test failed:', err);
    }

    // Test requestService
    try {
      const allRequests = await requestService.getRequests();
      console.log('All requests test:', allRequests);
    } catch (err) {
      console.error('All requests test failed:', err);
    }

    if (activeThread?.id) {
      const results = await ChatDebugUtils.runFullDiagnostic(activeThread.id);
      console.log('Chat debug results:', results);
    }

    toast({
      title: 'Debug Complete',
      description: 'Check console for detailed results'
    });
  };

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    const text = message.trim();
    if (!text || !activeThread || sending) return;

    console.log('🚀 handleSend called with:', {
      text,
      threadId: activeThread.id,
      userId: user.id,
      subscriptionStatus
    });

    setSending(true);
    setMessage(''); // Clear immediately for better UX

    try {
      const result = await chatService.sendMessage(activeThread.id, user.id, text);
      console.log('📤 Send message result:', result);

      if (result.success) {
        // Create message object for local state
        const newMessage = {
          id: result.data.id,
          threadId: activeThread.id,
          senderUserId: user.id,
          content: text,
          createdAt: result.data.createdAt || new Date().toISOString()
        };

        // Add to local state immediately (real-time subscription should also trigger)
        setMessages(prev => {
          const exists = prev.find(msg => msg.id === newMessage.id);
          if (exists) {
            console.log('Message already in local state');
            return prev;
          }
          console.log('✅ Adding message to local state immediately');
          return [...prev, newMessage];
        });

        toast({
          title: 'Message sent',
          description: 'Your message has been delivered'
        });
      } else {
        console.error('❌ Send message failed:', result.message);
        // Restore message on failure
        setMessage(text);
        toast({
          title: 'Error',
          description: result.message || 'Failed to send message',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      // Restore message on error
      setMessage(text);
      toast({
        title: 'Error',
        description: 'Failed to send message - network error',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  // Mark request as completed
  const handleCompleteRequest = async () => {
    if (!requestIdParam || !user || completingRequest) return;

    setCompletingRequest(true);
    try {
      const result = await requestService.markRequestCompleted(requestIdParam, user.id);

      if (result.success) {
        if (result.bothCompleted) {
          // Both users have completed - remove from list and navigate away
          setAcceptedRequests(prev => prev.filter(req => req.id !== requestIdParam));
          navigate('/skill-change');

          toast({
            title: 'Exchange Completed! 🎉',
            description: 'Both participants have marked this exchange as completed. It has been removed from your active chats.',
          });
        } else {
          // Only current user has completed - show waiting message
          toast({
            title: 'Marked as Complete! ✅',
            description: 'Waiting for the other participant to confirm completion. They will be notified.',
          });

          // Reload the accepted requests to reflect any changes
          const requestsResult = await requestService.getAcceptedRequests(user.id);
          if (requestsResult.success) {
            setAcceptedRequests(requestsResult.data || []);
          }
        }
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to complete request',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error completing request:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete request',
        variant: 'destructive'
      });
    } finally {
      setCompletingRequest(false);
    }
  };

  // Load unread counts
  useEffect(() => {
    if (!user) return;

    const loadUnreadCounts = async () => {
      const result = await notificationService.getUnreadCounts(user.id);
      if (result.success && result.data) {
        setUnreadCounts(result.data);
      }
    };

    loadUnreadCounts();

    // Set up real-time notifications subscription
    const notificationSubscription = notificationService.subscribeToNotifications(
      user.id,
      (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCounts(prev => ({
          ...prev,
          unreadNotifications: prev.unreadNotifications + 1
        }));

        // Show toast for new notifications
        toast({
          title: notification.title,
          description: notification.message,
        });
      }
    );

    return () => {
      if (notificationSubscription) {
        supabase.removeChannel(notificationSubscription);
      }
    };
  }, [user, toast]);

  // Mark chat messages as read when viewing a thread
  useEffect(() => {
    if (activeThread && user) {
      notificationService.markChatMessagesAsRead(activeThread.id, user.id);
    }
  }, [activeThread, user]);

  // Load completion status for current request
  useEffect(() => {
    if (requestIdParam && user) {
      const loadCompletionStatus = async () => {
        const result = await requestService.getRequestCompletionStatus(requestIdParam);
        if (result.success && result.data) {
          setCompletionStatus(result.data);
        }
      };
      loadCompletionStatus();
    }
  }, [requestIdParam, user]);

  const completeAndRate = async () => {
    if (!activeThread || !user) return;

    try {
      // Mark chat as completed
      const result = await chatService.markChatCompleted(activeThread.id, user.id);
      if (result.success) {
        setActiveThread(prev => ({ ...prev, isCompleted: true }));
        toast({
          title: 'Chat Completed',
          description: 'You can now rate this skill exchange in the Requests page'
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error completing chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark chat as completed',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(-1)} className="inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Threads list */}
          <div className="lg:col-span-1">
            <div className="gradient-card rounded-xl p-4 shadow-card border border-border/20">
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Skill Exchange Chats
                {unreadCounts.unreadMessages > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCounts.unreadMessages > 99 ? '99+' : unreadCounts.unreadMessages}
                  </span>
                )}
              </h2>
              <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
                {loading ? (
                  <div className="text-sm text-muted-foreground">Loading chats...</div>
                ) : acceptedRequests.length > 0 ? (
                  acceptedRequests.map(req => {
                    const isFromCurrentUser = req.fromUserId === user?.id;
                    const otherUser = isFromCurrentUser ? req.toUser : req.fromUser;

                    return (
                      <Link
                        key={req.id}
                        to={`/skill-change/${req.id}`}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-smooth hover:bg-secondary/50 ${requestIdParam === req.id ? 'bg-secondary/50 border border-primary/20' : ''}`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {otherUser?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{otherUser?.name || 'Unknown User'}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {req.skillsOffered?.[0] || req.offeredSkill} ↔ {req.skillsWanted?.[0] || req.requestedSkill}
                          </div>
                        </div>
                        {/* Unread indicator */}
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full opacity-75"></div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <h3 className="font-medium mb-1">No Active Chats</h3>
                    <span className="text-xs">Accept skill exchange requests to start chatting!</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat panel */}
          <div className="lg:col-span-2">
            <div className="gradient-card rounded-xl p-4 shadow-card border border-border/20 h-[75vh] flex flex-col">
              {activeThread ? (
                <div className="flex flex-col h-full">
                  {/* Chat header */}
                  <div className="border-b border-border/20 pb-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {requestIdParam && (() => {
                          const request = acceptedRequests.find(r => r.id === requestIdParam);
                          const isFromCurrentUser = request?.fromUserId === user?.id;
                          const otherUser = isFromCurrentUser ? request?.toUser : request?.fromUser;
                          return (
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {otherUser?.name?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-medium">{otherUser?.name || 'Unknown User'}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {request?.skillsOffered?.[0] || request?.offeredSkill} ↔ {request?.skillsWanted?.[0] || request?.requestedSkill}
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Real-time status */}
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${subscriptionStatus === 'SUBSCRIBED' ? 'bg-green-500' :
                            subscriptionStatus === 'connecting' ? 'bg-yellow-500' :
                              subscriptionStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
                            }`} />
                          {subscriptionStatus === 'SUBSCRIBED' ? 'Live' :
                            subscriptionStatus === 'connecting' ? 'Connecting...' :
                              subscriptionStatus === 'error' ? 'Error' : 'Offline'}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCompleteRequest}
                          disabled={completingRequest || completionStatus.completedByUsers.includes(user?.id)}
                          className="flex items-center gap-2"
                        >
                          {completingRequest ? (
                            <>
                              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                              Completing...
                            </>
                          ) : completionStatus.completedByUsers.includes(user?.id) ? (
                            <>
                              <Check className="w-4 h-4" />
                              {completionStatus.completedByUsers.length === 1 ? 'Waiting for Other User' : 'Completed'}
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Mark Complete
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-auto space-y-3 pr-1">
                    {messages.map(msg => {
                      const isMine = msg.senderUserId === user?.id;
                      const senderName = participants[msg.senderUserId]?.name;
                      return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${isMine ? 'bg-primary text-primary-foreground' : 'bg-secondary/60'}`}>
                            {!isMine && senderName && (
                              <div className="text-xs font-medium opacity-70 mb-1">{senderName}</div>
                            )}
                            <div>{msg.content}</div>
                            <div className="text-[10px] opacity-70 mt-1">
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {/* Message input */}
                  <div className="mt-3 flex items-center gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="bg-background/50"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      disabled={sending}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!message.trim() || sending}
                      className="inline-flex items-center"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <div className="flex items-center">
                          <SendHorizonal className="w-4 h-4 mr-1" /> Send
                        </div>
                      )}
                    </Button>
                  </div>

                  {activeThread.isCompleted && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-sm text-green-700 dark:text-green-300 text-center">
                        ✅ Exchange completed! Please go to Requests to submit ratings.
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                    <p className="text-sm">Select a chat from the list to start exchanging skills!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillChange;