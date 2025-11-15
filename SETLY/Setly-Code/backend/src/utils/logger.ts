type Level = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const envLevel = (process.env.LOG_LEVEL?.toLowerCase() as Level) || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
const currentLevel = levelOrder[envLevel] ?? levelOrder.debug;

// Simple in-memory rate limiter for repetitive logs
const lastLogAt = new Map<string, number>();

function shouldLog(level: Level): boolean {
  return (levelOrder[level] >= currentLevel);
}

function fmt(args: any[]): any[] {
  return args.map(a => a instanceof Error ? (a.stack || a.message || String(a)) : a);
}

export const logger = {
  debug: (...args: any[]) => { if (shouldLog('debug')) console.debug(...fmt(args)); },
  info: (...args: any[]) => { if (shouldLog('info')) console.info(...fmt(args)); },
  warn: (...args: any[]) => { if (shouldLog('warn')) console.warn(...fmt(args)); },
  error: (...args: any[]) => { if (shouldLog('error')) console.error(...fmt(args)); },
  // Rate-limited warn/error to avoid log spam. key: unique identifier, intervalMs: minimum time between logs
  warnRate: (key: string, intervalMs: number, ...args: any[]) => {
    const now = Date.now();
    const last = lastLogAt.get(key) || 0;
    if (now - last >= intervalMs) {
      lastLogAt.set(key, now);
      if (shouldLog('warn')) console.warn(...fmt(args));
    }
  },
  errorRate: (key: string, intervalMs: number, ...args: any[]) => {
    const now = Date.now();
    const last = lastLogAt.get(key) || 0;
    if (now - last >= intervalMs) {
      lastLogAt.set(key, now);
      if (shouldLog('error')) console.error(...fmt(args));
    }
  },
};
