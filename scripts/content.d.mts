export function slugify(value: unknown): string
export function escapeXml(value: unknown): string
export function parseDate(value: unknown, fallback?: unknown): string
export function buildContent(root?: string, options?: { now?: Date }): { routes: string[] }
