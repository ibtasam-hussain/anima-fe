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
import logo from "@/assets/logo.png";
import logoBiome from "@/assets/biome.png";
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

const BaseUrl = import.meta.env.VITE_BASE_URL as string;
const ImageUrl = import.meta.env.VITE_IMAGE_URL as string;

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    try {
      // 1️⃣ Update Profile
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

      // 2️⃣ Change Password (if provided)
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
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Update Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={openFilePicker}
              className="h-24 w-24 overflow-hidden rounded-full border border-gray-300 bg-gray-100 hover:brightness-95"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
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
                  Click to upload
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

          {/* Name Fields */}
          <input
            type="text"
            name="firstName"
            placeholder={user?.firstName || "First Name"}
            defaultValue={user?.firstName || ""}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          <input
            type="text"
            name="lastName"
            placeholder={user?.lastName || "Last Name"}
            defaultValue={user?.lastName || ""}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />

          {/* Divider */}
          <div className="border-t my-3" />

          {/* Password Change */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Change Password
            </label>
            <input
              type="password"
              placeholder="Enter new password (optional)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#3B68F6] px-4 py-2 text-sm text-white"
            >
              Save
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

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreateGroup(name.trim());
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Create New Group</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#3B68F6] px-4 py-2 text-sm text-white"
            >
              Create
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

  if (!open) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Create New Group
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter group name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#3B68F6] focus:border-[#3B68F6] outline-none"
          />
          <div className="flex justify-end gap-2">
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

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return toast.error("Name cannot be empty");
    await onConfirm(value.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">{title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={label}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#3B68F6] focus:border-[#3B68F6] outline-none"
          />
          <div className="flex justify-end gap-2">
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- Main Component ----------
const ChatApp: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  console.log("aiSources", aiSources);
  const showLanding = messages.length === 0;
  const currentChat = chatList.find((c) => c.id === currentChatId) || null;

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
        const token = localStorage.getItem("auth_token");
        if (token) {
          const res = await fetch(`${BaseUrl}users/get-profile`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setUser(data.user);
              localStorage.setItem("user", JSON.stringify(data.user));
            }
          }
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

        // 🔹 Sync with backend (non-blocking)
        fetch(`${BaseUrl}chats/${chatId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({ title: newTitle }),
        }).catch((err) => console.warn("Title update failed:", err));
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
          meta: ai.meta ?? null,
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
    const ok = window.confirm(
      "Delete this chat? This action cannot be undone."
    );
    if (!ok) return;
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
      <div className="flex h-screen w-full gap-6 px-4 py-6 md:px-6">
        {/* Sidebar */}
        <aside
          className={`relative shrink-0 rounded-2xl bg-white shadow-sm transition-all duration-300 ease-in-out ${
            sidebarOpen ? "w-[300px]" : "w-16 overflow-hidden"
          }`}
        >
          {/* Sidebar Body */}
          <div className="flex h-full flex-col overflow-hidden">
            {/* Logo */}
            <div
              className={`flex items-center ${
                sidebarOpen ? "px-5 pt-6 pb-3" : "justify-center py-4"
              }`}
            >
              {sidebarOpen && (
                <img
                  src={logo}
                  alt="MICROBIOME"
                  className="w-60 max-w-full h-auto mb-4 object-contain"
                />
              )}
            </div>

            {/* Scrollable Section */}
            <div className="flex-1 overflow-y-auto px-3 pb-5">
              {/* New Chat Button */}
              <div
                className={
                  sidebarOpen ? "px-2 pb-4" : "flex justify-center pb-4"
                }
              >
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

                    const groupChats = chatList.filter(
                      (c) => c.groupId === group.id
                    );

                    return (
                      <div
                        key={group.id}
                        className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm"
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
                              localStorage.setItem(
                                "currentGroupId",
                                String(group.id)
                              );
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
                                  setMenuOpenGroupId(
                                    menuOpenGroupId === group.id
                                      ? null
                                      : group.id
                                  );
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

                          {/* Dropdown Menu */}
                          {menuOpenGroupId === group.id && (
                            <div className="absolute right-4 top-10 z-20 w-32 rounded-md border bg-white shadow-lg">
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
                                  const ok = window.confirm(
                                    "Delete this group? This will remove all its chats."
                                  );
                                  if (!ok) return;
                                  try {
                                    await deleteGroup(group.id);
                                    setGroups((prev) =>
                                      prev.filter((g) => g.id !== group.id)
                                    );
                                    toast.success("Group deleted successfully");
                                  } catch (err: any) {
                                    toast.error("Failed to delete group");
                                    console.error(err);
                                  } finally {
                                    setMenuOpenGroupId(null);
                                  }
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
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
                                      <div className="font-medium  border-black text-[14px]">
                                        {chat.title}
                                      </div>
                                    </div>

                                    {/* Menu */}
                                    <Ellipsis
                                      className="h-4 w-4 text-gray-400 hover:text-gray-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuOpenChatId(
                                          menuOpenChatId === chat.id
                                            ? null
                                            : chat.id
                                        );
                                      }}
                                    />

                                    {menuOpenChatId === chat.id && (
                                      <div className="absolute right-4 top-9 w-32 rounded-md border bg-white shadow-lg z-10">
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
                                          onClick={() =>
                                            handleDeleteChat(chat.id)
                                          }
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
{sidebarOpen ? (
  <div className="space-y-3 border-t border-gray-100 px-5 py-5">
    <div
      className="flex items-center justify-between rounded-xl border border-gray-200 p-3 hover:bg-gray-50"
      onClick={() => setProfileModalOpen(true)}
      role="button"
    >
      {/* Left: avatar + name */}
      <div className="flex items-center gap-3">
        <img
          src={
            user?.profile &&
            user.profile.trim() &&
            user.profile !== "null"
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

      {/* Right: settings icon */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // parent click se bachao
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
  /* ...collapsed state as-is... */
  <div className="flex flex-col items-center gap-3 border-t border-gray-100 px-2 py-4">
    <UserRound
      onClick={() => setProfileModalOpen(true)}
      className="h-4 w-4 cursor-pointer"
    />
    <SunMedium
      onClick={handleThemeToggle}
      className="h-4 w-4 text-gray-600 cursor-pointer"
    />
    <Power
      onClick={handleLogout}
      className="h-4 w-4 text-red-500 cursor-pointer"
    />
  </div>
)}

          </div>
        </aside>

        {/* Chat Section */}
        <section className="flex min-h-[84vh] flex-1 flex-col rounded-2xl bg-[#e9f1f8] overflow-hidden">
          <div className="flex items-center justify-center rounded-t-2xl border-b border-gray-200 bg-[#e9f1f8] px-4 py-4 md:px-6">
            <h1 className="mx-auto text-center text-[20px] font-semibold md:text-[22px] flex-1">
              {currentChat?.title || ""}
            </h1>
            {!showLanding && (
              <button
                className="rounded-full border border-gray-300 bg-white p-2 hover:bg-gray-50 transition"
                onClick={() => setRightPaneVisible((s) => !s)}
                aria-label={
                  rightPaneVisible ? "Collapse Resources" : "Expand Resources"
                }
              >
                {rightPaneVisible ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5 md:px-8">
            {showLanding ? (
              <div className="flex items-center justify-center h-full">
                <div className="mx-auto max-w-5xl text-center">
                  <div className="flex flex-col items-center justify-center py-12 md:py-16">
                    <img
                      src={logoBiome}
                      alt="MCSC"
                      className="h-20 w-20 md:h-24 md:w-24 opacity-95 mb-6"
                    />
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">
                      Welcome to MCSC
                    </h1>
                    <p className="max-w-2xl text-gray-500 text-base md:text-lg">
                      Your AI-powered learning companion. Ask questions, explore
                      concepts, and master new skills through interactive
                      conversations.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((m) =>
                  m.role === "user" ? (
                    <div
                      key={m.id}
                      className="flex justify-end items-end gap-2"
                    >
                      <div className="flex w-fit max-w-xl rounded-md bg-[#3B68F6] px-4 py-3 text-md text-white shadow">
                        <span>{m.content}</span>
                      </div>
                      <img
                        src={
                          user?.profile &&
                          user.profile.trim() &&
                          user.profile !== "null"
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
                    <AssistantMessage
                      key={m.id}
                      text={m.content}
                      meta={m.meta}
                      isActive={!!openSources[m.id]}
                      onToggleSource={() => {
                        setOpenSources((prev) => {
                          const next = { ...prev };
                          if (next[m.id]) delete next[m.id];
                          else if (m.meta) next[m.id] = m.meta;
                          return next;
                        });
                        setRightPaneVisible(true);
                        setRightTab("Content");
                      }}
                      isToolsActive={!!openTools[m.id]}
                      onToggleTools={() => {
                        setOpenTools((prev) => {
                          const next = { ...prev };
                          if (next[m.id]) delete next[m.id];
                          else if (m.meta?.tools?.length)
                            next[m.id] = {
                              tools: m.meta.tools,
                              query: m.meta.query,
                            };
                          return next;
                        });
                        setRightPaneVisible(true);
                        setRightTab("Tools");
                      }}
                    />
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

          <div className="sticky bottom-4 mx-auto -mb-1 w-[94%] max-w-[1050px]">
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3 rounded-full border border-gray-300 bg-white px-5 py-3 shadow-sm"
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
              >
                <SendHorizonal className="h-5 w-5" />
              </button>
            </form>
          </div>
        </section>

        {/* Right Pane */}
        {rightPaneVisible && !showLanding && (
          <aside
            className={`transition-all duration-300 ease-in-out ${
              rightPaneVisible
                ? "w-[350px] opacity-100"
                : "w-0 opacity-0 pointer-events-none"
            } shrink-0 rounded-2xl border border-gray-200 bg-[#f4f7fb] shadow-sm lg:block`}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-[18px] font-semibold">Resources</h2>
            </div>
            <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
              <div className="flex w-full rounded-full bg-gray-100 p-1">
                <button
                  onClick={() => setRightTab("Content")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm transition ${
                    rightTab === "Content"
                      ? "bg-gray-200 text-gray-900 font-medium"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <PlayCircle className="h-4 w-4" />
                  Sources
                </button>

                <button
                  onClick={() => setRightTab("Tools")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm transition ${
                    rightTab === "Tools"
                      ? "bg-gray-200 text-gray-900 font-medium"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <DownloadIcon className="h-4 w-4" />
                  Tools
                </button>
              </div>
            </div>

            <div className="h-[calc(100%-120px)] overflow-y-auto px-4 py-4 space-y-4">
              {rightTab === "Content" ? (
                // existing source rendering
                Object.keys(openSources).length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-gray-500">
                    No sources selected
                  </div>
                ) : (
                  Object.entries(openSources).map(([msgId, meta]) => (
                    <div
                      key={msgId}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-3 shadow-sm"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {meta.query || "Source"}
                      </div>
                      <div className="mt-1 text-xs text-gray-700 space-y-1">
                        {meta.where_to_find && (
                          <div>
                            <span className="font-medium">Where:</span>{" "}
                            {meta.where_to_find}
                          </div>
                        )}
                        {meta.timestamps && (
                          <div>
                            <span className="font-medium">TimeStamp:</span>{" "}
                            {meta.timestamps}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )
              ) : // 🔹 Mirrored Tools Flow
              // 🔹 URL-aware Tools rendering
              Object.keys(openTools).length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-gray-500">
                  No tools selected
                </div>
              ) : (
                Object.entries(openTools).map(([msgId, meta]: any) => {
                  // meta.tools is string[]
                  const tools: string[] = Array.isArray(meta.tools)
                    ? meta.tools
                    : [];
                  const urlItems: string[] = [];
                  const nonUrlTools: string[] = [];

                  tools.forEach((t) => {
                    const urls = extractUrls(String(t));
                    if (urls.length) {
                      urlItems.push(...urls);
                    } else {
                      nonUrlTools.push(String(t));
                    }
                  });

                  return (
                    <div
                      key={msgId}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-3 shadow-sm"
                    >
                      <div className="text-sm font-medium text-gray-900 mb-2">
                        {meta.query || "Tools used"}
                      </div>

                      {/* Non-URL tool badges */}
                      {nonUrlTools.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {nonUrlTools.map((tool, i) => (
                            <span
                              key={`tool-${i}`}
                              className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* URL links list */}
                      {urlItems.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-gray-600">
                            Links
                          </div>
                          <ul className="space-y-1">
                            {urlItems.map((url, i) => (
                              <li key={`url-${i}`}>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex max-w-full items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100 hover:underline break-all"
                                  title={url}
                                >
                                  {url}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* If nothing recognizable, show a subtle fallback */}
                      {nonUrlTools.length === 0 && urlItems.length === 0 && (
                        <div className="text-xs text-gray-500">
                          No tools reported.
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}
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
        label={`Enter new ${
          renameTarget?.type === "group" ? "group" : "chat"
        } name`}
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
