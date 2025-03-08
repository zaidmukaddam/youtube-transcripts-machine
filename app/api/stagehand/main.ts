import { Page, BrowserContext, Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
interface Transcript {
  text: string;
  timestamp: string;
}

export async function main({
  page,
  stagehand,
  youtubeUrl,
}: {
  page: Page;
  context: BrowserContext;
  stagehand: Stagehand;
  youtubeUrl: string;
}): Promise<{ transcripts: Transcript[] }> {
  // Navigate to YouTube video
  await page.goto(youtubeUrl);

  // Wait for video player to load
  try {
    await page.waitForSelector('video');
  } catch (error) {
    console.log("error", error);
    await page.act({
      action: "wait for the video player to load",
    });
  }

  // Open transcript panel
  try {
    // Look for the "...more" button
    await page.click('tp-yt-paper-button#expand:has-text("...more")');

    // Click the "Show transcript" button with the correct selector
    await page.click('button.yt-spec-button-shape-next:has-text("Show transcript")');
  } catch (error) {
    console.log("error", error);
    await page.act({
      action: "open the video transcript panel",
    });
  }

  console.log("opened transcript panel");

  const transcriptPanel = await page.observe(
    {
      instruction: "extract all transcript texts and timestamps from segments-container id."
    }
  )

  console.log("transcript panel", transcriptPanel);

  const prompt = `Give JSON of all transcript entries with their timestamps in proper ascending order from the following text. 
  The timestamps should be in MM:SS format ONLY.
  ${transcriptPanel.map(t => t.description).join('\n')}`

  console.log("prompt", prompt);

  const { object: transcriptData, finishReason, response } = await generateObject({
    model: openai("gpt-4o-mini",
      {
        structuredOutputs: true
      }
    ),
    schema: z.object({
      transcripts: z.array(
        z.object(
          {
            text: z.string().describe("transcript text"),
            timestamp: z.string().describe("timestamp in MM:SS format")
          }
        )
      ),
    }),
    prompt,
  });

  console.log("transcript data", transcriptData);
  console.log("finish reason", finishReason);
  console.log("response", response);

  await stagehand.close();
  return { transcripts: transcriptData.transcripts };
}