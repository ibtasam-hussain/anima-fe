import axios, {
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";

const BaseUrl = import.meta.env.VITE_BASE_URL as string;

// --------------------
// 🔐 Axios instance
// --------------------
const api = axios.create({
  baseURL: BaseUrl, // example: http://localhost:3000/api/
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    (config.headers ??= new AxiosHeaders()).set(
      "Authorization",
      `Bearer ${token}`
    );
  }
  return config;
});

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
// 🔹 API Endpoints
// --------------------
const ENDPOINTS = {
  // ---- Chats ----
  createChat: "chats", // POST /api/chats
  userChats: "chats", // GET /api/chats
  chatMessages: (id: number | string) => `chats/${id}/messages`, // GET /api/chats/:id/messages
  addMessage: (id: number | string) => `chats/${id}/messages`, // POST /api/chats/:id/messages
  deleteChat: (id: number | string) => `chats/${id}`, // DELETE /api/chats/:id

  // ---- Groups ----
  createGroup: "groups", // POST /api/groups
  getGroups: "groups", // GET /api/groups
  getGroupById: (id: number | string) => `groups/${id}`, // GET /api/groups/:id
  getGroupChats: (id: number | string) => `groups/${id}/chats`, // GET /api/groups/:id/chats
  deleteGroup: (id: number | string) => `groups/${id}`, // DELETE /api/groups/:id
};

// --------------------
// 🔹 Chat APIs
// --------------------

// ✅ Create a new chat (optionally inside a group)
export async function createChat(
  title?: string,
  groupId?: number | null
): Promise<Chat> {
  const { data } = await api.post(ENDPOINTS.createChat, { title, groupId });
  return data.chat as Chat;
}

// ✅ Add message (User → AI)
export async function addMessage(params: {
  chatId: number;
  sender: "user" | "ai";
  content: string;
}): Promise<{ user: Message; ai: Message }> {
  const { data } = await api.post(ENDPOINTS.addMessage(params.chatId), params);
  return { user: data.user as Message, ai: data.ai as Message };
}

// ✅ Get all chats of logged-in user
export async function getUserChats(): Promise<Chat[]> {
  const { data } = await api.get(ENDPOINTS.userChats);
  return data.chats as Chat[];
}

// ✅ Get all messages of a chat
export async function getChatMessages(chatId: number): Promise<Message[]> {
  const { data } = await api.get(ENDPOINTS.chatMessages(chatId));
  return data.messages as Message[];
}

// ✅ Delete a chat
export async function deleteChat(chatId: number): Promise<void> {
  await api.delete(ENDPOINTS.deleteChat(chatId));
}

// --------------------
// 🔹 Group APIs
// --------------------

// ✅ Create a group
export async function createGroup(payload: { name: string }): Promise<{ group: Group }> {
  const { data } = await api.post(ENDPOINTS.createGroup, payload);
  return data;
}

// ✅ Get all groups (with chats)
export async function getGroups(): Promise<{ groups: Group[] }> {
  const { data } = await api.get(ENDPOINTS.getGroups);
  return data;
}

// ✅ Get single group (with its chats & messages)
export async function getGroupById(groupId: number): Promise<Group> {
  const { data } = await api.get(ENDPOINTS.getGroupById(groupId));
  return data.group as Group;
}

// ✅ Get all chats in a group
export async function getGroupChats(groupId: number): Promise<Chat[]> {
  const { data } = await api.get(ENDPOINTS.getGroupChats(groupId));
  return data.chats as Chat[];
}

// ✅ Delete a group
export async function deleteGroup(groupId: number): Promise<void> {
  await api.delete(ENDPOINTS.deleteGroup(groupId));
}

// ✅ Rename Group
export async function renameGroup(groupId: number, name: string): Promise<{ group: Group }> {
  const { data } = await api.post("groups/rename", { groupId, name });
  return data;
}

// ✅ Rename Chat
export async function renameChat(chatId: number, title: string): Promise<{ chat: Chat }> {
  const { data } = await api.post("chatsrename", { chatId, title });
  return data;
}
