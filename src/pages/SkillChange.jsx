import { useMemo, useRef, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, SendHorizonal } from 'lucide-react';
import { useAppStore } from '@/context/AppStore';

const SkillChange = () => {
  const navigate = useNavigate();
  const params = useParams();
  const requestIdParam = params.requestId ? Number(params.requestId) : null;
  const { requests, chats, ensureChatForRequest, getChatByRequestId, sendMessage, currentUserId, users, markChatCompleted } = useAppStore();
  const [message, setMessage] = useState('');
  const bottomRef = useRef(null);

  const acceptedRequests = useMemo(() => requests.filter(r => r.status === 'accepted'), [requests]);

  const activeThread = useMemo(() => {
    if (!requestIdParam) return undefined;
    return getChatByRequestId(requestIdParam);
  }, [requestIdParam, chats, getChatByRequestId]);

  useEffect(() => {
    if (requestIdParam != null) {
      ensureChatForRequest(requestIdParam);
    }
  }, [requestIdParam, ensureChatForRequest]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages?.length]);

  const handleSend = () => {
    const text = message.trim();
    if (!text || !activeThread) return;
    sendMessage(activeThread.id, text);
    setMessage('');
  };

  const completeAndRate = () => {
    if (!activeThread) return;
    markChatCompleted(activeThread.id);
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
              <h2 className="text-lg font-semibold mb-3">Skill Change</h2>
              <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
                {acceptedRequests.map(req => {
                  const otherUserId = currentUserId != null && req.fromUserId === currentUserId ? req.toUserId : req.fromUserId;
                  const otherUser = users.find(u => u.id === otherUserId);
                  return (
                    <Link key={req.id} to={`/skill-change/${req.id}`} className={`flex items-center gap-3 p-3 rounded-lg transition-smooth hover:bg-secondary/50 ${requestIdParam === req.id ? 'bg-secondary/50' : ''}`}>
                      <img src={otherUser?.avatar} alt={otherUser?.name} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <div className="text-sm font-medium">{otherUser?.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{req.offeredSkill} ↔ {req.requestedSkill}</div>
                      </div>
                    </Link>
                  );
                })}
                {acceptedRequests.length === 0 && (
                  <div className="text-sm text-muted-foreground">No accepted requests yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Chat panel */}
          <div className="lg:col-span-2">
            <div className="gradient-card rounded-xl p-4 shadow-card border border-border/20 h-[75vh] flex flex-col">
              {activeThread ? (
                <>
                  <div className="flex-1 overflow-auto space-y-3 pr-1">
                    {activeThread.messages.map(msg => {
                      const isMine = msg.senderUserId === currentUserId;
                      return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${isMine ? 'bg-primary text-primary-foreground' : 'bg-secondary/60'}`}>
                            <div>{msg.content}</div>
                            <div className="text-[10px] opacity-70 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." className="bg-background/50" onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }} />
                    <Button onClick={handleSend} className="inline-flex items-center">
                      <SendHorizonal className="w-4 h-4 mr-1" /> Send
                    </Button>
                    <Button variant="outline" onClick={completeAndRate}>{activeThread.completedUserIds?.includes(currentUserId || -1) ? 'Completed' : 'Mark Complete'}</Button>
                  </div>
                  {activeThread.isCompleted && (
                    <div className="mt-3 text-sm text-foreground">
                      Both users marked complete. Please go to Requests to submit ratings.
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a thread to start chatting</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillChange;


