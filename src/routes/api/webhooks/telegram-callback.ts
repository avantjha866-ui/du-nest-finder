import { createFileRoute } from "@tanstack/react-router";
import { directSupabase } from "@/lib/directSupabase";

export const Route = createFileRoute("/api/webhooks/telegram-callback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) return new Response("OK", { status: 200 });

        let body: Record<string, unknown>;
        try {
          body = await request.json();
        } catch {
          return new Response("OK", { status: 200 });
        }

        const callbackQuery = body.callback_query as Record<string, unknown> | undefined;
        if (!callbackQuery) return new Response("OK", { status: 200 });

        const callbackData = callbackQuery.data as string | undefined;
        const callbackId = callbackQuery.id as string;
        const message = callbackQuery.message as Record<string, unknown> | undefined;
        const messageId = message?.message_id as number | undefined;
        const chatId = (message?.chat as Record<string, unknown> | undefined)?.id as number | undefined;

        if (!callbackData || !callbackId || !chatId || !messageId) {
          return new Response("OK", { status: 200 });
        }

        const [action, listingId] = callbackData.split(":");
        if (!listingId || (action !== "approve" && action !== "reject")) {
          return new Response("OK", { status: 200 });
        }

        const status = action === "approve" ? "approved" : "rejected";

        // Update Supabase using service role key to bypass RLS
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceKey) {
          await answerCallback(botToken, callbackId, "❌ Server config error: missing service key");
          return new Response("OK", { status: 200 });
        }

        const { createClient } = await import("@supabase/supabase-js");
        const { DUNEST_SUPABASE_URL } = await import("@/lib/directSupabase");
        const adminClient = createClient(
          process.env.SUPABASE_URL ?? DUNEST_SUPABASE_URL,
          serviceKey,
          { auth: { persistSession: false } }
        );

        const { error } = await adminClient
          .from("listings")
          .update({ status })
          .eq("id", listingId);

        if (error) {
          await answerCallback(botToken, callbackId, `❌ Error: ${error.message}`);
          return new Response("OK", { status: 200 });
        }

        const emoji = status === "approved" ? "✅" : "❌";
        const label = status === "approved" ? "APPROVED" : "REJECTED";

        // Answer the callback (removes loading spinner on button)
        await answerCallback(botToken, callbackId, `${emoji} Listing ${label}`);

        // Edit original message to show decision
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            reply_markup: { inline_keyboard: [] },
          }),
        });

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `${emoji} Listing has been *${label}* and is ${status === "approved" ? "now live on the site!" : "removed from queue."}`,
            parse_mode: "Markdown",
          }),
        });

        return new Response("OK", { status: 200 });
      },
    },
  },
});

async function answerCallback(botToken: string, callbackQueryId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}
