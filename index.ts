import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

interface Preference {
  command: string;
  instruction: string;
}

interface PreferenceEntry {
  command: string;
  instruction?: string;
  enabled?: boolean;
}

interface PreferenceConfig {
  includeDefaults?: boolean;
  tools: PreferenceEntry[];
}

const SETTINGS_KEY = "preferredShellTools";
const GLOBAL_SETTINGS_PATH = join(homedir(), ".pi", "agent", "settings.json");
const DEFAULT_PREFERENCES: readonly Preference[] = [
  { command: "rg", instruction: "Use `rg` instead of `grep` for text search." },
  { command: "eza", instruction: "Use `eza` instead of `ls` for directory listings." },
  { command: "fd", instruction: "Use `fd` instead of `find` for file discovery." },
];

function parseEntries(value: unknown): PreferenceEntry[] {
  if (!Array.isArray(value)) return [];

  const entries: PreferenceEntry[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const { command, instruction, enabled } = entry as Record<string, unknown>;
    if (typeof command !== "string" || !command.trim()) continue;
    if (enabled === false) {
      entries.push({ command: command.trim(), enabled: false });
    } else if (typeof instruction === "string" && instruction.trim()) {
      entries.push({ command: command.trim(), instruction: instruction.trim(), enabled: true });
    }
  }
  return entries;
}

function readConfig(path: string): PreferenceConfig {
  try {
    const settings = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
    const value = settings[SETTINGS_KEY];

    if (Array.isArray(value)) return { tools: parseEntries(value) };
    if (!value || typeof value !== "object") return { tools: [] };

    const object = value as Record<string, unknown>;
    return {
      includeDefaults:
        typeof object.includeDefaults === "boolean" ? object.includeDefaults : undefined,
      tools: parseEntries(object.tools),
    };
  } catch {
    return { tools: [] };
  }
}

function resolvePreferences(cwd: string): Preference[] {
  const globalConfig = readConfig(GLOBAL_SETTINGS_PATH);
  const projectConfig = readConfig(join(cwd, ".pi", "settings.json"));
  const includeDefaults = projectConfig.includeDefaults ?? globalConfig.includeDefaults ?? true;
  const merged = new Map<string, Preference>();

  if (includeDefaults) {
    for (const preference of DEFAULT_PREFERENCES) merged.set(preference.command, preference);
  }

  for (const entry of [...globalConfig.tools, ...projectConfig.tools]) {
    if (entry.enabled === false) {
      merged.delete(entry.command);
    } else if (entry.instruction) {
      merged.set(entry.command, { command: entry.command, instruction: entry.instruction });
    }
  }

  return [...merged.values()];
}

async function isAvailable(pi: ExtensionAPI, command: string): Promise<boolean> {
  try {
    const checker = process.platform === "win32" ? "where.exe" : "sh";
    const args =
      process.platform === "win32"
        ? [command]
        : ["-lc", 'command -v "$1" >/dev/null 2>&1', "pi-preferred-shell-tools", command];
    const result = await pi.exec(checker, args, { timeout: 2_000 });
    return result.code === 0;
  } catch {
    return false;
  }
}

function addPreferencesToPrompt(systemPrompt: string, preferences: Preference[]): string {
  const instructions = preferences.map(({ instruction }) => instruction).join(" ");
  const bashLine = /^(\s*-\s*bash:\s*).*$/m;

  if (bashLine.test(systemPrompt)) {
    return systemPrompt.replace(
      bashLine,
      (line) => `${line} Preferences from pi-preferred-shell-tools: ${instructions}`,
    );
  }

  return `${systemPrompt}\n\n<shell_preferences source="pi-preferred-shell-tools">\n${preferences
    .map(({ instruction }) => `- ${instruction}`)
    .join("\n")}\n</shell_preferences>`;
}

export default function (pi: ExtensionAPI) {
  let preferences: Preference[] = [...DEFAULT_PREFERENCES];
  let availablePreferences: Preference[] | undefined;

  pi.on("session_start", (_event, ctx) => {
    preferences = resolvePreferences(ctx.cwd);
    availablePreferences = undefined;
  });

  pi.on("before_agent_start", async (event) => {
    availablePreferences ??= (await Promise.all(
      preferences.map(async (preference) => ({
        ...preference,
        available: await isAvailable(pi, preference.command),
      })),
    ))
      .filter((preference) => preference.available)
      .map(({ command, instruction }) => ({ command, instruction }));

    if (availablePreferences.length === 0) return;

    return {
      systemPrompt: addPreferencesToPrompt(event.systemPrompt, availablePreferences),
    };
  });
}
