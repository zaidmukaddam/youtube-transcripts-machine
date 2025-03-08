"use server";

import { Browserbase } from "@browserbasehq/sdk";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function startBBSSession() {
  const browserbase = new Browserbase({
    apiKey: process.env.BROWSERBASE_API_KEY || "",
  });

  const session = await browserbase.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID || "",
    timeout: 1000,
    proxies: true,
  });

  const debugUrl = await browserbase.sessions.debug(session.id);

  return {
    sessionId: session.id,
    debugUrl: debugUrl.debuggerFullscreenUrl,
  };
}

export async function generateSummary(transcripts: { text: string; timestamp: string }[]) {
  const { text } = await generateText({
    model: google("gemini-1.5-flash-8b"),
    prompt: `Please provide a concise summary of the following video transcript. Focus on the main topics, key points, and important takeaways.
    TRANSCRIPT:
    ${transcripts.map(t => `${t.timestamp} ${t.text}`).join("\n")}`,
  });

  return text;
}