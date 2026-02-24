import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Clock, SendHorizonal, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import TypingIndicator from "@/components/typingIndicator";
import AssistantMessage from "@/components/AssistantMessage";
import ModeSelectModal from "@/components/ModeSelectModal";
import PrebuiltPromptBar, {
  type PrebuiltPrompt,
} from "@/components/PrebuiltPromptBar";
import UploadDropzone, {
  type UploadFileState,
} from "@/components/UploadDropzone";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  addMessage as apiAddMessage,
  getChatMessages as apiGetChatMessages,
  getUserChats as apiGetUserChats,
  createChat as apiCreateChat,
  renameChat as apiRenameChat,
  deleteChat as apiDeleteChat,
  type Chat,
  type Message as ApiMessage,
} from "@/apis/chatApis";

type ChatMode = "marketing" | "teaching";

type ChatMessage = {
  id: string;
  role: "user" | "ai";
  content: string;
  meta?: any | null;
};

const uid = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

const CHAT_MODES_KEY = "anima_chat_modes";

const PREBUILT_PROMPTS: PrebuiltPrompt[] = [
  {
    id: "m1",
    mode: "marketing",
    label: "Launch email",
    text:
      "Draft a launch announcement email for our next cohort.\n" +
      "Make it clear, punchy, and aligned with our brand voice.",
  },
  {
    id: "m2",
    mode: "marketing",
    label: "Sales page outline",
    text:
      "Give me a sales page outline for this offer.\n" +
      "Highlight promise, proof, and next steps.",
  },
  {
    id: "t1",
    mode: "teaching",
    label: "Lesson plan",
    text:
      "Help me design a 60‑minute live session.\n" +
      "Include check‑ins, exercises, and debrief.",
  },
  {
    id: "t2",
    mode: "teaching",
    label: "Reflective prompt",
    text:
      "Suggest 3 reflective questions for learners.\n" +
      "Keep them concrete and actionable.",
  },
];

function loadChatModes(): Record<number, ChatMode> {
  try {
    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem(CHAT_MODES_KEY)
        : null;
    if (!raw) return {};
    return JSON.parse(raw) as Record<number, ChatMode>;
  } catch {
    return {};
  }
}

function saveChatModes(modes: Record<number, ChatMode>) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CHAT_MODES_KEY, JSON.stringify(modes));
  } catch {
    // ignore
  }
}

const ChatHome: React.FC = () => {
  const navigate = useNavigate();

  const [chatList, setChatList] = useState<Chat[]>([]);
  const [chatModes, setChatModes] = useState<Record<number, ChatMode>>(
    () => loadChatModes()
  );
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showModeModal, setShowModeModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFileState[]>([]);
  const [sidebarTab, setSidebarTab] = useState<"marketing" | "teaching">("marketing");
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const currentMode: ChatMode | null = useMemo(() => {
    if (!currentChatId) return null;
    const mode = chatModes[currentChatId];
    return mode ?? "teaching";
  }, [chatModes, currentChatId]);

  const marketingChats = useMemo(
    () =>
      chatList
        .filter((c) => chatModes[c.id] === "marketing")
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    [chatList, chatModes]
  );

  const teachingChats = useMemo(
    () =>
      chatList
        .filter((c) => (chatModes[c.id] || "teaching") === "teaching")
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    [chatList, chatModes]
  );

  useEffect(() => {
    (async () => {
      try {
        const chats = await apiGetUserChats();
        setChatList(chats);

        if (chats.length > 0) {
          const first = chats[0];
          setCurrentChatId(first.id);
          const list = await apiGetChatMessages(first.id);
          setMessages(
            list.map((m: ApiMessage) => ({
              id: String(m.id),
              role: m.sender,
              content: m.content,
              meta: m.meta ?? null,
            }))
          );
        }
      } catch (err) {
        console.error(err);
        toast.error("Unable to load your chats (offline demo).");
      }
    })();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    saveChatModes(chatModes);
  }, [chatModes]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const openChat = async (chatId: number) => {
    try {
      setCurrentChatId(chatId);
      setErrorMessage(null);
      const list = await apiGetChatMessages(chatId);
      setMessages(
        list.map((m: ApiMessage) => ({
          id: String(m.id),
          role: m.sender,
          content: m.content,
          meta: m.meta ?? null,
        }))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to load messages.");
    }
  };

  const handleNewChatClick = () => {
    setShowModeModal(true);
  };

  const handleModeSelected = async (mode: ChatMode) => {
    setShowModeModal(false);
    try {
      const title =
        mode === "marketing" ? "New Marketing Chat" : "New Teaching Chat";
      const chat = await apiCreateChat(title);
      setChatList((prev) => [chat, ...prev]);
      setChatModes((prev) => ({ ...prev, [chat.id]: mode }));
      setCurrentChatId(chat.id);
      setMessages([]);
      setInput("");
      setUploadFiles([]);
    } catch (err) {
      console.error(err);
      toast.error("Could not start a new chat.");
    }
  };

  const handleInsertPrompt = (text: string) => {
    setInput((prev) => (prev ? `${prev}\n\n${text}` : text));
  };

  const handleSend = async () => {
    const payload = input.trim();
    if (!payload) return;

    if (loadingSend) {
      setErrorMessage(
        "Please wait for Anima’s response before sending another message."
      );
      return;
    }

    if (!currentChatId) {
      setErrorMessage("Start a new chat to send a message.");
      return;
    }

    setLoadingSend(true);
    setErrorMessage(null);

    const localUserMessage: ChatMessage = {
      id: uid(),
      role: "user",
      content: payload,
    };

    setMessages((prev) => [...prev, localUserMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const { ai } = await apiAddMessage({
        chatId: currentChatId,
        sender: "user",
        content: payload,
      });

      const aiMessage: ChatMessage = {
        id: String(ai.id),
        role: "ai",
        content: ai.content,
        meta: ai.meta ?? null,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
      setUploadFiles([]); // clear mock uploads on send

      // Refresh chats so last activity time is up to date
      const chats = await apiGetUserChats();
      setChatList(chats);
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setErrorMessage("We couldn’t send that message. Please try again.");
      toast.error("Failed to send message.");
    } finally {
      setLoadingSend(false);
    }
  };

  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    handleSend();
  };

  const showEmptyState = !currentChatId;

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const startRename = (chat: Chat) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const saveRename = async () => {
    if (editingChatId == null) return;
    const title = editingTitle.trim() || "Untitled";
    try {
      const { chat } = await apiRenameChat(editingChatId, title);
      setChatList((prev) =>
        prev.map((c) => (c.id === chat.id ? chat : c))
      );
      setEditingChatId(null);
      setEditingTitle("");
      toast.success("Chat renamed.");
    } catch (err) {
      console.error(err);
      toast.error("Could not rename chat.");
    }
  };

  const cancelRename = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  const handleDeleteChat = async (chatId: number) => {
    if (!window.confirm("Delete this chat? This cannot be undone.")) return;
    try {
      await apiDeleteChat(chatId);
      setChatList((prev) => prev.filter((c) => c.id !== chatId));
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
      }
      setEditingChatId((id) => (id === chatId ? null : id));
      toast.success("Chat deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Could not delete chat.");
    }
  };

  const renderChatRow = (chat: Chat, active: boolean) => {
    const isEditing = editingChatId === chat.id;
    if (isEditing) {
      return (
        <div
          key={chat.id}
          className="rounded-lg border border-[#3B68F6] bg-[#EEF2FF] px-2 py-2 flex flex-col gap-2"
        >
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveRename();
              if (e.key === "Escape") cancelRename();
            }}
            className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#3B68F6]"
            autoFocus
            aria-label="Rename chat"
          />
          <div className="flex gap-1 justify-end">
            <button
              type="button"
              onClick={cancelRename}
              className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveRename}
              className="rounded px-2 py-1 text-xs font-medium text-white bg-[#3B68F6] hover:brightness-110"
            >
              Save
            </button>
          </div>
        </div>
      );
    }
    return (
      <div
        key={chat.id}
        className={[
          "group flex items-center gap-1 rounded-lg px-2 py-1.5",
          active ? "bg-[#EEF2FF]" : "hover:bg-gray-50",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={() => openChat(chat.id)}
          className={[
            "flex-1 min-w-0 flex items-center justify-between gap-2 text-left text-sm py-1",
            active ? "text-[#3B68F6]" : "text-gray-800",
          ].join(" ")}
        >
          <span className="truncate">{chat.title}</span>
          <span className="flex items-center gap-1 text-[11px] text-gray-500 shrink-0">
            <Clock className="h-3 w-3" />
            {formatTime(chat.updatedAt)}
          </span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#3B68F6]"
              aria-label="Chat options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                startRename(chat);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                handleDeleteChat(chat.id);
              }}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#e9f1f8] text-gray-900 antialiased">
      <div className="mx-auto flex h-screen max-w-7xl gap-4 px-3 py-4 md:py-6">
        {/* Sidebar */}
        <aside className="w-[260px] shrink-0 rounded-2xl bg-white shadow-sm border border-gray-100 flex flex-col">
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-gray-900">
                Your Chats
              </h2>
            </div>
            <button
              type="button"
              onClick={handleNewChatClick}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#3B68F6] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              Start New Chat
            </button>
          </div>

          {/* Tabs: Marketing | Teaching */}
          <div className="flex border-b border-gray-100 px-2">
            <button
              type="button"
              onClick={() => setSidebarTab("marketing")}
              className={[
                "flex-1 py-2.5 text-sm font-medium transition-colors",
                sidebarTab === "marketing"
                  ? "text-[#3B68F6] border-b-2 border-[#3B68F6]"
                  : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent",
              ].join(" ")}
            >
              Marketing
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab("teaching")}
              className={[
                "flex-1 py-2.5 text-sm font-medium transition-colors",
                sidebarTab === "teaching"
                  ? "text-[#3B68F6] border-b-2 border-[#3B68F6]"
                  : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent",
              ].join(" ")}
            >
              Teaching
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            {sidebarTab === "marketing" ? (
              <div>
                <div className="mb-1 flex items-center justify-between px-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Marketing Chats
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {marketingChats.length}
                  </span>
                </div>
                {marketingChats.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 px-3 py-2 text-[11px] text-gray-500">
                    No marketing chats yet.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {marketingChats.map((chat) =>
                      renderChatRow(chat, chat.id === currentChatId)
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="mb-1 flex items-center justify-between px-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Teaching Chats
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {teachingChats.length}
                  </span>
                </div>
                {teachingChats.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 px-3 py-2 text-[11px] text-gray-500">
                    No teaching chats yet.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {teachingChats.map((chat) =>
                      renderChatRow(chat, chat.id === currentChatId)
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 px-4 py-3">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-100"
            >
              Log out
            </button>
          </div>
        </aside>

        {/* Main chat panel */}
        <section className="flex flex-1 flex-col rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <h1 className="text-[16px] md:text-[18px] font-semibold text-gray-900">
                {currentChatId
                  ? chatList.find((c) => c.id === currentChatId)?.title ||
                    "Conversation"
                  : "Anima Weaver"}
              </h1>
              {currentMode && (
                <p className="text-[11px] text-gray-500">
                  Mode:{" "}
                  <span className="capitalize font-medium">
                    {currentMode}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Messages / Empty state */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {showEmptyState ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    No chat selected
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Start a new Marketing or Teaching conversation with Anima.
                  </p>
                  <button
                    type="button"
                    onClick={handleNewChatClick}
                    className="inline-flex items-center gap-2 rounded-full bg-[#3B68F6] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
                  >
                    <Plus className="h-4 w-4" />
                    Start New Chat
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m) =>
                  m.role === "user" ? (
                    <div
                      key={m.id}
                      className="flex justify-end items-end gap-2"
                    >
                      <div className="flex w-fit max-w-[85%] rounded-md bg-[#3B68F6] px-4 py-3 text-sm text-white shadow">
                        <span className="whitespace-pre-wrap break-words">
                          {m.content}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <AssistantMessage
                      key={m.id}
                      text={m.content}
                      meta={m.meta}
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

          {/* Composer */}
          <div className="border-t border-gray-100 bg-[#f3f6fb] px-4 py-3">
            {/* Prebuilt prompts */}
            <PrebuiltPromptBar
              mode={currentMode}
              prompts={PREBUILT_PROMPTS}
              onInsert={handleInsertPrompt}
            />

            {/* Upload + input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm"
            >
              <UploadDropzone
                files={uploadFiles}
                onFilesChange={setUploadFiles}
              />
              <div className="flex-1 flex flex-col gap-1">
                <div className="relative">
                  {!input && (
                    <div className="pointer-events-none absolute inset-0 flex items-center px-1 text-sm text-gray-400">
                      Ask Anima a question or paste content to work with…
                    </div>
                  )}
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={1}
                    className="w-full resize-none border-0 bg-transparent text-sm outline-none focus:ring-0 placeholder-transparent pt-1"
                    placeholder="Ask Anima a question or paste content to work with…"
                  />
                </div>
                {errorMessage && (
                  <p className="text-[11px] text-red-500">{errorMessage}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loadingSend || !currentChatId}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3B68F6] text-white hover:brightness-110 disabled:opacity-60"
                aria-label="Send message"
              >
                <SendHorizonal className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      </div>

      <ModeSelectModal
        open={showModeModal}
        onClose={() => setShowModeModal(false)}
        onSelectMode={handleModeSelected}
      />
    </div>
  );
};

export default ChatHome;

