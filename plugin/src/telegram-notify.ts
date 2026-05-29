import type { Plugin } from "@opencode-ai/plugin";
import { sendNotification, sendQuestionNotification } from "./features/notify/service";
import { isConfigured } from "./lib/config";
import { createLogger } from "./lib/logger";
import { extractProjectName } from "./lib/utils";

export const TelegramNotify: Plugin = async ({ client, directory }) => {
  const logger = createLogger(client);

  if (!isConfigured()) {
    logger.error("Plugin not configured. Please replace INSTALL_KEY and WORKER_URL placeholders.");
    return {
      event: async () => {},
    };
  }

  const projectName = extractProjectName(directory);

  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        await sendNotification(client, logger, projectName, event.properties.sessionID);
      }
    },
    "tool.execute.before": async (input, output) => {
      if (input.tool === "question") {
        logger.debug("Question tool detected, sending notification", {
          sessionID: input.sessionID,
        });
        await sendQuestionNotification(client, logger, projectName, input.sessionID);
      }
    },
  };
};
