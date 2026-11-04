import type { AppSettings, HistoryEntry, Project } from "@/lib/storage/types";
import { DEFAULT_SETTINGS } from "@/lib/storage/types";

// ---------------------------------------------------------------------------
// Key scheme
// ---------------------------------------------------------------------------
//
// All keys are namespaced by Clerk user ID:
//   arqin_{userId}_projects
//   arqin_{userId}_history
//   arqin_{userId}_settings
//   arqin_{userId}_active_project
//   arqin_{userId}_migrated
//
// Legacy (pre-isolation) keys that may exist in older browsers:
//   archigen_projects | archigen_history | archigen_settings | archigen_active_project
//
// ---------------------------------------------------------------------------

const LEGACY_PROJECTS_KEY = "archigen_projects";
const LEGACY_HISTORY_KEY = "archigen_history";
const LEGACY_SETTINGS_KEY = "archigen_settings";
const LEGACY_ACTIVE_PROJECT_KEY = "archigen_active_project";

function userKey(userId: string, dataType: string): string {
  return `arqin_${userId}_${dataType}`;
}

// ---------------------------------------------------------------------------
// Low-level read/write helpers
// ---------------------------------------------------------------------------

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function remove(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Legacy migration
//
// Called once per user on first sign-in.  If unscoped legacy keys exist AND
// no namespaced data exists for this user yet, we copy the legacy data into
// the user's namespace and then delete the originals.  We never run this
// migration for a user that already has their own scoped data, and we never
// silently assign legacy data to a second account.
// ---------------------------------------------------------------------------

export function migrateToUser(userId: string): void {
  if (typeof window === "undefined") return;

  const migratedKey = userKey(userId, "migrated");
  if (localStorage.getItem(migratedKey) === "true") return;

  // Only migrate if this user has NO existing scoped projects yet.
  const existingProjects = localStorage.getItem(userKey(userId, "projects"));
  if (existingProjects !== null) {
    // User already has their own data — mark migrated and stop.
    localStorage.setItem(migratedKey, "true");
    return;
  }

  // Check whether legacy keys exist at all.
  const legacyProjects = localStorage.getItem(LEGACY_PROJECTS_KEY);
  const legacyHistory = localStorage.getItem(LEGACY_HISTORY_KEY);
  const legacySettings = localStorage.getItem(LEGACY_SETTINGS_KEY);
  const legacyActive = localStorage.getItem(LEGACY_ACTIVE_PROJECT_KEY);

  const hasLegacyData =
    legacyProjects !== null ||
    legacyHistory !== null ||
    legacySettings !== null ||
    legacyActive !== null;

  if (hasLegacyData) {
    // Copy legacy data into user namespace.
    if (legacyProjects !== null)
      localStorage.setItem(userKey(userId, "projects"), legacyProjects);
    if (legacyHistory !== null)
      localStorage.setItem(userKey(userId, "history"), legacyHistory);
    if (legacySettings !== null)
      localStorage.setItem(userKey(userId, "settings"), legacySettings);
    if (legacyActive !== null)
      localStorage.setItem(userKey(userId, "active_project"), legacyActive);

    // Remove the unscoped originals so they are not picked up by future accounts.
    remove(LEGACY_PROJECTS_KEY);
    remove(LEGACY_HISTORY_KEY);
    remove(LEGACY_SETTINGS_KEY);
    remove(LEGACY_ACTIVE_PROJECT_KEY);
  }

  localStorage.setItem(migratedKey, "true");
}

// ---------------------------------------------------------------------------
// Store factory — returns a fully-typed store bound to a specific userId.
// All reads and writes are scoped to arqin_{userId}_* keys.
// ---------------------------------------------------------------------------

export interface UserStore {
  getProjects: () => Project[];
  getProject: (id: string) => Project | undefined;
  saveProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project | undefined;
  getActiveProjectId: () => string | null;
  setActiveProjectId: (id: string) => void;
  getHistory: () => HistoryEntry[];
  addHistoryEntry: (entry: HistoryEntry) => void;
  getHistoryEntry: (id: string) => HistoryEntry | undefined;
  getSettings: () => AppSettings;
  saveSettings: (settings: AppSettings) => void;
  createProject: (
    partial: Pick<Project, "title" | "prompt" | "diagramType"> &
      Partial<Pick<Project, "description" | "result">>,
  ) => Project;
}

export function createUserStore(userId: string): UserStore {
  const k = (dataType: string) => userKey(userId, dataType);

  function getProjects(): Project[] {
    return read<Project[]>(k("projects"), []);
  }

  function getProject(id: string): Project | undefined {
    return getProjects().find((p) => p.id === id);
  }

  function saveProject(project: Project): void {
    const projects = getProjects();
    const index = projects.findIndex((p) => p.id === project.id);
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.unshift(project);
    }
    write(k("projects"), projects);
  }

  function deleteProject(id: string): void {
    write(
      k("projects"),
      getProjects().filter((p) => p.id !== id),
    );
    write(
      k("history"),
      getHistory().filter((h) => h.projectId !== id),
    );
    if (getActiveProjectId() === id) {
      remove(k("active_project"));
    }
  }

  function duplicateProject(id: string): Project | undefined {
    const source = getProject(id);
    if (!source) return undefined;
    const copy: Project = {
      ...source,
      id: generateId(),
      title: `${source.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProject(copy);
    return copy;
  }

  function getActiveProjectId(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(k("active_project"));
  }

  function setActiveProjectId(id: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(k("active_project"), id);
  }

  function getHistory(): HistoryEntry[] {
    return read<HistoryEntry[]>(k("history"), []);
  }

  function addHistoryEntry(entry: HistoryEntry): void {
    const history = getHistory();
    history.unshift(entry);
    write(k("history"), history.slice(0, 100));
  }

  function getHistoryEntry(id: string): HistoryEntry | undefined {
    return getHistory().find((h) => h.id === id);
  }

  function getSettings(): AppSettings {
    return read<AppSettings>(k("settings"), DEFAULT_SETTINGS);
  }

  function saveSettings(settings: AppSettings): void {
    write(k("settings"), settings);
  }

  function createProject(
    partial: Pick<Project, "title" | "prompt" | "diagramType"> &
      Partial<Pick<Project, "description" | "result">>,
  ): Project {
    const now = new Date().toISOString();
    const project: Project = {
      id: generateId(),
      description: "",
      ...partial,
      createdAt: now,
      updatedAt: now,
    };
    saveProject(project);
    setActiveProjectId(project.id);
    return project;
  }

  return {
    getProjects,
    getProject,
    saveProject,
    deleteProject,
    duplicateProject,
    getActiveProjectId,
    setActiveProjectId,
    getHistory,
    addHistoryEntry,
    getHistoryEntry,
    getSettings,
    saveSettings,
    createProject,
  };
}
