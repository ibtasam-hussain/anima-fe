// src/api/chatApi.ts
import axios, { AxiosHeaders, AxiosRequestHeaders, InternalAxiosRequestConfig } from "axios";


const BaseUrl = import.meta.env.VITE_BASE_URL as string; // e.g. "https://api.example.com/"

// --- Axios instance with auth header ---
const api = axios.create({
  baseURL: BaseUrl, // endpoints me leading slash mat do
});


api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    // Option A: use AxiosHeaders (best for v1)
    (config.headers ??= new AxiosHeaders()).set("Authorization", `Bearer ${token}`);

    // Option B: mutate as plain headers (also fine)
    // (config.headers ??= {} as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
  }
  return config;
});



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

// NOTE: Agar tumhare route names different hain to yahan adjust karo
const ENDPOINTS = {
  createChat: "chats/create", // POST
  addMessage: "chats/message", // POST
  userChats: "chats/recent", // GET
  deleteChat: (id: number | string) => `chats/${id}`, // DELETE
  chatMessages: (id: number | string) => `chats/${id}/messages`, // GET
};



export async function createChat(title?: string): Promise<Chat> {
  const { data } = await api.post(ENDPOINTS.createChat, { title });
  return data.chat as Chat;
}

export async function addMessage(params: {
  chatId: number;
  sender: "user" | "ai";
  content: string;
}): Promise<{ user: Message; ai: Message }> {
  const { data } = await api.post(ENDPOINTS.addMessage, params);
  return { user: data.user as Message, ai: data.ai as Message };
}

export async function getUserChats(): Promise<Chat[]> {
  const { data } = await api.get(ENDPOINTS.userChats);
  return data.chats as Chat[];
}

export async function getChatMessages(chatId: number): Promise<Message[]> {
  const { data } = await api.get(ENDPOINTS.chatMessages(chatId));
  return data.messages as Message[];
}


export async function deleteChat(chatId: number): Promise<void> {
  await api.delete(ENDPOINTS.deleteChat(chatId));
  return;
}