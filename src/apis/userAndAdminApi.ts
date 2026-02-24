// Offline, local-only admin & user utilities.
// All previous HTTP/axios calls have been removed so the
// admin panel works without any backend.

type StoredUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password?: string;
  profile?: string;
};

type StoredQuery = {
  id: number;
  message: string;
  status: string;
};

const USERS_KEY = "offline_admin_users";
const QUERIES_KEY = "offline_unanswered_queries";

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

function seedUsersIfEmpty() {
  const users = load<StoredUser>(USERS_KEY);
  if (users.length > 0) return;

  const seeded: StoredUser[] = [
    {
      id: 1,
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      role: "admin",
      password: "password",
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      role: "user",
      password: "password",
    },
  ];

  save(USERS_KEY, seeded);
}

function seedQueriesIfEmpty() {
  const queries = load<StoredQuery>(QUERIES_KEY);
  if (queries.length > 0) return;

  const seeded: StoredQuery[] = [
    {
      id: 1,
      message: "Module 1 / Lesson 1 – Clarify introduction section",
      status: "unanswered",
    },
    {
      id: 2,
      message: "Tools / Slides / Slide_3.pdf – Question about slide 9",
      status: "unanswered",
    },
  ];

  save(QUERIES_KEY, seeded);
}

// --------------------
// 🔹 Auth / Admin
// --------------------

// Local-only admin login
export const adminLogin = async (data: { email: string; password: string }) => {
  seedUsersIfEmpty();
  const users = load<StoredUser>(USERS_KEY);

  let user =
    users.find(
      (u) =>
        u.email.toLowerCase() === data.email.toLowerCase() &&
        u.role !== "user"
    ) ?? null;

  if (!user) {
    // If no admin exists for this email yet, create one on-the-fly.
    const id = nextId(users);
    user = {
      id,
      firstName: "Admin",
      lastName: "User",
      email: data.email,
      role: "admin",
      password: data.password,
    };
    save(USERS_KEY, [...users, user]);
  }

  // In offline mode we don't enforce password rules strictly.
  return {
    token: "offline-admin-token",
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profile: user.profile ?? null,
    },
  };
};

// --------------------
// 🔹 Users & Admins (CRUD)
// --------------------

export const createUser = async (data: any) => {
  seedUsersIfEmpty();
  const users = load<StoredUser>(USERS_KEY);
  const id = nextId(users);
  const user: StoredUser = {
    id,
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    email: data.email || "",
    role: data.role || "user",
    password: data.password,
  };
  const updated = [...users, user];
  save(USERS_KEY, updated);
  return { user };
};

export const editUser = async (id: number, data: any) => {
  seedUsersIfEmpty();
  const users = load<StoredUser>(USERS_KEY);
  const updated = users.map((u) =>
    u.id === id
      ? {
          ...u,
          firstName: data.firstName ?? u.firstName,
          lastName: data.lastName ?? u.lastName,
          email: data.email ?? u.email,
          role: data.role ?? u.role,
          password: data.password ?? u.password,
        }
      : u
  );
  save(USERS_KEY, updated);
  const user = updated.find((u) => u.id === id)!;
  return { user };
};

export const deleteUser = async (id: number) => {
  seedUsersIfEmpty();
  const users = load<StoredUser>(USERS_KEY).filter((u) => u.id !== id);
  save(USERS_KEY, users);
  return { success: true };
};

export const getAllUsers = async (page = 1, limit = 10) => {
  seedUsersIfEmpty();
  const users = load<StoredUser>(USERS_KEY).filter((u) => u.role === "user");
  // keep API shape simple; ignore pagination in offline mode
  return { users, page, limit, total: users.length };
};

export const getAllAdmins = async (page = 1, limit = 10) => {
  seedUsersIfEmpty();
  const users = load<StoredUser>(USERS_KEY).filter((u) => u.role !== "user");
  return { users, page, limit, total: users.length };
};

// --------------------
// 🔹 Profile
// --------------------

export const getProfile = async () => {
  seedUsersIfEmpty();

  // Prefer whatever is currently stored as "adminUser"
  const storedAdmin =
    typeof window !== "undefined"
      ? window.localStorage.getItem("adminUser")
      : null;
  if (storedAdmin) {
    const parsed = JSON.parse(storedAdmin);
    return { user: parsed };
  }

  const users = load<StoredUser>(USERS_KEY);
  const admin =
    users.find((u) => u.role !== "user") ??
    users[0] ?? {
      id: 1,
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      role: "admin",
    };

  return {
    user: {
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      profile: admin.profile ?? null,
    },
  };
};

// Update profile locally (with optional image metadata)
export const setupProfile = async (data: FormData) => {
  seedUsersIfEmpty();
  const users = load<StoredUser>(USERS_KEY);

  const storedAdmin =
    typeof window !== "undefined"
      ? window.localStorage.getItem("adminUser")
      : null;

  let email =
    storedAdmin && JSON.parse(storedAdmin).email
      ? JSON.parse(storedAdmin).email
      : "admin@example.com";

  const existing =
    users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ??
    users.find((u) => u.role !== "user") ??
    users[0];

  if (!existing) {
    return { message: "Profile updated", user: null };
  }

  const firstName = (data.get("firstName") as string) || existing.firstName;
  const lastName = (data.get("lastName") as string) || existing.lastName;

  // We can't persist actual file bytes here; just store the file name if present.
  const file = data.get("profilePic") as File | null;
  const profile = file ? file.name : existing.profile;

  const updatedUser: StoredUser = {
    ...existing,
    firstName,
    lastName,
    profile,
  };

  const updatedUsers = users.map((u) => (u.id === existing.id ? updatedUser : u));
  save(USERS_KEY, updatedUsers);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      "adminUser",
      JSON.stringify({
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        profile: updatedUser.profile ?? null,
      })
    );
  }

  return {
    message: "Profile updated locally",
    user: updatedUser,
  };
};

// Change password locally
export const changePassword = async (newPassword: string) => {
  seedUsersIfEmpty();
  const users = load<StoredUser>(USERS_KEY);

  const storedAdmin =
    typeof window !== "undefined"
      ? window.localStorage.getItem("adminUser")
      : null;
  const email =
    storedAdmin && JSON.parse(storedAdmin).email
      ? JSON.parse(storedAdmin).email
      : "admin@example.com";

  const updatedUsers = users.map((u) =>
    u.email.toLowerCase() === email.toLowerCase() && u.role !== "user"
      ? { ...u, password: newPassword }
      : u
  );

  save(USERS_KEY, updatedUsers);

  return { message: "Password updated locally" };
};

// --------------------
// 🔹 Unanswered Queries (offline)
// --------------------

export const getAllUnansweredQueries = async (page = 1, limit = 10) => {
  seedQueriesIfEmpty();
  const queries = load<StoredQuery>(QUERIES_KEY).filter(
    (q) => q.status === "unanswered"
  );
  return { queries, page, limit, total: queries.length };
};

// Mark a query as closed locally
export const markAsClosed = async (id: number) => {
  seedQueriesIfEmpty();
  const queries = load<StoredQuery>(QUERIES_KEY).map((q) =>
    q.id === id ? { ...q, status: "closed" } : q
  );
  save(QUERIES_KEY, queries);
  return { success: true };
};