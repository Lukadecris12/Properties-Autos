'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  Send, 
  User, 
  Building2, 
  Phone, 
  MessageCircle, 
  Search, 
  CheckCheck, 
  ArrowLeft, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Home
} from 'lucide-react';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { api } from '@/lib/api';
import { Conversation, ChatMessage } from '@/lib/types';

export default function MessagesPage() {
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check authentication
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('propertyhub_token');
      const userStr = localStorage.getItem('propertyhub_user');
      if (!token) {
        router.push('/auth/login?redirect=/messages');
        return;
      }
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          setCurrentUserId(parsed.id);
        } catch (e) {}
      }
    }

    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await api.getMyConversations();
      if (res.data) {
        setConversations(res.data);
        if (res.data.length > 0 && !activeConvId) {
          setActiveConvId(res.data[0].id);
          loadMessages(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: number) => {
    try {
      const res = await api.getConversationMessages(convId);
      if (res.data) {
        setMessages(res.data);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConvId(conv.id);
    loadMessages(conv.id);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const activeConv = conversations.find(c => c.id === activeConvId);
      const recipientId = activeConv?.participant_1_id === currentUserId
        ? activeConv?.participant_2_id
        : activeConv?.participant_1_id;

      const res = await api.sendMessage({
        conversation_id: activeConvId,
        recipient_id: recipientId,
        content: textToSend,
      });

      if (res.data) {
        setMessages(prev => [...prev, res.data]);
        scrollToBottom();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find(c => c.id === activeConvId);
  const otherUser = activeConv?.participant_1_id === currentUserId 
    ? activeConv?.participant_2 
    : activeConv?.participant_1;

  const otherUserName = otherUser?.company_name || 
    `${otherUser?.first_name || ''} ${otherUser?.last_name || ''}`.trim() || 
    'Verified Partner';

  const otherPhone = otherUser?.phone_number || '+234 803 123 4567';
  const cleanPhone = otherPhone.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('0') ? `234${cleanPhone.slice(1)}` : cleanPhone;
  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(`Hello ${otherUserName}, I am following up on our conversation on PropertyHub.`)}`;

  const filteredConversations = conversations.filter(c => {
    const partner = c.participant_1_id === currentUserId ? c.participant_2 : c.participant_1;
    const name = `${partner?.first_name || ''} ${partner?.last_name || ''} ${partner?.company_name || ''}`.toLowerCase();
    const listingTitle = (c.listing?.title || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || listingTitle.includes(search);
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-brand-500" />
                Direct Messages
              </h1>
              <p className="text-xs text-gray-400">Secure real-time communication with property agents, developers, and buyers</p>
            </div>
          </div>
          <button 
            onClick={loadConversations} 
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
            title="Refresh conversations"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Messaging Layout */}
        <div className="flex-1 min-h-[580px] bg-[#111827] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Column: Conversation Thread List */}
          <div className={`md:col-span-4 border-r border-gray-800 flex flex-col ${activeConvId && 'hidden md:flex'}`}>
            <div className="p-4 border-b border-gray-800">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search conversations & listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-800/60 no-scrollbar">
              {loading ? (
                <div className="p-8 text-center text-xs text-gray-500 space-y-2">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Loading messages...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <MessageSquare className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="text-xs text-gray-400">No active conversations yet.</p>
                  <Link href="/" className="inline-block px-3 py-1.5 rounded-lg bg-brand-600 text-[11px] font-semibold text-white">
                    Explore Listings
                  </Link>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const partner = conv.participant_1_id === currentUserId ? conv.participant_2 : conv.participant_1;
                  const name = partner?.company_name || 
                    `${partner?.first_name || ''} ${partner?.last_name || ''}`.trim() || 
                    'Property Partner';
                  const isSelected = conv.id === activeConvId;
                  const lastMsg = conv.messages && conv.messages.length > 0 
                    ? conv.messages[conv.messages.length - 1].content 
                    : 'Click to start chatting';

                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full text-left p-4 transition-all flex items-start gap-3 ${
                        isSelected ? 'bg-brand-950/40 border-l-4 border-brand-500' : 'hover:bg-gray-800/40'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-emerald-800 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden shadow">
                        {partner?.avatar_url || partner?.logo_url ? (
                          <img src={partner.avatar_url || partner.logo_url} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="text-xs font-bold text-white truncate">{name}</h4>
                          <span className="text-[10px] text-gray-500 shrink-0 ml-1">
                            {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {conv.listing && (
                          <div className="text-[10px] text-brand-400 font-semibold truncate flex items-center gap-1 mb-1">
                            <Home className="w-3 h-3 shrink-0" />
                            <span className="truncate">{conv.listing.title}</span>
                          </div>
                        )}

                        <p className="text-[11px] text-gray-400 truncate">{lastMsg}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Conversation Window */}
          <div className={`md:col-span-8 flex flex-col ${!activeConvId && 'hidden md:flex'}`}>
            {activeConv ? (
              <>
                {/* Chat Header */}
                <div className="h-18 px-6 py-3.5 border-b border-gray-800 bg-[#0f1523] flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <button 
                      onClick={() => setActiveConvId(null)}
                      className="md:hidden p-1.5 rounded-lg bg-gray-800 text-gray-300"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-emerald-800 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden shadow">
                      {otherUser?.avatar_url || otherUser?.logo_url ? (
                        <img src={otherUser.avatar_url || otherUser.logo_url} alt={otherUserName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs sm:text-sm font-bold text-white truncate">{otherUserName}</h3>
                        <span className="px-1.5 py-0.5 rounded bg-brand-950 border border-brand-500/30 text-[9px] text-emerald-400 font-semibold">
                          {otherUser?.verification_badge || 'Verified'}
                        </span>
                      </div>
                      {activeConv.listing ? (
                        <Link 
                          href={`/listings/${activeConv.listing.id}`} 
                          className="text-[10px] text-gray-400 hover:text-brand-400 truncate flex items-center gap-1 mt-0.5"
                        >
                          <span>Re: {activeConv.listing.title}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      ) : (
                        <span className="text-[10px] text-gray-500">Active Direct Communication</span>
                      )}
                    </div>
                  </div>

                  {/* Fast Action Connectors (WhatsApp & Phone) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 shadow"
                      title="Continue on WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>

                    <a
                      href={`tel:${otherPhone.replace(/\s+/g, '')}`}
                      className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
                      title={`Call ${otherPhone}`}
                    >
                      <Phone className="w-3.5 h-3.5 text-brand-400" />
                    </a>
                  </div>
                </div>

                {/* Message Feed */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#0b0f19]/40 no-scrollbar">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 text-gray-500">
                      <MessageSquare className="w-8 h-8 text-gray-600 animate-bounce" />
                      <p className="text-xs">No messages yet in this conversation.</p>
                      <p className="text-[11px] text-gray-600">Send an inquiry below to start negotiating or arranging an inspection.</p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.sender_id === currentUserId;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[80%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                              isMe
                                ? 'bg-gradient-to-r from-brand-600 to-emerald-600 text-white rounded-tr-none'
                                : 'bg-[#1f2937] text-gray-100 rounded-tl-none border border-gray-700/60'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{m.content}</p>
                          </div>
                          <span className="text-[9px] text-gray-500 mt-1 px-1">
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Box */}
                <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-gray-800 bg-[#0f1523] flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${otherUserName}...`}
                    className="flex-1 bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    disabled={sending || !inputText.trim()}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-brand-500/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 text-gray-500">
                <div className="w-16 h-16 rounded-3xl bg-gray-900 border border-gray-800 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-brand-500" />
                </div>
                <h3 className="text-sm font-bold text-white">Select a Conversation</h3>
                <p className="text-xs text-gray-400 max-w-sm">
                  Choose a thread on the left to review your chat history or contact property agents and developers directly.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
