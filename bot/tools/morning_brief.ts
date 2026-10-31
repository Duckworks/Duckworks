import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { parseJobs, textFromUnknown } from "../lib/jobs.js";

type MailHit = { from: string; subject: string; snippet: string };

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function collectHits(value: unknown, found: MailHit[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collectHits(item, found);
    return;
  }
  const row = asRecord(value);
  if (!row) return;
  const subject = typeof row.subject === "string" ? row.subject : "";
  const snippet =
    typeof row.snippet === "string" ? row.snippet : typeof row.text === "string" ? row.text : "";
  const from = typeof row.from === "string" ? row.from : "";
  if (subject || snippet) found.push({ from, subject, snippet });
  for (const nested of Object.values(row)) {
    if (typeof nested === "object" && nested !== null) collectHits(nested, found);
  }
}

async function searchGmail(
  mcp: {
    names(): string[];
    listTools(name: string): Promise<Array<{ name: string }>>;
    callTool(
      name: string,
      tool: string,
      args?: Record<string, unknown>,
    ): Promise<{
      content: Array<{ type: string; text?: string }>;
      structuredContent?: Record<string, unknown>;
    }>;
  },
  lookbackHours: number,
): Promise<{ source: string; text: string; error?: string }> {
  if (!mcp.names().includes("gmail")) {
    return { source: "none", text: "" };
  }
  try {
    const tools = await mcp.listTools("gmail");
    const search = tools.find((tool) => /search/i.test(tool.name));
    if (!search) return { source: "gmail", text: "", error: "no search tool" };
    const days = Math.max(1, Math.ceil(lookbackHours / 24));
    const result = await mcp.callTool("gmail", search.name, {
      query: `newer_than:${days}d (job OR dispatch OR estimate OR HVAC OR "work order" OR duct OR service)`,
      maxResults: 15,
    });
    const hits: MailHit[] = [];
    collectHits(result.structuredContent, hits);
    const textHits = hits
      .map((hit) => `From: ${hit.from}\nSubject: ${hit.subject}\n${hit.snippet}`)
      .join("\n---\n");
    const rawText = result.content
      .filter((part) => part.type === "text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("\n");
    return { source: "gmail", text: textHits || rawText };
  } catch (error) {
    return { source: "gmail", text: "", error: textFromUnknown(error) };
  }
}

export default defineTool({
  description: prompt`
    Build today's job heads-up from pasted dispatch or work email.
    Call this before you write a morning recap. Never send mail.
    Pass the route as emails. If a Gmail host connection exists the
    tool will search it when emails is empty.
  `,
  effect: "idempotent",
  inputSchema: z.object({
    emails: z
      .string()
      .optional()
      .describe("Pasted dispatch, work-order, or job emails. Prefer this when the tech pasted text."),
    lookbackHours: z.number().optional().describe("How far back to search Gmail. Default 36."),
    techName: z.string().optional(),
  }),
  async execute({ emails, lookbackHours, techName }, ctx) {
    const windowHours = lookbackHours ?? 36;
    let source = "pasted";
    let raw = emails?.trim() ?? "";
    let mailError: string | undefined;
    if (!raw) {
      const searched = await searchGmail(ctx.host.mcp, windowHours);
      raw = searched.text;
      source = searched.source;
      mailError = searched.error;
    }
    const parsed = parseJobs(raw);
    const date = new Date().toISOString().slice(0, 10);
    const key = `brief:${ctx.session.id}:${date}`;
    const payload = {
      date,
      techName: techName ?? "tech",
      source,
      jobCount: parsed.jobs.length,
      jobs: parsed.jobs,
      leftover: parsed.leftover,
      needsEmail: parsed.jobs.length === 0,
      mailError: mailError ?? null,
    };
    await ctx.host.kv.put(key, payload);
    if (parsed.jobs.length > 0) {
      await ctx.artifacts.tag({
        kind: "morning-brief",
        key,
        title: `Morning brief ${date}`,
        data: { date, jobCount: parsed.jobs.length, source },
      });
    }
    return payload;
  },
});
