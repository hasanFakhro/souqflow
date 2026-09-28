import { appendFileSync } from "fs";
import { join } from "path";

// TEMP PERF TRACE — writes to console and to a local file so timings can be inspected without terminal access.
const logPath = join(process.cwd(), ".perf-trace.log");

export function trace(label: string, ms: number) {
  const line = `[TRACE] ${label} ${ms.toFixed(1)}ms @ ${new Date().toISOString()}`;
  console.log(line);
  try {
    appendFileSync(logPath, line + "\n");
  } catch {
    // ignore file write failures (e.g. read-only fs)
  }
}
