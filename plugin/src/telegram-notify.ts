import type { Event } from "@opencode-ai/sdk";
import type { Plugin } from "@opencode-ai/plugin";
import { sendNotification, sendPermissionNotification, sendQuestionNotification } from "./features/notify/service";
import { isConfigured } from "./lib/config";
import { createLogger } from "./lib/logger";
import { extractProjectName } from "./lib/utils";

// Local type for permission.asked event (avoids reliance on @opencode-ai/sdk/v2 subpath exports)
interface PermissionAskedEvent {
  id: string;
  type: "permission.asked";
  properties: {
    sessionID: string;
    [key: string]: unknown;
  };
}

type ExtendedEvent = Event | PermissionAskedEvent;

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
      const ev = event as ExtendedEvent;

      if (ev.type === "session.idle") {
        await sendNotification(client, logger, projectName, ev.properties.sessionID);
      }

      if (ev.type === "permission.asked") {
        await sendPermissionNotification(client, logger, projectName, ev.properties.sessionID);
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
