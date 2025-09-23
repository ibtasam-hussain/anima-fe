// src/pages/ChatApp.tsx
import React, { useMemo, useEffect, useState, useRef } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Ellipsis,
  Plus,
  MessageSquareText,
  PlayCircle,
  BookOpen,
  Code2,
  PanelsTopLeft,
  Clock,
  Copy,
  RefreshCw,
  SendHorizonal,
  UserRound,
  SunMedium,
  Power,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AssistantMessage from "../components/AssistantMessage";
import { set } from "date-fns";
import { toast } from "react-hot-toast";
import PH from "../assets/ph.jpg";
import logo from "../assets/logo.png";

const BaseUrl = import.meta.env.VITE_BASE_URL as string;
const ImageUrl = import.meta.env.VITE_IMAGE_URL as string;

type Topic = {
  id: string;
  title: string;
  children?: { id: string; title: string; messages: number }[];
  expanded?: boolean;
};

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profile?: string;
  role: string;
};

const SIDEBAR_TOPICS: Topic[] = [
  {
    id: "react-fundamentals-a",
    title: "React Fundamentals",
    expanded: true,
    children: [
      {
        id: "understanding-components",
        title: "Understanding Components",
        messages: 12,
      },
      { id: "state-and-props", title: "State and Props", messages: 12 },
    ],
  },
  { id: "javascript-concepts", title: "JavaScript Concepts" },
  { id: "css-stylings", title: "CSS Stylings" },
  { id: "react-fundamentals-b", title: "React Fundamentals" },
];

// Lesson + Download source data
const lessonSources = [
  {
    id: "lesson1",
    title: "Lesson Source 1",
    count: 5,
    items: [],
  },
  {
    id: "lesson2",
    title: "Lesson Source 2",
    count: 5,
    items: [
      {
        label: "Concept",
        duration: "0:00 (3:42)",
        title: "Introduction to React Components",
        link: "#",
      },
      {
        label: "Concept",
        duration: "3:43 (5:21)",
        title: "JSX Basics",
        link: "#",
      },
    ],
  },
];

const downloadSources = [
  {
    id: "download1",
    title: "Download Source 1",
    count: 5,
    items: [],
  },
  {
    id: "download2",
    title: "Download Source 2",
    count: 5,
    items: [
      {
        title: "Props Calculator",
        tag: "Popular",
        description: "Debug React components and inspect state changes",
      },
      {
        title: "State Inspector",
        tag: "New",
        description: "Analyze React state flow in real time",
      },
    ],
  },
];

const SUGGESTED_TOOLS = ["Provide Source", "Download PDF"];

const RightPaneTabs = {
  Content: "Content",
  Tools: "Tools",
} as const;
type RightTab = (typeof RightPaneTabs)[keyof typeof RightPaneTabs];

function ProfileModal({
  open,
  onClose,
  setUser,
}: {
  open: boolean;
  onClose: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // 👈 add this
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const res = await fetch(`${BaseUrl}/users/setup-profile`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!res.ok) throw new Error(`Failed to update profile (${res.status})`);

      const data = await res.json();

      if (data.user) {
        // Update state + localStorage instantly
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }

      console.log("Profile updated", data);
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
          {/* Preview (acts as button) */}
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

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              name="profilePic"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Name fields */}
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

          {/* Buttons */}
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
  const [topics, setTopics] = useState<Topic[]>(SIDEBAR_TOPICS);
  const [activeChildId, setActiveChildId] = useState<string>(
    "understanding-components"
  );
  const [showRightPane, setShowRightPane] = useState<boolean>(true);
  const [rightTab, setRightTab] = useState<RightTab>("Content");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  const activeChild = useMemo(() => {
    return topics
      .flatMap((t) => t.children ?? [])
      .find((c) => c?.id === activeChildId);
  }, [topics, activeChildId]);

  const title = activeChild?.title ?? "Understanding Components";

  const toggleTopic = (id: string) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, expanded: !t.expanded } : t))
    );
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          console.warn("No auth token found");
          return;
        }

        const res = await fetch(`${BaseUrl}/users/get-profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch profile (${res.status})`);
        }

        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
          console.log("User saved:", data.user);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#e9f1f8] text-gray-900 antialiased overflow-x-hidden">
      <div className="flex h-screen w-full gap-6 px-4 py-6 md:px-6">
        {/* LEFT SIDEBAR */}
        <aside
          className={[
            "shrink-0 rounded-2xl bg-white shadow-sm transition-all",
            sidebarOpen ? "w-[270px]" : "w-16",
          ].join(" ")}
        >
          <div className="relative flex h-full flex-col">
            <div className="flex items-center gap-3 px-5 pt-6 pb-3">
              {sidebarOpen && (
                <div className="flex items-center justify-center">
                  <img
                    src={logo}
                    alt="Microbiome Logo"
                    className="w-80 md:w-[28rem] mb-8 object-contain"
                  />
                </div>
              )}
            </div>

            <button
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              onClick={() => setSidebarOpen((s) => !s)}
              className="absolute right-3 top-4 rounded-full border border-gray-200 bg-white p-1.5 hover:bg-gray-50"
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {/* New Chat */}
            <div className="px-5 pt-2 pb-4">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B68F6] px-4 py-3 text-white shadow-sm hover:brightness-105 active:brightness-[1.08] transition">
                <Plus className="h-5 w-5" />
                {sidebarOpen && (
                  <span className="font-medium">Start a new chat</span>
                )}
              </button>
            </div>

            {/* Topics */}
            <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-4">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="rounded-xl border border-gray-200 bg-white"
                >
                  <button
                    onClick={() =>
                      topic.children
                        ? toggleTopic(topic.id)
                        : setActiveChildId(topic.id)
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 hover:bg-gray-50"
                  >
                    <MessageSquareText className="h-4 w-4 text-gray-700" />
                    {sidebarOpen && (
                      <span className="flex-1 text-[15px] font-medium">
                        {topic.title}
                      </span>
                    )}
                    {topic.children && sidebarOpen && (
                      <span className="text-gray-500">
                        {topic.expanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </button>
                  {topic.children && topic.expanded && sidebarOpen && (
                    <div className="space-y-2 px-2 pb-2">
                      {topic.children.map((c) => (
                        <div
                          key={c.id}
                          className={[
                            "flex items-center gap-2 rounded-lg px-3 py-3",
                            activeChildId === c.id
                              ? "border-[#3B68F6]/30 bg-[#3B68F6]/5"
                              : "border-gray-200 bg-white",
                          ].join(" ")}
                        >
                          <button
                            onClick={() => setActiveChildId(c.id)}
                            className="group flex w-full items-center gap-3 text-left"
                          >
                            <PanelsTopLeft className="h-4 w-4 text-gray-600" />
                            <div className="flex-1">
                              <div className="text-[14px] font-medium leading-none text-gray-800">
                                {c.title}
                              </div>
                              <div className="mt-1 text-[11px] text-gray-500">
                                {c.messages} Messages
                              </div>
                            </div>
                          </button>
                          <button
                            aria-label="More"
                            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-50"
                          >
                            <Ellipsis className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            {sidebarOpen ? (
              <div className="space-y-3 border-t border-gray-100 px-5 py-4">
                <div
                  className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => setProfileModalOpen(true)}
                >
                  <img
                    src={
                      user?.profile &&
                      user.profile !== "null" &&
                      user.profile !== "undefined" &&
                      user.profile.trim() !== ""
                        ? user.profile.startsWith("http")
                          ? user.profile // ✅ Google / Facebook / external URL
                          : `${ImageUrl}${user.profile}` // ✅ local server image
                        : PH
                    }
                    alt="User"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-[14px] font-semibold">
                      {user?.firstName} {user?.lastName}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleThemeToggle}
                  className="flex w-full items-center gap-3 rounded-xl border border-gray-200 p-3 hover:bg-gray-50"
                >
                  <SunMedium className="h-4 w-4 text-gray-700" />
                  <span className="text-[14px]">
                    Switch {darkMode ? "Light" : "Dark"} Mode
                  </span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-3 text-red-600 hover:bg-red-100"
                >
                  <Power className="h-4 w-4" />
                  <span className="text-[14px]">Log out</span>
                </button>
              </div>
            ) : (
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

        {/* CENTER CHAT */}
        <section className="flex min-h-[84vh] flex-1 flex-col rounded-2xl bg-[#e9f1f8] overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-[#e9f1f8] px-4 py-4 md:px-6">
            <h1 className="text-[20px] font-semibold md:text-[22px]">
              {title}
            </h1>
            <button
              className="rounded-full border border-gray-300 bg-white p-2 hover:bg-gray-50"
              onClick={() => setShowRightPane((s) => !s)}
            >
              <Ellipsis className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5 md:px-8">
            <AssistantMessage
              text={`Welcome to The Biome Learning Center! I'm your AI biology tutor. I can help you understand biological concepts, answer questions about life sciences, and guide you through your studies. What biological topic would you like to explore today?`}
              tools={["Visual Diagrams", "Provide Sources"]}
            />

            {/* User message */}
            <div className="flex justify-end">
              <div className="flex w-fit max-w-xl items-center gap-2 rounded-lg bg-[#3B68F6] px-4 py-3 text-sm text-white shadow">
                <span>Describe the nitrogen cycle in ecosystems</span>
                <img
                  src={
                    user?.profile &&
                    user.profile !== "null" &&
                    user.profile !== "undefined" &&
                    user.profile.trim() !== ""
                      ? user.profile.startsWith("http")
                        ? user.profile // ✅ Google / Facebook / external URL
                        : `${ImageUrl}${user.profile}` // ✅ local server image
                      : PH
                  }
                  alt=""
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
                />
              </div>
            </div>
          </div>

          {/* Composer */}
          <div className="sticky bottom-4 mx-auto -mb-1 w-[94%] max-w-[1050px]">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-3 rounded-full border border-gray-300 bg-white px-5 py-3 shadow-sm"
            >
              <input
                placeholder="What’s in your mind?"
                className="w-full bg-transparent text-[15px] outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3B68F6] text-white hover:brightness-110"
              >
                <SendHorizonal className="h-5 w-5" />
              </button>
            </form>
          </div>
        </section>

        {/* RIGHT PANE */}
        {showRightPane && (
          <aside className="hidden w-[350px] shrink-0 rounded-2xl border border-gray-200 bg-[#f4f7fb] shadow-sm lg:block">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-[18px] font-semibold">Sources</h2>
            </div>

            {/* Tabs */}
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
                  <Code2 className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="h-[calc(100%-120px)] overflow-y-auto px-4 py-4 space-y-4">
              {rightTab === "Content"
                ? lessonSources.map((source) => (
                    <div key={source.id}>
                      <button
                        onClick={() =>
                          setExpandedSource(
                            expandedSource === source.id ? null : source.id
                          )
                        }
                        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium"
                      >
                        {source.title}
                        <span className="ml-2 rounded-full bg-[#3B68F6]/10 px-2 text-xs text-[#3B68F6]">
                          {source.count}
                        </span>
                        {source.items.length > 0 && (
                          <ChevronDown
                            className={`h-4 w-4 text-gray-500 transition-transform ${
                              expandedSource === source.id ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </button>
                      {expandedSource === source.id &&
                        source.items.map((item, i) => (
                          <div
                            key={i}
                            className="mt-2 rounded-lg border border-gray-200 bg-white px-3 py-3 shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              <PlayCircle className="h-5 w-5 text-[#3B68F6]" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                    {item.label}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {item.duration}
                                  </span>
                                </div>
                                <div className="mt-1 text-sm font-medium text-gray-900">
                                  {item.title}
                                </div>
                                <a
                                  href={item.link}
                                  className="mt-1 inline-block text-xs text-[#3B68F6] hover:underline"
                                >
                                  View Source
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))
                : downloadSources.map((source) => (
                    <div key={source.id}>
                      <button
                        onClick={() =>
                          setExpandedSource(
                            expandedSource === source.id ? null : source.id
                          )
                        }
                        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium"
                      >
                        {source.title}
                        <span className="ml-2 rounded-full bg-[#3B68F6]/10 px-2 text-xs text-[#3B68F6]">
                          {source.count}
                        </span>
                        {source.items.length > 0 && (
                          <ChevronDown
                            className={`h-4 w-4 text-gray-500 transition-transform ${
                              expandedSource === source.id ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </button>
                      {expandedSource === source.id &&
                        source.items.map((item, i) => (
                          <div
                            key={i}
                            className="mt-2 rounded-lg border border-gray-200 bg-white px-3 py-3 shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              <PanelsTopLeft className="h-4 w-4 text-gray-600" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.title}
                                  </div>
                                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
                                    {item.tag}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-gray-600">
                                  {item.description}
                                </p>
                                <button className="mt-2 flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 hover:bg-gray-50">
                                  <Copy className="h-3.5 w-3.5" />
                                  Download PDF
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
            </div>
          </aside>
        )}
      </div>

      {/* Profile modal */}
      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        setUser={setUser}
      />
    </div>
  );
};

export default ChatApp;
