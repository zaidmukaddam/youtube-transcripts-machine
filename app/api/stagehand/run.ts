"use server";

import StagehandConfig from "@/stagehand.config";
import { Stagehand } from "@browserbasehq/stagehand";
import { main } from "./main";

export async function runStagehand(youtubeUrl: string, sessionId?: string) {
  const stagehand = new Stagehand({
    ...StagehandConfig,
    browserbaseSessionID: sessionId,
  });
  
  await stagehand.init();
  
  const result = await main({ 
    page: stagehand.page, 
    context: stagehand.context, 
    stagehand,
    youtubeUrl 
  });
  
  await stagehand.close();
  
  return {
    ...result,
    sessionId
  };
}