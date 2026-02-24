// src/pages/ChatApp.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Ellipsis,
  Plus,
  MessageSquareText,
  PlayCircle,
  Download as DownloadIcon,
  SendHorizonal,
  UserRound,
  SunMedium,
  Power,
  Pencil,
  ChevronDown,
  Trash2,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import PH from "@/assets/ph.jpg";
import TypingIndicator from "@/components/typingIndicator";
import AssistantMessage from "@/components/AssistantMessage";
import {
  createChat as apiCreateChat,
  addMessage as apiAddMessage,
  getUserChats as apiGetUserChats,
  getChatMessages as apiGetChatMessages,
  deleteChat as apiDeleteChat,
  createGroup,
  getGroups,
  renameChat,
  renameGroup,
  deleteGroup,
  getGroupChats,
  type Chat,
  type Message as ApiMessage,
  type AiMeta,
} from "@/apis/chatApis";

// ---------- Types ----------
type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profile?: string;
  role: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "ai";
  content: string;
  meta?: AiMeta | null;
};
// inside chatApis.ts
export type AiMeta = {
  sources?: any[];
  query?: string;
  success?: boolean;
  error?: string | null;
  timestamps?: string;
  where_to_find?: string;
  tools?: string[];
  response_time?: string | null; // ✅ add this
  ai_timestamp?: string | null; // ✅ add this
};

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// ---------- Profile Modal ----------
function ProfileModal({
  open,
  onClose,
  setUser,
}: {
  open: boolean;
  onClose: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const firstNameRef = useRef<HTMLInputElement | null>(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (open) firstNameRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    // close only if clicked on the overlay, not the card
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Escape") onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);

      // 1) Update Profile
      const res = await fetch(`${BaseUrl}users/setup-profile`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!res.ok) throw new Error(`Failed to update profile (${res.status})`);
      const data = await res.json();
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }

      // 2) Change Password (optional)
      if (newPassword.trim()) {
        const passRes = await fetch(`${BaseUrl}users/change-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({ newPassword }),
        });

        const passData = await passRes.json();
        if (!passRes.ok)
          throw new Error(passData.message || "Password update failed");
        toast.success(passData.message || "Password changed successfully");
      }

      toast.success("Profile updated successfully");
      onClose();
    } catch (err: any) {
      console.error("Profile update failed", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-3"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div
        className="w-full sm:w-[min(92vw,560px)] rounded-t-2xl sm:rounded-2xl bg-white shadow-lg
                   max-h-[90svh] overflow-y-auto p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 id="profile-modal-title" className="text-lg font-semibold">
            Update Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={openFilePicker}
              className="h-24 w-24 overflow-hidden rounded-full border border-gray-200 bg-gray-50 hover:brightness-95"
              aria-label="Upload profile picture"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
              ) : user?.profile ? (
                <img
                  src={
                    user.profile.startsWith("http")
                      ? user.profile
                      : `${ImageUrl}${user.profile}`
                  }
                  alt="Current"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                  Tap to upload
                </span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              name="profilePic"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Name Fields (stack on mobile, 2-cols on sm+) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              ref={firstNameRef}
              type="text"
              name="firstName"
              placeholder={user?.firstName || "First Name"}
              defaultValue={user?.firstName || ""}
              className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-[#3B68F6] focus:border-[#3B68F6] outline-none"
            />
            <input
              type="text"
              name="lastName"
              placeholder={user?.lastName || "Last Name"}
              defaultValue={user?.lastName || ""}
              className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-[#3B68F6] focus:border-[#3B68F6] outline-none"
            />
          </div>

          {/* Divider */}
          <div className="border-t my-3" />

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Change Password</label>
            <input
              type="password"
              placeholder="Enter new password (optional)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-[#3B68F6] focus:border-[#3B68F6] outline-none"
            />
          </div>

          {/* Actions (stack mobile) */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#3B68F6] px-4 py-2 text-sm text-white disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- Create Group Modal ----------
function CreateGroupModal({
  open,
  onClose,
  onCreateGroup,
}: {
  open: boolean;
  onClose: () => void;
  onCreateGroup: (groupName: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Escape") onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;
    setLoading(true);
    await onCreateGroup(name.trim());
    setLoading(false);
    setName("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-3"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-group-title"
    >
      <div
        className="w-full sm:w-[min(92vw,520px)] rounded-t-2xl sm:rounded-2xl bg-white shadow-lg
                   max-h-[90svh] overflow-y-auto p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 id="create-group-title" className="text-lg font-semibold">Create New Group</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-[#3B68F6] focus:border-[#3B68F6] outline-none"
          />
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#3B68F6] px-4 py-2 text-sm text-white disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- New Group Name Modal ----------
function NewGroupModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Escape") onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    onConfirm(name.trim());
    setName("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-3"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-group-title"
    >
      <div
        className="w-full sm:w-[min(92vw,520px)] rounded-t-2xl sm:rounded-2xl bg-white shadow-lg
                   max-h-[90svh] overflow-y-auto p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 id="new-group-title" className="text-lg font-semibold text-gray-900">
            Create New Group
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter group name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                       focus:ring-2 focus:ring-[#3B68F6] focus:border-[#3B68F6] outline-none"
          />
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#3B68F6] px-4 py-2 text-sm text-white hover:brightness-110"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


function RenameModal({
  open,
  onClose,
  initialValue,
  onConfirm,
  title,
  label,
}: {
  open: boolean;
  onClose: () => void;
  initialValue: string;
  onConfirm: (newName: string) => Promise<void>;
  title: string;
  label: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setValue(initialValue);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [open, initialValue]);

  if (!open) return null;

  const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Escape") onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return toast.error("Name cannot be empty");
    setSaving(true);
    await onConfirm(trimmed);
    setSaving(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-3"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rename-modal-title"
    >
      <div
        className="w-full sm:w-[min(92vw,520px)] rounded-t-2xl sm:rounded-2xl bg-white shadow-lg
                   max-h-[90svh] overflow-y-auto p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 id="rename-modal-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={label}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                       focus:ring-2 focus:ring-[#3B68F6] focus:border-[#3B68F6] outline-none"
          />
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#3B68F6] px-4 py-2 text-sm text-white hover:brightness-110 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
    
  );
}


// ---------- Main Component ----------
const ChatApp: React.FC = () => {
const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [menuOpenChatId, setMenuOpenChatId] = useState<number | null>(null);
  const [loadingSend, setLoadingSend] = useState(false);
  const [input, setInput] = useState("");
  const [rightPaneVisible, setRightPaneVisible] = useState(false);
  const [rightTab, setRightTab] = useState<"Content" | "Tools">("Content");
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [openGroupIds, setOpenGroupIds] = useState<number[]>([]);
  const [menuOpenGroupId, setMenuOpenGroupId] = useState<number | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);
  const [newGroupModalOpen, setNewGroupModalOpen] = useState(false);
  const [aiSources, setAiSources] = useState<any[]>([]);
  const [aiTools, setAiTools] = useState<string[]>([]);
  const [openSources, setOpenSources] = useState<Record<string, any>>({});
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{
    type: "group" | "chat";
    id: number;
    currentName: string;
  } | null>(null);
  const [openTools, setOpenTools] = useState<Record<string, any>>({});

  console.log("messages", messages);
  const showLanding = messages.length === 0;
  const currentChat = chatList.find((c) => c.id === currentChatId) || null;

  const groupMenuRef = useRef<HTMLDivElement | null>(null);
const chatMenuRef = useRef<HTMLDivElement | null>(null);

  // ---------- Theme Toggle ----------
  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Finds all http/https links inside any tool string
  function extractUrls(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s<>"')\]]+)/gi;
    const matches = text.match(urlRegex) || [];
    // de-dup + keep order
    return Array.from(new Set(matches));
  }

  const handleRename = async (newName: string) => {
    if (!renameTarget) return;
    try {
      if (renameTarget.type === "group") {
        const { group } = await renameGroup(renameTarget.id, newName);
        setGroups((prev) =>
          prev.map((g) => (g.id === group.id ? { ...g, name: group.name } : g))
        );
        toast.success("Group renamed successfully");
      } else if (renameTarget.type === "chat") {
        const { chat } = await renameChat(renameTarget.id, newName);
        setChatList((prev) =>
          prev.map((c) => (c.id === chat.id ? { ...c, title: chat.title } : c))
        );
        toast.success("Chat renamed successfully");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Rename failed");
    }
  };

  useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as Node;

    // ✅ if clicked outside both menus
    if (
      groupMenuRef.current &&
      !groupMenuRef.current.contains(target) &&
      chatMenuRef.current &&
      !chatMenuRef.current.contains(target)
    ) {
      setMenuOpenGroupId(null);
      setMenuOpenChatId(null);
    }
  };

  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);

useEffect(() => {
  // Whenever any modal opens, close all context menus
  if (profileModalOpen || createGroupModalOpen || renameModalOpen || newGroupModalOpen) {
    setMenuOpenChatId(null);
    setMenuOpenGroupId(null);
  }
}, [profileModalOpen, createGroupModalOpen, renameModalOpen, newGroupModalOpen]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("currentChatId");
    localStorage.removeItem("currentGroupId");
    navigate("/login");
  };

  const openGroupChat = async (groupId: number, chatId: number) => {
    setCurrentGroupId(groupId);
    await openChat(chatId);
  };
  const handleSelectGroup = (groupId: number) => {
    setCurrentGroupId(groupId);
    localStorage.setItem("currentGroupId", String(groupId)); // ✅ save groupId
  };

  // ---------- Auto Scroll ----------
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------- Helper: format "587.68s to 620.72s" → "09:47 → 10:20" ----------
  function formatTimestampRange(rangeStr: string): string {
    const match = rangeStr.match(/([\d.]+)s\s*to\s*([\d.]+)s/i);
    if (!match) return rangeStr;

    const startSec = parseFloat(match[1]);
    const endSec = parseFloat(match[2]);

    const format = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
    };

    return `${format(startSec)} → ${format(endSec)}`;
  }

  useEffect(() => {
    if (messages.length < 2) return; // need at least user + ai pair

    const latestAi = messages[messages.length - 1];
    const lastUser = messages[messages.length - 2];

    // Only run if latest is AI reply
    if (latestAi?.role === "ai" && latestAi.meta) {
      // ✅ accumulate unique sources with user query
      if (
        latestAi.meta.source ||
        latestAi.meta.where_to_find ||
        latestAi.meta.timestamps
      ) {
        setAiSources((prev) => {
          const newSource = {
            source: latestAi.meta.source ?? null,
            where: latestAi.meta.where_to_find ?? null,
            timestamps: latestAi.meta.timestamps
              ? formatTimestampRange(latestAi.meta.timestamps)
              : null,

            query: lastUser?.role === "user" ? lastUser.content : null, // 🧠 store user query
          };
          const key = [
            newSource.source,
            newSource.where,
            newSource.timestamps,
            newSource.query,
          ].join("|");
          if (
            prev.some(
              (p) =>
                [p.source, p.where, p.timestamps, p.query].join("|") === key
            )
          )
            return prev;
          return [...prev, newSource];
        });
      }

      // ✅ accumulate unique tools
      if (latestAi.meta.tools?.length) {
        setAiTools((prev) => {
          const all = new Set([...prev, ...latestAi.meta.tools!]);
          return Array.from(all);
        });
      }
    }
  }, [messages]);

  // ---------- Close 3-dot menu on outside click ----------
  useEffect(() => {
    const close = () => setMenuOpenChatId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // Load user profile from localStorage (set during local login/signup)
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        const [chats, groupRes] = await Promise.all([
          apiGetUserChats(),
          getGroups(),
        ]);

        setChatList(chats);
        setGroups(groupRes.groups || []);

        const savedGroupId = localStorage.getItem("currentGroupId");
        const savedChatId = localStorage.getItem("currentChatId");

        if (savedGroupId) {
          const gid = Number(savedGroupId);
          setCurrentGroupId(gid);
          setOpenGroupIds([gid]); // ✅ keep this group expanded after refresh
        }

        if (savedChatId) {
          await openChat(Number(savedChatId)); // ✅ load chat and messages
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load data");
      }
    })();
  }, []);

  // ---------- Group Creation ----------
  const handleCreateGroup = async (name: string) => {
    try {
      // 1️⃣ Create group
      const groupRes = await createGroup({ name });
      const newGroup = groupRes.group;

      // 2️⃣ Create default chat inside group
      const chatRes = await apiCreateChat("New Chat", newGroup.id);
      const newChat = chatRes;

      // 3️⃣ Update state
      setGroups((prev) => [newGroup, ...prev]);
      setChatList((prev) => [newChat, ...prev]);

      // 4️⃣ Set as current and open it
      setCurrentGroupId(newGroup.id);
      setCurrentChatId(newChat.id);
      setMessages([]);
      localStorage.setItem("currentGroupId", String(newGroup.id));
      localStorage.setItem("currentChatId", String(newChat.id));

      // 5️⃣ Auto open that group
      setOpenGroupIds([newGroup.id]);
      toast.success(`Group "${newGroup.name}" created and opened`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.error || "Failed to create group");
    }
  };

  const truncateTitle = (text: string, max = 50) =>
    text.length > max ? text.slice(0, max) + "..." : text;

  // ---------- Open Chat ----------
  const openChat = async (chatId: number) => {
    try {
      setOpenSources({});
      setAiSources([]);
      setAiTools([]);
      setRightPaneVisible(false);
      setOpenTools({});

      setCurrentChatId(chatId);
      localStorage.setItem("currentChatId", String(chatId)); // ✅ save chatId
if (window.innerWidth < 768) setSidebarOpen(false);

      const list = await apiGetChatMessages(chatId);
      const mapped: ChatMessage[] = list.map((m: ApiMessage) => ({
        id: String(m.id),
        role: m.sender,
        content: m.content,
        meta: m.meta ?? null,
      }));
      setMessages(mapped);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load messages");
    }
  };

  // ---------- Start New Chat ----------
  const startNewChat = () => setNewGroupModalOpen(true);

  // Add a new chat inside an existing group
  const handleAddChatToGroup = async (groupId: number) => {
    try {
      const chat = await apiCreateChat("New Chat", groupId);
      setChatList((prev) => [chat, ...prev]);
      setCurrentGroupId(groupId);
      setCurrentChatId(chat.id);
      setMessages([]);
      setRightPaneVisible(false);
    } catch (err) {
      console.error("Failed to add chat", err);
    }
  };

  const handleSend = async (text: string) => {
    const payload = text.trim();
    if (!payload || loadingSend) return;
    setLoadingSend(true);

    try {
      let groupId = currentGroupId;
      let chatId = currentChatId;

      // 🧠 1️⃣ If user hasn’t selected any group yet, create one automatically
      if (!groupId) {
        const autoGroupName = `My Conversation ${new Date()
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-")}`;
        const groupRes = await createGroup({ name: autoGroupName });
        groupId = groupRes.group.id;
        setGroups((prev) => [groupRes.group, ...prev]);
        setCurrentGroupId(groupId);
      }

      // 🧠 2️⃣ If user hasn’t selected a chat, create one inside this group
      if (!chatId) {
        const newChat = await apiCreateChat("New Chat", groupId);
        chatId = newChat.id;
        setCurrentChatId(chatId);
        setChatList((prev) => [newChat, ...prev]);
      }

      // 🧠 3️⃣ Append user's message immediately
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "user", content: payload },
      ]);
      setInput("");
      setIsTyping(true);

      // 🧠 3.5️⃣ Update chat title instantly on first user message
      if (messages.length === 0 && chatId) {
        const truncateTitle = (text: string, max = 50) =>
          text.length > max ? text.slice(0, max) + "..." : text;

        const newTitle = truncateTitle(payload);

        // 🔹 Update UI instantly
        setChatList((prev) =>
          prev.map((c) => (c.id === chatId ? { ...c, title: newTitle } : c))
        );

        // 🔹 Persist locally (non-blocking)
        renameChat(chatId, newTitle).catch((err) =>
          console.warn("Title update failed:", err)
        );
      }

      // 🧠 4️⃣ Send the message to backend
      const { ai } = await apiAddMessage({
        chatId: chatId!,
        sender: "user",
        content: payload,
      });

      // 🧠 5️⃣ Display AI response
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: String(ai.id),
          role: "ai",
          content: ai.content,
          meta: {
            ...ai.meta,
            ai_timestamp: ai.meta?.ai_timestamp || new Date().toISOString(),
            response_time: ai.meta?.response_time || null,
          },
        },
      ]);

      // ✅ Only hide pane if user manually closed all sources and tools (optional)
      if (
        Object.keys(openSources).length === 0 &&
        Object.keys(openTools).length === 0
      ) {
        setRightPaneVisible(false);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.error || "Failed to send message");
      setIsTyping(false);
    } finally {
      setLoadingSend(false);
    }
  };

  // ---------- Delete Chat ----------
  const handleDeleteChat = async (chatId: number) => {
    try {
      await apiDeleteChat(chatId);
      setChatList((prev) => prev.filter((c) => c.id !== chatId));
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
      }
      toast.success("Chat deleted");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.error || "Failed to delete chat");
    } finally {
      setMenuOpenChatId(null);
    }
  };

  // ---------- Submit ----------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  // ---------- Render ----------
return (
  <div className="min-h-screen w-full bg-[#e9f1f8] text-gray-900 antialiased overflow-x-hidden">
    {/* Mobile overlay for Sidebar */}
    <div
      className={`fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity ${
        sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => setSidebarOpen(false)}
    />

    {/* Mobile overlay for Right Pane */}
    {rightPaneVisible && !showLanding && (
      <div
        className="fixed inset-0 z-30 bg-black/40 md:hidden"
        onClick={() => setRightPaneVisible(false)}
      />
    )}

    <div className="relative flex h-screen w-full gap-3 md:gap-6 px-2 py-3 md:px-6 md:py-6">
      {/* Sidebar (Off-canvas on mobile, compact/expanded on desktop) */}
      <aside
        className={[
          "bg-white shadow-sm transition-all duration-300 ease-in-out",
          "fixed md:relative z-50 md:z-0 inset-y-0 left-0",
          "transform md:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          "w-[82vw] max-w-[320px] md:w-auto",
          sidebarOpen ? "md:w-[300px]" : "md:w-16 md:overflow-hidden",
          "rounded-none md:rounded-2xl",
        ].join(" ")}
      >
        {/* Sidebar Body */}
        <div className="flex h-full flex-col overflow-hidden">
          {/* Logo */}
          <div
            className={`flex items-center ${
              sidebarOpen ? "px-5 pt-6 pb-3" : "justify-center py-4"
            }`}
          >
{/* ✅ Close button (center right inside sidebar) */}
{sidebarOpen && (
  <button
    onClick={() => setSidebarOpen(false)}
    className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2
               rounded-full bg-white border border-gray-200 p-2 shadow-md
               hover:bg-gray-100 md:hidden z-[100]"
  >
    <ChevronLeft className="h-4 w-4 text-gray-700" />
  </button>
)}




          </div>

          {/* Scrollable Section */}
          <div className="flex-1 overflow-y-auto px-3 pb-5">
            {/* New Chat Button */}
            <div className={sidebarOpen ? "px-2 pb-4" : "flex justify-center pb-4"}>
              <button
                onClick={() => setCreateGroupModalOpen(true)}
                className={`flex items-center justify-center gap-2 h-12 rounded-full bg-[#3B68F6] text-white font-semibold shadow-sm hover:brightness-110 active:brightness-105 transition ${
                  sidebarOpen ? "w-full px-4 text-[15px]" : "w-10"
                }`}
              >
                <Plus className="h-5 w-5" />
                {sidebarOpen && <span>Start a new chat</span>}
              </button>
            </div>

            {/* Groups List */}
            <div className="space-y-3">
              {groups.length === 0 ? (
                <div className="mx-2 rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-gray-500">
                  No groups yet
                </div>
              ) : (
                groups.map((group) => {
                  const isOpen = openGroupIds.includes(group.id);
                  const groupChats = chatList.filter((c) => c.groupId === group.id);

                  return (
                    <div
                      key={group.id}
                      className="rounded-2xl bg-white border border-gray-200 shadow-sm relative"
                    >
                      <div className="relative">
                        <button
                          onClick={() => {
                            setCurrentGroupId(isOpen ? null : group.id);
                            setOpenGroupIds((prev) =>
                              prev.includes(group.id)
                                ? prev.filter((id) => id !== group.id)
                                : [...prev, group.id]
                            );
                            localStorage.setItem("currentGroupId", String(group.id));
                          }}
                          className="flex w-full items-center justify-between px-4 py-3 text-[15px] font-medium text-gray-900 hover:bg-gray-50 transition"
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquareText className="h-4 w-4 text-gray-600" />
                            <span>{group.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Ellipsis
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenGroupId(menuOpenGroupId === group.id ? null : group.id);
                              }}
                              className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer"
                            />
                            {isOpen ? (
                              <ChevronLeft className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </button>

                        {/* Group Dropdown Menu */}
                        {menuOpenGroupId === group.id && (
                          <div
                            ref={groupMenuRef}
                            className="absolute right-4 top-10 z-[9999] w-32 rounded-md border bg-white shadow-xl"
                          >
                            <button
                              onClick={() => {
                                setRenameTarget({
                                  type: "group",
                                  id: group.id,
                                  currentName: group.name,
                                });
                                setRenameModalOpen(true);
                                setMenuOpenGroupId(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Pencil className="h-4 w-4" /> Rename
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await deleteGroup(group.id);
                                  setChatList((prev) =>
                                    prev.filter((c) => c.groupId !== group.id)
                                  );
                                  if (currentGroupId === group.id) {
                                    setCurrentGroupId(null);
                                    setCurrentChatId(null);
                                    setMessages([]);
                                    setRightPaneVisible(false);
                                    localStorage.removeItem("currentGroupId");
                                    localStorage.removeItem("currentChatId");
                                  }
                                  setGroups((prev) => prev.filter((g) => g.id !== group.id));
                                  toast.success("Group and its chats deleted successfully");
                                } catch (err: any) {
                                  toast.error("Failed to delete group");
                                  console.error(err);
                                } finally {
                                  setMenuOpenGroupId(null);
                                }
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Chats inside the group */}
                      {isOpen && (
                        <div className="border-t border-gray-100 bg-gray-50/40">
                          {groupChats.length === 0 ? (
                            <div className="text-xs text-gray-400 italic px-4 py-3">
                              No chats yet
                            </div>
                          ) : (
                            groupChats.map((chat) => {
                              const active = chat.id === currentChatId;
                              return (
                                <div
                                  key={chat.id}
                                  onClick={() => openChat(chat.id)}
                                  className={`group relative flex items-center justify-between rounded-lg mx-3 my-1 px-3 py-2 cursor-pointer transition ${
                                    active
                                      ? "bg-[#EEF2FF] text-[#3B68F6]"
                                      : "hover:bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  <div>
                                    <div className="font-medium text-[14px]">
                                      {chat.title}
                                    </div>
                                  </div>

                                  {/* Chat Menu */}
                                  <Ellipsis
                                    className="h-4 w-4 text-gray-400 hover:text-gray-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMenuOpenChatId(menuOpenChatId === chat.id ? null : chat.id);
                                    }}
                                  />

                                  {menuOpenChatId === chat.id && (
                                    <div
                                      ref={chatMenuRef}
                                      className="absolute right-4 top-9 w-32 rounded-md border bg-white shadow-lg z-10"
                                    >
                                      <button
                                        onClick={() => {
                                          setRenameTarget({
                                            type: "chat",
                                            id: chat.id,
                                            currentName: chat.title,
                                          });
                                          setRenameModalOpen(true);
                                          setMenuOpenChatId(null);
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                      >
                                        <Pencil className="h-4 w-4" /> Rename
                                      </button>
                                      <button
                                        onClick={() => handleDeleteChat(chat.id)}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" /> Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}

                          {/* Add Chat Button */}
                          <button
                            onClick={() => handleAddChatToGroup(group.id)}
                            className="m-3 flex w-[calc(100%-1.5rem)] items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                          >
                            <Plus className="h-4 w-4" />
                            Add Chat
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer / Profile & Logout */}
          {sidebarOpen ? (
            <div className="space-y-3 border-t border-gray-100 px-5 py-5">
              <div
                className="flex items-center justify-between rounded-xl border border-gray-200 p-3 hover:bg-gray-50"
                onClick={() => setProfileModalOpen(true)}
                role="button"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      user?.profile && user.profile.trim() && user.profile !== "null"
                        ? user.profile.startsWith("http")
                          ? user.profile
                          : `${ImageUrl}${user.profile}`
                        : PH
                    }
                    alt="User"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-[14px] font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileModalOpen(true);
                  }}
                  className="ml-2 inline-flex items-center rounded-md p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  aria-label="Open settings"
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-3 text-red-600 hover:bg-red-100"
              >
                <Power className="h-4 w-4" />
                <span className="text-[14px]">Log out Account</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 border-t border-gray-100 px-2 py-4">
              <UserRound onClick={() => setProfileModalOpen(true)} className="h-4 w-4 cursor-pointer" />
              <SunMedium onClick={handleThemeToggle} className="h-4 w-4 text-gray-600 cursor-pointer" />
              <Power onClick={handleLogout} className="h-4 w-4 text-red-500 cursor-pointer" />
            </div>
          )}
        </div>
      </aside>

      {/* Chat Section */}
    <section className="flex flex-col flex-1 rounded-2xl bg-[#e9f1f8] overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 rounded-t-2xl border-b border-gray-200 bg-[#e9f1f8] px-3 py-3 md:px-6">
          {/* Mobile toggle for Sidebar */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-full border border-gray-300 bg-white p-2 hover:bg-gray-50"
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>

          <h1 className="mx-2 text-[16px] md:text-[20px] font-semibold truncate max-w-[55vw] md:max-w-none">
            {currentChat?.title || ""}
          </h1>

          {/* Right pane toggle */}
          {!showLanding && (
            <button
              className="inline-flex rounded-full border border-gray-300 bg-white p-2 hover:bg-gray-50 transition ml-auto"
              onClick={() => setRightPaneVisible((s) => !s)}
              aria-label={rightPaneVisible ? "Collapse Resources" : "Expand Resources"}
            >
              {rightPaneVisible ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 md:px-8 py-4 md:py-5">
          {showLanding ? (
            <div className="flex items-center justify-center h-full">
              <div className="mx-auto max-w-5xl text-center">
                <div className="flex flex-col items-center justify-center py-10 md:py-16">
                  <h1 className="text-4xl md:text-6xl font-bold mb-2 md:mb-3 text-gray-900">
                    ANIMAAI
                  </h1>
                  <h2 className="text-2xl md:text-4xl font-semibold mb-2 md:mb-3 text-gray-700">
                    Welcome to ANIMAAI
                  </h2>
                  <p className="max-w-2xl text-gray-500 text-sm md:text-lg">
                    Your AI-powered learning companion. Ask questions, explore concepts,
                    and master new skills through interactive conversations.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end items-end gap-2">
                    <div className="flex w-fit max-w-[85%] sm:max-w-xl md:max-w-2xl rounded-md bg-[#3B68F6] px-4 py-3 text-sm sm:text-base text-white shadow">
                      <span className="whitespace-pre-wrap break-words">{m.content}</span>
                    </div>
                    <img
                      src={
                        user?.profile && user.profile.trim() && user.profile !== "null"
                          ? user.profile.startsWith("http")
                            ? user.profile
                            : `${ImageUrl}${user.profile}`
                          : PH
                      }
                      alt="User"
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
                    />
                  </div>
                ) : (
                  <AssistantMessage key={m.id} text={m.content} meta={m.meta} />
                )
              )}
              {isTyping && (
                <div className="flex items-start">
                  <div className="flex w-fit max-w-xs items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 shadow">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Composer */}
<div className="sticky bottom-0 left-0 right-0 bg-[#e9f1f8] pb-3 pt-2 px-3 md:px-6">
  <form
    onSubmit={handleSubmit}
    className="flex items-center gap-2 sm:gap-3 rounded-full border border-gray-300 bg-white px-3 sm:px-5 py-2.5 sm:py-3 shadow-sm"
  >
    <input
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="What’s in your mind?"
      className="w-full bg-transparent text-[15px] outline-none placeholder:text-gray-400"
    />
    <button
      type="submit"
      disabled={loadingSend}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3B68F6] text-white hover:brightness-110 disabled:opacity-60"
      aria-label="Send message"
    >
      <SendHorizonal className="h-5 w-5" />
    </button>
  </form>
</div>

      </section>

      {/* Right pane removed – sources/tools UI no longer displayed */}
    </div>

    {/* Modals */}
    <ProfileModal
      open={profileModalOpen}
      onClose={() => setProfileModalOpen(false)}
      setUser={setUser}
    />
    <CreateGroupModal
      open={createGroupModalOpen}
      onClose={() => setCreateGroupModalOpen(false)}
      onCreateGroup={handleCreateGroup}
    />
    <RenameModal
      open={renameModalOpen}
      onClose={() => setRenameModalOpen(false)}
      initialValue={renameTarget?.currentName || ""}
      onConfirm={handleRename}
      title={`Rename ${renameTarget?.type === "group" ? "Group" : "Chat"}`}
      label={`Enter new ${renameTarget?.type === "group" ? "group" : "chat"} name`}
    />
    <NewGroupModal
      open={newGroupModalOpen}
      onClose={() => setNewGroupModalOpen(false)}
      onConfirm={async (groupName) => {
        try {
          const groupRes = await createGroup({ name: groupName });
          const newGroup = groupRes.group;
          const chat = await apiCreateChat("New Chat", newGroup.id);
          setGroups((prev) => [newGroup, ...prev]);
          setChatList((prev) => [chat, ...prev]);
          setCurrentGroupId(newGroup.id);
          setCurrentChatId(chat.id);
          setMessages([]);
          toast.success(`Group "${newGroup.name}" created successfully`);
        } catch (err) {
          toast.error("Could not create group");
        }
      }}
    />
  </div>
);

};

export default ChatApp;
