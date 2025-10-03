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
  ChevronDown,
  Trash2, // <-- NEW
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AssistantMessage from "../components/AssistantMessage";
import PH from "../assets/ph.jpg";
import logo from "../assets/logo.png";
import { toast } from "react-hot-toast";
import { FiBookOpen, FiCode } from "react-icons/fi";
import { AiOutlineCalculator } from "react-icons/ai";
import {
  createChat as apiCreateChat,
  addMessage as apiAddMessage,
  getUserChats as apiGetUserChats,
  getChatMessages as apiGetChatMessages,
  deleteChat as apiDeleteChat, // <-- NEW
  type Chat as ChatRow,
  type Message as ApiMessage,
  type AiMeta,
} from "../apis/chatApis";
import TypingIndicator from "@/components/typingIndicator";

const BaseUrl = import.meta.env.VITE_BASE_URL as string;
const ImageUrl = import.meta.env.VITE_IMAGE_URL as string;

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
  role: "user" | "assistant";
  content: string;
  meta?: AiMeta | null;
};
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
      onClose();
    } catch (err) {
      console.error("Profile update failed", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Update Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const ChatApp: React.FC = () => {
  const [showRightPane, setShowRightPane] = useState<boolean>(true);
  const [rightTab, setRightTab] = useState<"Content" | "Tools">("Content");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
const [isTyping, setIsTyping] = useState(false);

  // Chats & messages
  const [chatList, setChatList] = useState<ChatRow[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingSend, setLoadingSend] = useState(false);
  const [input, setInput] = useState("");

  // NEW: per-chat menu state
  const [menuOpenChatId, setMenuOpenChatId] = useState<number | null>(null);

  const showLanding = messages.length === 0;
  const currentChat = useMemo(
    () => chatList.find((c) => c.id === currentChatId) || null,
    [chatList, currentChatId]
  );
  const headerTitle = currentChat
    ? currentChat.title : ""
   

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  // Close menu on outside click
  useEffect(() => {
    const close = () => setMenuOpenChatId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // Load profile + chats
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (token) {
          const res = await fetch(`${BaseUrl}users/get-profile`, {
            method: "GET",
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
        const chats = await apiGetUserChats();
        setChatList(chats);
      } catch (e: any) {
        console.error(e);
        toast.error("Failed to load chats");
      }
    })();
  }, []);

  const openChat = async (chatId: number) => {
    try {
      setCurrentChatId(chatId);
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

  const startNewChat = async () => {
    try {
      const chat = await apiCreateChat("New Chat");
      setChatList((prev) => [chat, ...prev]);
      setCurrentChatId(chat.id);
      setMessages([]);
    } catch {
      toast.error("Could not start a new chat");
    }
  };

const handleSend = async (text: string) => {
  const payload = text.trim();
  if (!payload || loadingSend) return;
  setLoadingSend(true);

  try {
    let chatId = currentChatId;
    if (!chatId) {
      const newChat = await apiCreateChat("New Chat");
      chatId = newChat.id;
      setCurrentChatId(chatId);
      setChatList((prev) => [newChat, ...prev]);
    }

    setMessages((prev) => [
      ...prev,
      { id: uid(), role: "user", content: payload },
    ]);
    setInput("");

    // ✅ Start typing indicator
    setIsTyping(true);

    const { ai } = await apiAddMessage({
      chatId: chatId!,
      sender: "user",
      content: payload,
    });

    // ✅ Stop typing indicator
    setIsTyping(false);

    setMessages((prev) => [
      ...prev,
      {
        id: String(ai.id),
        role: "assistant",
        content: ai.content,
        meta: ai.meta ?? null,
      },
    ]);

    setChatList((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((c) => c.id === chatId);
      if (idx !== -1) {
        if (copy[idx].title === "New Chat") {
          copy[idx] = { ...copy[idx], title: payload.slice(0, 50) };
        }
        const [item] = copy.splice(idx, 1);
        copy.unshift(item);
      }
      return copy;
    });
  } catch (e: any) {
    console.error(e);
    toast.error(e?.response?.data?.error || "Failed to send message");
    setIsTyping(false); // ✅ fail case bhi
  } finally {
    setLoadingSend(false);
  }
};


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  // --- Delete Chat handler ---
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
        setMessages([]); // reset to landing
      }
      toast.success("Chat deleted");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.error || "Failed to delete chat");
    } finally {
      setMenuOpenChatId(null);
    }
  };

  // ===== Right pane data (AI-driven) =====
  const sourcesForPane = useMemo(() => {
    const items = messages
      .filter((m) => m.role === "assistant")
      .map((m) => ({
        source: m.meta?.source ?? null,
        where: m.meta?.where_to_find ?? null,
        timestamps: m.meta?.timestamps ?? null,
      }))
      .filter((s) => s.source || s.where || s.timestamps);
    const key = (s: any) => [s.source, s.where, s.timestamps].join("|");
    const seen = new Set<string>();
    return items.filter((s) => {
      const k = key(s);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [messages]);

  const latestTools = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role === "assistant" && m.meta?.tools?.length) return m.meta.tools!;
    }
    return [];
  }, [messages]);

  return (
    <div className="min-h-screen w-full bg-[#e9f1f8] text-gray-900 antialiased overflow-x-hidden">
      <div className="flex h-screen w-full gap-6 px-4 py-6 md:px-6">
        {/* LEFT SIDEBAR */}
<aside
  className={[
    "relative shrink-0 rounded-2xl bg-white shadow-sm transition-all duration-300 ease-in-out",
    sidebarOpen ? "w-[300px]" : "w-16", // ✅ collapsed width
    !sidebarOpen && "overflow-hidden", // ✅ no scrollbar when closed
  ].join(" ")}
>
  {/* toggle hidden to match visual */}
  <button
    aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
    onClick={() => setSidebarOpen((s) => !s)}
    className="hidden absolute -right-3 top-1/2 -translate-y-1/2 z-20 rounded-full border border-gray-200 bg-white p-1.5 shadow hover:bg-gray-50 lg:flex"
  >
    {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
  </button>

  <div className="flex h-full flex-col">
    {/* Logo */}
    <div className={`flex items-center ${sidebarOpen ? "px-5 pt-6 pb-3" : "justify-center py-4"}`}>
      {sidebarOpen && (
        <img
          src={logo}
          alt="MICROBIOME"
          className="w-60 max-w-full h-auto mb-4 object-contain"
        />
      )}
    </div>

    {/* Start a new chat */}
    <div className={sidebarOpen ? "px-5 pt-1 pb-4" : "flex justify-center pb-4"}>
      <button
        onClick={async (e) => {
          e.stopPropagation();
          await startNewChat();
        }}
        className={[
          "flex items-center justify-center gap-2 h-12 rounded-full bg-[#3B68F6] text-white text-[15px] font-semibold shadow-sm hover:brightness-110 active:brightness-105 transition",
          sidebarOpen ? "w-full px-4" : "w-10",
        ].join(" ")}
      >
        <Plus className="h-5 w-5" />
        {sidebarOpen && <span>Start a new chat</span>}
      </button>
    </div>

    {/* Chat history */}
    <div className={`flex-1 ${sidebarOpen ? "overflow-y-auto px-3 pb-4" : "overflow-hidden"}`}>
      {sidebarOpen && (
        <div className="px-2 pb-2 text-[12px] uppercase tracking-wide text-gray-500">
          Recent chats
        </div>
      )}

      <div className="space-y-2">
        {chatList.length === 0 ? (
          sidebarOpen && (
            <div className="mx-2 rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-gray-500">
              No chats yet
            </div>
          )
        ) : (
          chatList.map((chat) => {
            const active = chat.id === currentChatId;
            return (
<div
  key={chat.id}
  onClick={() => openChat(chat.id)}
  className={[
    "relative flex items-center gap-2 cursor-pointer",
    "rounded-lg border px-1 py-1 m-1",   // ⬅️ smaller padding
    "hover:bg-gray-50 transition",
    active ? "border-[#3B68F6]/30 bg-[#3B68F6]/5" : "border-gray-200 bg-white",
  ].join(" ")}
>
  <div className="flex items-center justify-center h-7 w-7 shrink-0 rounded-md bg-gray-50">
    <MessageSquareText className="h-4 w-4 text-gray-700" />
  </div>

  {sidebarOpen && (
    <div className="min-w-0 flex-1">
      <div className="truncate text-[14px] font-medium text-gray-900">
        {chat.title}
      </div>
      <div className="mt-0.5 text-[11px] text-gray-500">
        {new Date(chat.updatedAt).toLocaleString()}
      </div>
    </div>
  )}

  {sidebarOpen && (
    <button
      className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
      onClick={(e) => {
        e.stopPropagation();
        setMenuOpenChatId((id) => (id === chat.id ? null : chat.id));
      }}
    >
      <Ellipsis className="h-4 w-4" />
    </button>
  )}
</div>

            );
          })
        )}
      </div>
    </div>

    {/* Footer */}
    {sidebarOpen ? (
      <div className="space-y-3 border-t border-gray-100 px-5 py-5">
        <div
          className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 cursor-pointer hover:bg-gray-50"
          onClick={() => setProfileModalOpen(true)}
        >
          <img
            src={
              user?.profile && user.profile.trim() !== "" && user.profile !== "null" && user.profile !== "undefined"
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
          onClick={handleThemeToggle}
          className="flex w-full items-center gap-3 rounded-xl border border-gray-200 p-3 hover:bg-gray-50"
        >
          <SunMedium className="h-4 w-4 text-gray-700" />
          <span className="text-[14px]">Switch Light Mode</span>
        </button>

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


        {/* --------- CENTER (same as before) --------- */}
        <section className="flex min-h-[84vh] flex-1 flex-col rounded-2xl bg-[#e9f1f8] overflow-hidden">
          <div className="flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-[#e9f1f8] px-4 py-4 md:px-6">
            <h1 className="text-[20px] font-semibold md:text-[22px]">
              {headerTitle}
            </h1>

            {/* Ellipsis button sirf tab dikhana jab landing screen na ho */}
            {!showLanding && (
              <button
                className="rounded-full border border-gray-300 bg-white p-2 hover:bg-gray-50"
                onClick={() => setShowRightPane((s) => !s)}
              >
                <Ellipsis className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5 md:px-8">
            {showLanding ? (
              <div className="mx-auto max-w-5xl">
                <div className="flex flex-col items-center text-center py-12 md:py-16">
                  {/* Logo */}
                  <img
                    src={logo}
                    alt="MCSC"
                    className="h-20 w-20 md:h-24 md:w-24 opacity-95 mb-6"
                  />

                  {/* Title */}
                  <h1 className="text-4xl md:text-5xl font-bold mb-3">
                    Welcome to MCSC
                  </h1>

                  {/* Subtitle */}
                  <p className="max-w-2xl text-gray-500 text-base md:text-lg">
                    Your AI-powered learning companion. Ask questions, explore
                    concepts, and master new skills through interactive
                    conversations.
                  </p>
                </div>

                {/* Cards Section */}
                <div className="grid gap-6 md:grid-cols-3">
                  {[
                    {
                      title: "Concepts",
                      icon: FiBookOpen,
                      bg: "bg-blue-50 text-blue-600",
                      prompts: [
                        "Show me an example of useEffect",
                        "Help me optimize this algorithm",
                        "Review my code for best practices",
                        "Show me an example of useEffect",
                      ],
                    },
                    {
                      title: "Practice",
                      icon: FiCode,
                      bg: "bg-green-50 text-green-600",
                      prompts: [
                        "Show me an example of useEffect",
                        "Help me optimize this algorithm",
                        "Review my code for best practices",
                        "Show me an example of useEffect",
                      ],
                    },
                    {
                      title: "Problem Solving",
                      icon: AiOutlineCalculator,
                      bg: "bg-purple-50 text-purple-600",
                      prompts: [
                        "Show me an example of useEffect",
                        "Help me optimize this algorithm",
                        "Review my code for best practices",
                        "Show me an example of useEffect",
                      ],
                    },
                  ].map((section, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-4 rounded-2xl bg-[#f9fbfd] p-6 shadow-sm border border-gray-100"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-lg ${section.bg}`}
                        >
                          <section.icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {section.title}
                        </h3>
                      </div>

                      {/* Prompts */}
                      <div className="flex flex-col divide-y pt-4 gap-2 divide-gray-100">
                        {section.prompts.map((t, i) => (
                          <button
                            key={i}
                            onClick={() => (setInput(t), handleSend(t))}
                            className="text-left text-sm text-gray-600 hover:text-gray-900 py-2"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
<div className="space-y-6">
  {messages.map((m) =>
    m.role === "user" ? (
      <div key={m.id} className="flex justify-end">
        {/* User message */}
<div className="flex w-fit max-w-xl items-center gap-2 rounded-lg bg-[#3B68F6] px-4 py-3 text-md text-white shadow">
  <span>{m.content}</span>
  <img
    src={
      user?.profile &&
      user.profile !== "null" &&
      user.profile !== "undefined" &&
      user.profile.trim() !== ""
        ? user.profile.startsWith("http")
          ? user.profile
          : `${ImageUrl}${user.profile}`
        : PH
    }
    alt="User"
    className="h-6 w-6 rounded-full object-cover ring-2 ring-white"
  />
</div>

      </div>
    ) : (
      <AssistantMessage
        key={m.id}
        text={m.content}
        tools={m.meta?.tools ?? []}
        source={m.meta?.source ?? null}
        where={m.meta?.where_to_find ?? null}
        timestamps={m.meta?.timestamps ?? null}
      />
    )
  )}

  {/* ✅ Typing Indicator */}
  {isTyping && (
    <div className="flex items-start">
      <div className="flex w-fit max-w-xs items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 shadow">
        <TypingIndicator />
      </div>
    </div>
  )}
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
                title={loadingSend ? "Sending..." : "Send"}
              >
                <SendHorizonal className="h-5 w-5" />
              </button>
            </form>
          </div>
        </section>

        {/* --------- RIGHT PANE (unchanged, AI-driven) --------- */}
        {showRightPane && !showLanding && (
          <aside className="hidden w-[350px] shrink-0 rounded-2xl border border-gray-200 bg-[#f4f7fb] shadow-sm lg:block">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-[18px] font-semibold">Panel</h2>
            </div>
            <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
              <div className="flex w-full rounded-full bg-gray-100 p-1">
                <button
                  onClick={() => setRightTab("Content")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm ${
                    rightTab === "Content"
                      ? "bg-white shadow text-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <PlayCircle className="h-4 w-4" />
                  Sources
                </button>
                <button
                  onClick={() => setRightTab("Tools")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm ${
                    rightTab === "Tools"
                      ? "bg-white shadow text-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <DownloadIcon className="h-4 w-4" />
                  Tools
                </button>
              </div>
            </div>
            <div className="h-[calc(100%-120px)] overflow-y-auto px-4 py-4 space-y-4">
              {rightTab === "Content"
                ? (() => {
                    const items = messages
                      .filter((m) => m.role === "assistant")
                      .map((m) => ({
                        source: m.meta?.source ?? null,
                        where: m.meta?.where_to_find ?? null,
                        timestamps: m.meta?.timestamps ?? null,
                      }))
                      .filter((s) => s.source || s.where || s.timestamps);
                    if (items.length === 0) {
                      return (
                        <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-gray-500">
                          No sources yet
                        </div>
                      );
                    }
                    // dedupe
                    const seen = new Set<string>();
                    const uniq = items.filter((s) => {
                      const k = [s.source, s.where, s.timestamps].join("|");
                      if (seen.has(k)) return false;
                      seen.add(k);
                      return true;
                    });
                    return uniq.map((s, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-3 shadow-sm"
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {s.source || "Source"}
                        </div>
                        <div className="mt-1 text-xs text-gray-700 space-y-1">
                          {s.where && (
                            <div>
                              <span className="font-medium">Where:</span>{" "}
                              {s.where}
                            </div>
                          )}
                          {s.timestamps && (
                            <div>
                              <span className="font-medium">Time:</span>{" "}
                              {s.timestamps}
                            </div>
                          )}
                        </div>
                      </div>
                    ));
                  })()
                : (() => {
                    let tools: string[] = [];
                    for (let i = messages.length - 1; i >= 0; i--) {
                      const m = messages[i];
                      if (m.role === "assistant" && m.meta?.tools?.length) {
                        tools = m.meta.tools!;
                        break;
                      }
                    }
                    return tools.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-gray-500">
                        No tools provided by AI
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {tools.map((t, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
            </div>
          </aside>
        )}
      </div>
      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        setUser={setUser}
      />
    </div>
  );
};

export default ChatApp;
