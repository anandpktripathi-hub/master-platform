import React, { useEffect, useMemo, useRef, useState } from 'react';
import { chatApi, ChatMessageDto, ChatRoomDto, ChatRoomMemberDto } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function TeamChatPage() {
  const [rooms, setRooms] = useState<ChatRoomDto[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomPrivate, setNewRoomPrivate] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<ChatRoomMemberDto[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const { user, isTenantAdmin, isPlatformAdmin } = useAuth();

  const isChatAdmin = isTenantAdmin || isPlatformAdmin;

  const selectedRoom = useMemo(
    () => rooms.find((r) => r._id === selectedRoomId) || null,
    [rooms, selectedRoomId]
  );

  useEffect(() => {
    const loadRooms = async () => {
      setLoadingRooms(true);
      setError(null);
      try {
        const data = await chatApi.listRooms();
        setRooms(data);
        if (!selectedRoomId && data.length > 0) {
          setSelectedRoomId(data[0]._id);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load chat rooms');
      } finally {
        setLoadingRooms(false);
      }
    };
    void loadRooms();
  }, []);

  useEffect(() => {
    if (!selectedRoomId) {
      setMembers([]);
      setIsMember(false);
      return;
    }

    let cancelled = false;
    const loadMembers = async () => {
      setLoadingMembers(true);
      try {
        const data = await chatApi.listMembers(selectedRoomId);
        if (cancelled) return;
        setMembers(data);
        if (user) {
          const uid = user.id;
          const found = data.some((m) => m.userId && m.userId._id === uid);
          setIsMember(found);
        } else {
          setIsMember(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          // Do not override main error banner unless necessary
          // eslint-disable-next-line no-console
          console.error('Failed to load room members', e);
        }
      } finally {
        if (!cancelled) {
          setLoadingMembers(false);
        }
      }
    };

    void loadMembers();

    return () => {
      cancelled = true;
    };
  }, [selectedRoomId, user?.id]);

  useEffect(() => {
    // SSE live updates per tenant
    const token = localStorage.getItem('token');
    if (!token) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
    const url = `${baseUrl.replace(/\/$/, '')}/chat/events?token=${encodeURIComponent(token)}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (evt) => {
      try {
        const parsed = JSON.parse(evt.data) as { type?: string; payload?: any };
        if (!parsed || parsed.type !== 'message' || !parsed.payload) return;
        const msg = parsed.payload as ChatMessageDto & { roomId?: string };
        if (!msg.roomId) return;
        // Only append if message belongs to currently selected room
        setMessages((prev) => {
          if (!selectedRoomId || msg.roomId !== selectedRoomId) return prev;
          // Avoid duplicates if already present
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      // Let browser handle reconnection; just keep quiet on errors
    };

    return () => {
      es.close();
      if (eventSourceRef.current === es) {
        eventSourceRef.current = null;
      }
    };
  }, [selectedRoomId]);

  useEffect(() => {
    if (!selectedRoomId || !selectedRoom) {
      setMessages([]);
      return;
    }

    const isPrivate = selectedRoom.isPrivate === true;
    const canView = !isPrivate || isMember;
    if (!canView) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    let intervalId: number | undefined;

    const loadMessages = async () => {
      setLoadingMessages(true);
      setError(null);
      try {
        const data = await chatApi.listMessages(selectedRoomId, { limit: 100 });
        if (!cancelled) {
          setMessages(data);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load messages');
        }
      } finally {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      }
    };

    void loadMessages();

    intervalId = window.setInterval(() => {
      void loadMessages();
    }, 8000);

    return () => {
      cancelled = true;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [selectedRoomId, selectedRoom, isMember]);

  const handleCreateRoom = async () => {
    const name = newRoomName.trim();
    if (!name) {
      setError('Room name is required');
      return;
    }
    setError(null);
    try {
      const created = await chatApi.createRoom({
        name,
        description: newRoomDescription || undefined,
        isPrivate: newRoomPrivate,
      });
      setRooms((prev) => [...prev, created]);
      setNewRoomName('');
      setNewRoomDescription('');
      setNewRoomPrivate(false);
      setSelectedRoomId(created._id);
    } catch (e: any) {
      setError(e?.message || 'Failed to create room');
    }
  };

  const handleSendMessage = async () => {
    if (!selectedRoomId) return;
    const content = newMessage.trim();
    if (!content) return;

    setSending(true);
    setError(null);
    try {
      const created = await chatApi.postMessage(selectedRoomId, content);
      setMessages((prev) => [...prev, created]);
      setNewMessage('');
    } catch (e: any) {
      setError(e?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!selectedRoomId) return;
    setError(null);
    try {
      await chatApi.joinRoom(selectedRoomId);
      // Refresh members to reflect new membership
      const data = await chatApi.listMembers(selectedRoomId);
      setMembers(data);
      if (user) {
        const uid = user.id;
        const found = data.some((m) => m.userId && m.userId._id === uid);
        setIsMember(found);
      } else {
        setIsMember(false);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to join room');
    }
  };

  const handleToggleArchive = async () => {
    if (!selectedRoomId || !selectedRoom || !isChatAdmin) return;
    setArchiving(true);
    setError(null);
    try {
      const updated = await chatApi.archiveRoom(selectedRoomId, !selectedRoom.isArchived);
      setRooms((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
    } catch (e: any) {
      setError(e?.message || 'Failed to update room archive status');
    } finally {
      setArchiving(false);
    }
  };

  const handleRemoveMember = async (memberUserId: string) => {
    if (!selectedRoomId || !isChatAdmin) return;
    setRemovingMemberId(memberUserId);
    setError(null);
    try {
      await chatApi.removeMember(selectedRoomId, memberUserId);
      setMembers((prev) => prev.filter((m) => m.userId._id !== memberUserId));
    } catch (e: any) {
      setError(e?.message || 'Failed to remove member');
    } finally {
      setRemovingMemberId(null);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <h1 className="text-2xl font-semibold mb-4">Team Chat</h1>
      <div className="text-sm text-slate-400 mb-4 max-w-3xl">
        Use tenant-scoped rooms to coordinate with your team inside the app.
        Messages never leave your workspace and are isolated per tenant.
      </div>
      {error && (
        <div className="mb-3 rounded border border-red-500 bg-red-900/20 text-red-300 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      <div className="flex flex-1 min-h-[420px] border border-slate-700 rounded-lg overflow-hidden bg-slate-900/40">
        {/* Rooms list */}
        <div className="w-64 border-r border-slate-800 flex flex-col">
          <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-slate-400">Rooms</span>
            {loadingRooms && <span className="text-[10px] text-slate-500">Loading…</span>}
          </div>
          <div className="flex-1 overflow-y-auto">
            {rooms.map((room) => (
              <button
                key={room._id}
                onClick={() => setSelectedRoomId(room._id)}
                className={`w-full text-left px-3 py-2 text-sm border-b border-slate-800 hover:bg-slate-800/60 transition ${
                  selectedRoomId === room._id ? 'bg-slate-800/80 text-sky-300' : 'text-slate-200'
                }`}
              >
                <div className="font-medium flex items-center justify-between">
                  <span>{room.name}</span>
                  {room.isDefault && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-700/40 text-sky-200 border border-sky-600/60">
                      default
                    </span>
                  )}
                </div>
                {room.description && (
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{room.description}</div>
                )}
              </button>
            ))}
            {rooms.length === 0 && !loadingRooms && (
              <div className="p-3 text-xs text-slate-500">No rooms yet.</div>
            )}
          </div>
          <div className="border-t border-slate-800 p-3 space-y-2 bg-slate-900/60">
            <input
              type="text"
              className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="New room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
            />
            <input
              type="text"
              className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Optional description"
              value={newRoomDescription}
              onChange={(e) => setNewRoomDescription(e.target.value)}
            />
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                className="rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500"
                checked={newRoomPrivate}
                onChange={(e) => setNewRoomPrivate(e.target.checked)}
              />
              <span>Private room (members only)</span>
            </label>
            <button
              onClick={handleCreateRoom}
              className="w-full mt-1 text-xs font-medium px-2 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loadingRooms}
            >
              + Create Room
            </button>
          </div>
        </div>

        {/* Messages column */}
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-100">
                {selectedRoom?.name || 'Select a room'}
              </div>
              {selectedRoom?.description && (
                <div className="text-xs text-slate-500">{selectedRoom.description}</div>
              )}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              {selectedRoom?.isPrivate && (
                <span className="px-1.5 py-0.5 rounded-full border border-slate-600 bg-slate-900/60 text-slate-200 flex items-center gap-1">
                  <span className="material-icons" style={{ fontSize: 12 }}>lock</span>
                  Private room
                </span>
              )}
              {selectedRoom?.isArchived && (
                <span className="px-1.5 py-0.5 rounded-full border border-amber-600 bg-amber-900/40 text-amber-200 flex items-center gap-1">
                  <span className="material-icons" style={{ fontSize: 12 }}>inventory_2</span>
                  Archived
                </span>
              )}
              {loadingMessages && (
                <span>Refreshing…</span>
              )}
            </div>
          </div>
          {selectedRoom && (
            <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] bg-slate-900/40">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="font-medium">Members:</span>
                <span>{members.length}</span>
              </div>
              <div className="flex items-center gap-2">
                {isChatAdmin && (
                  <button
                    onClick={handleToggleArchive}
                    className="px-3 py-1 rounded border border-slate-600 bg-slate-900 text-slate-200 text-[11px] hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={archiving}
                  >
                    {selectedRoom.isArchived ? 'Unarchive room' : 'Archive room'}
                  </button>
                )}
                {!isMember && (
                  <button
                    onClick={handleJoinRoom}
                    className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={loadingMembers}
                  >
                    Join room
                  </button>
                )}
                {loadingMembers && (
                  <span className="text-slate-500 text-[10px]">Updating…</span>
                )}
              </div>
            </div>
          )}
          {selectedRoom && members.length > 0 && (
            <div className="px-4 py-2 border-b border-slate-800 flex flex-wrap gap-1 text-[11px] text-slate-200 bg-slate-900/30">
              {members.map((m) => {
                const u = m.userId;
                const label =
                  (u.name && u.name.trim()) ||
                  (u.firstName || u.lastName
                    ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
                    : undefined) ||
                  u.username ||
                  u.email ||
                  u._id.slice(-6);
                const isSelf = user && u._id === user.id;
                return (
                  <span
                    key={m._id}
                    className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-600/80 flex items-center gap-1"
                  >
                    <span>{label}{isSelf ? ' (you)' : ''}</span>
                    {m.role === 'admin' && (
                      <span className="text-[9px] uppercase tracking-wide text-sky-300">admin</span>
                    )}
                    {isChatAdmin && !isSelf && m.role !== 'admin' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(u._id)}
                        className="ml-1 text-[9px] uppercase tracking-wide text-red-300 hover:text-red-200 disabled:opacity-50"
                        disabled={removingMemberId === u._id}
                      >
                        remove
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 text-sm">
            {!selectedRoom && (
              <div className="text-slate-500 text-sm">Pick a room on the left to start chatting.</div>
            )}
            {selectedRoom && selectedRoom.isPrivate && !isMember && (
              <div className="text-slate-400 text-sm">
                This is a private room. Join the room to see and send messages.
              </div>
            )}
            {selectedRoom && messages.length === 0 && !loadingMessages && (!selectedRoom.isPrivate || isMember) && (
              <div className="text-slate-500 text-sm">No messages yet. Start the conversation below.</div>
            )}
            {selectedRoom && (!selectedRoom.isPrivate || isMember) &&
              messages.map((m) => (
                <div key={m._id} className="flex flex-col max-w-xl">
                  <div className="inline-block rounded-lg bg-slate-800/80 px-3 py-2 text-slate-100">
                    {m.content}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{formatTime(m.createdAt)}</div>
                </div>
              ))}
          </div>
          <div className="border-t border-slate-800 p-3 bg-slate-900/70 flex items-center gap-2">
            <textarea
              className="flex-1 resize-none rounded bg-slate-900 border border-slate-700 text-sm text-slate-100 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500"
              rows={2}
              placeholder={
                selectedRoom
                  ? selectedRoom.isPrivate && !isMember
                    ? 'Join the room to start chatting'
                    : 'Type a message and hit Send'
                  : 'Select a room to start chatting'
              }
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!selectedRoom || sending || (selectedRoom.isPrivate && !isMember)}
            />
            <button
              onClick={handleSendMessage}
              disabled={!selectedRoom || sending || !newMessage.trim() || (selectedRoom?.isPrivate && !isMember)}
              className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
