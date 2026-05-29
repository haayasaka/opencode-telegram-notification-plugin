export async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string,
): Promise<boolean> {
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
      }),
    },
  );

  if (response.ok) return true;

  const errorBody = await response.json().catch(() => null);
  console.error(
    `Telegram API error (Markdown): ${response.status}`,
    JSON.stringify(errorBody),
  );

  const fallback = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    },
  );

  if (fallback.ok) return true;

  const fallbackBody = await fallback.json().catch(() => null);
  console.error(
    `Telegram API error (plain text): ${fallback.status}`,
    JSON.stringify(fallbackBody),
  );

  return false;
}
