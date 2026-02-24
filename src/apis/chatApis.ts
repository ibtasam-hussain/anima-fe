// Offline, in-memory/localStorage chat utilities.
// All previous HTTP/axios calls have been removed so the
// chat experience works without any backend.

// --------------------
// 🔹 Types
// --------------------
export type AiMeta = {
  source?: string | null;
  where_to_find?: string | null;
  timestamps?: string | null;
  tools?: string[];
  query?: string | null;
  success?: boolean;
  error?: string | null;
  ai_timestamp?: string | null;
  response_time?: string | null;
};

export type Chat = {
  id: number;
  userId: number;
  title: string;
  groupId?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: number | string;
  chatId: number;
  sender: "user" | "ai";
  content: string;
  createdAt: string;
  meta?: AiMeta | null;
};

export type Group = {
  id: number;
  name: string;
  description?: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
};

// --------------------
// 🔹 Local Storage Helpers
// --------------------
const CHATS_KEY = "offline_chats";
const MESSAGES_KEY = "offline_chat_messages";
const GROUPS_KEY = "offline_chat_groups";

function nowIso() {
  return new Date().toISOString();
}

function load<T>(key: string): T[] {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function save<T>(key: string, value: T[]) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function nextId(items: { id: number }[]): number {
  const max = items.reduce((m, i) => (i.id > m ? i.id : m), 0);
  return max + 1 || 1;
}

// --------------------
// 🔹 Chat APIs (offline)
// --------------------

// Create a new chat (optionally inside a group)
export async function createChat(
  title?: string,
  groupId?: number | null
): Promise<Chat> {
  const chats = load<Chat>(CHATS_KEY);
  const id = nextId(chats);
  const chat: Chat = {
    id,
    userId: 1,
    title: title?.trim() || "New Chat",
    groupId: groupId ?? null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  const updated = [...chats, chat];
  save(CHATS_KEY, updated);
  return chat;
}

// Add message (User → AI) – fully local echo-style AI
export async function addMessage(params: {
  chatId: number;
  sender: "user" | "ai";
  content: string;
}): Promise<{ user: Message; ai: Message }> {
  const messages = load<Message>(MESSAGES_KEY);
  const userMessage: Message = {
    id: `u-${Date.now()}`,
    chatId: params.chatId,
    sender: "user",
    content: params.content,
    createdAt: nowIso(),
    meta: null,
  };

  const aiMessage: Message = {
    id: `ai-${Date.now()}`,
    chatId: params.chatId,
    sender: "ai",
    content: `This is a local demo response.\n\nYou said:\n\n${params.content}`,
    createdAt: nowIso(),
    meta: {
      success: true,
      query: params.content,
      source: "Local demo",
      where_to_find: "Offline knowledge base",
      timestamps: null,
      tools: [],
      ai_timestamp: nowIso(),
      response_time: null,
    },
  };

  const updatedMessages = [...messages, userMessage, aiMessage];
  save(MESSAGES_KEY, updatedMessages);

  // Also bump chat "last updated" timestamp for sidebar ordering
  const chats = load<Chat>(CHATS_KEY);
  const updatedChats = chats.map((c) =>
    c.id === params.chatId ? { ...c, updatedAt: nowIso() } : c
  );
  save(CHATS_KEY, updatedChats);

  return { user: userMessage, ai: aiMessage };
}

// Get all chats of logged-in user
export async function getUserChats(): Promise<Chat[]> {
  return load<Chat>(CHATS_KEY);
}

// Get all messages of a chat
export async function getChatMessages(chatId: number): Promise<Message[]> {
  const messages = load<Message>(MESSAGES_KEY);
  return messages.filter((m) => m.chatId === chatId);
}

// Delete a chat and its messages
export async function deleteChat(chatId: number): Promise<void> {
  const chats = load<Chat>(CHATS_KEY).filter((c) => c.id !== chatId);
  const messages = load<Message>(MESSAGES_KEY).filter((m) => m.chatId !== chatId);
  save(CHATS_KEY, chats);
  save(MESSAGES_KEY, messages);
}

// --------------------
// 🔹 Group APIs (offline)
// --------------------

export async function createGroup(payload: { name: string }): Promise<{ group: Group }> {
  const groups = load<Group>(GROUPS_KEY);
  const id = nextId(groups);
  const group: Group = {
    id,
    name: payload.name.trim() || "New Group",
    description: null,
    createdBy: 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  const updated = [...groups, group];
  save(GROUPS_KEY, updated);
  return { group };
}

export async function getGroups(): Promise<{ groups: Group[] }> {
  return { groups: load<Group>(GROUPS_KEY) };
}

export async function getGroupById(groupId: number): Promise<Group> {
  const groups = load<Group>(GROUPS_KEY);
  const group = groups.find((g) => g.id === groupId);
  if (!group) {
    throw new Error("Group not found");
  }
  return group;
}

export async function getGroupChats(groupId: number): Promise<Chat[]> {
  const chats = load<Chat>(CHATS_KEY);
  return chats.filter((c) => c.groupId === groupId);
}

export async function deleteGroup(groupId: number): Promise<void> {
  const groups = load<Group>(GROUPS_KEY).filter((g) => g.id !== groupId);
  const chats = load<Chat>(CHATS_KEY).filter((c) => c.groupId !== groupId);
  const chatIds = new Set(chats.map((c) => c.id));
  const messages = load<Message>(MESSAGES_KEY).filter(
    (m) => !chatIds.has(m.chatId as number)
  );
  save(GROUPS_KEY, groups);
  save(CHATS_KEY, chats);
  save(MESSAGES_KEY, messages);
}

export async function renameGroup(
  groupId: number,
  name: string
): Promise<{ group: Group }> {
  const groups = load<Group>(GROUPS_KEY);
  const updatedGroups = groups.map((g) =>
    g.id === groupId ? { ...g, name, updatedAt: nowIso() } : g
  );
  save(GROUPS_KEY, updatedGroups);
  const group = updatedGroups.find((g) => g.id === groupId)!;
  return { group };
}

export async function renameChat(
  chatId: number,
  title: string
): Promise<{ chat: Chat }> {
  const chats = load<Chat>(CHATS_KEY);
  const updatedChats = chats.map((c) =>
    c.id === chatId ? { ...c, title, updatedAt: nowIso() } : c
  );
  save(CHATS_KEY, updatedChats);
  const chat = updatedChats.find((c) => c.id === chatId)!;
  return { chat };
}
