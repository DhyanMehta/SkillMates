import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import chatService from '../services/supabaseChatService';
import requestService from '../services/supabaseRequestService';
import { supabase } from '../lib/supabase';

const Chat = () => {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const messagesEndRef = useRef(null);

    const [thread, setThread] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [participants, setParticipants] = useState({});
    const [otherUser, setOtherUser] = useState(null);

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load chat thread and messages
    useEffect(() => {
        if (!user || !requestId) {
            console.log('Chat load failed: missing user or requestId', { user: !!user, requestId });
            return;
        }

        const loadChat = async () => {
            try {
                setLoading(true);

                // First, get the request details to find participants
                const requestResult = await requestService.getRequestById(parseInt(requestId));

                if (!requestResult.success) {
                    toast({
                        title: 'Error',
                        description: `Request not found: ${requestResult.message}`,
                        variant: 'destructive'
                    });
                    navigate('/requests');
                    return;
                }

                const request = requestResult.data;

                // Verify user is a participant in this request
                if (request.fromUserId !== user.id && request.toUserId !== user.id) {
                    toast({
                        title: 'Error',
                        description: 'You are not authorized to view this chat.',
                        variant: 'destructive'
                    });
                    navigate('/requests');
                    return;
                }

                // Check if request is accepted
                if (request.status !== 'accepted') {
                    toast({
                        title: 'Info',
                        description: 'This request has not been accepted yet.',
                        variant: 'default'
                    });
                    navigate('/requests');
                    return;
                }

                const participantIds = [request.fromUserId, request.toUserId];

                // Get or create chat thread for this request
                const threadResult = await chatService.getOrCreateChatThread(parseInt(requestId));

                if (threadResult.success) {
                    setThread(threadResult.data);

                    // Load participant details
                    const participantsResult = await chatService.getChatParticipantDetails(participantIds);
                    if (participantsResult.success) {
                        const participantsMap = {};
                        participantsResult.data.forEach(p => {
                            participantsMap[p.id] = p;
                        });
                        setParticipants(participantsMap);

                        // Set the other user (not the current user)
                        const otherUserId = participantIds.find(id => id !== user.id);
                        if (otherUserId && participantsMap[otherUserId]) {
                            setOtherUser(participantsMap[otherUserId]);
                        }
                    }

                    // Load messages
                    const messagesResult = await chatService.getChatMessages(threadResult.data.id, user.id);

                    if (messagesResult.success) {
                        setMessages(messagesResult.data);
                    }
                } else {
                    toast({
                        title: 'Error',
                        description: 'Failed to load chat.',
                        variant: 'destructive'
                    });
                    navigate('/requests');
                }
            } catch (error) {
                console.error('Error loading chat:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load chat.',
                    variant: 'destructive'
                });
            } finally {
                setLoading(false);
            }
        };

        loadChat();
    }, [user, requestId, navigate, toast]);

    // Set up real-time message subscription
    useEffect(() => {
        if (!thread) return;

        const channel = supabase
            .channel(`chat_messages_${thread.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `thread_id=eq.${thread.id}`
                },
                (payload) => {
                    const newMessage = {
                        id: payload.new.id,
                        threadId: payload.new.thread_id,
                        senderUserId: payload.new.sender_id,
                        content: payload.new.message,
                        createdAt: payload.new.created_at
                    };

                    setMessages(prev => [...prev, newMessage]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [thread]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !thread || sending) return;

        setSending(true);

        try {
            const result = await chatService.sendMessage(thread.id, user.id, newMessage.trim());

            if (result.success) {
                setNewMessage('');
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to send message.',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: 'Error',
                description: 'Failed to send message.',
                variant: 'destructive'
            });
        } finally {
            setSending(false);
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="border-b bg-card shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/requests')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>

                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-semibold">
                                    {otherUser?.name?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div>
                                <h1 className="font-semibold">
                                    {otherUser?.name || 'Skill Exchange Chat'}
                                </h1>
                                <p className="text-sm text-muted-foreground">Request #{requestId}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon">
                            <Phone className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Video className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                    {messages.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">Start the conversation</h3>
                            <p className="text-muted-foreground">
                                Send a message to begin your skill exchange discussion.
                            </p>
                        </div>
                    ) : (
                        messages.reduce((acc, message, index) => {
                            const prevMessage = messages[index - 1];
                            const showDate = !prevMessage ||
                                new Date(message.createdAt).toDateString() !== new Date(prevMessage.createdAt).toDateString();

                            if (showDate) {
                                acc.push(
                                    <div key={`date-${message.id}`} className="text-center">
                                        <span className="bg-muted px-3 py-1 rounded-full text-sm text-muted-foreground">
                                            {formatDate(message.createdAt)}
                                        </span>
                                    </div>
                                );
                            }

                            const isOwnMessage = message.senderUserId === user.id;

                            acc.push(
                                <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwnMessage
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-foreground'
                                        }`}>
                                        {!isOwnMessage && (
                                            <p className="text-xs font-medium text-muted-foreground mb-1">
                                                {participants[message.senderUserId]?.name || 'Unknown User'}
                                            </p>
                                        )}
                                        <p className="text-sm">{message.content}</p>
                                        <p className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                            }`}>
                                            {formatTime(message.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            );

                            return acc;
                        }, [])
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <div className="border-t bg-card">
                <div className="max-w-4xl mx-auto p-4">
                    <form onSubmit={handleSendMessage} className="flex space-x-4">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1"
                            disabled={sending}
                        />
                        <Button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="gradient-primary"
                        >
                            {sending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;