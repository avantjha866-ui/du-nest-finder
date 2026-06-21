import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/webhooks/listing-submitted")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.WEBHOOK_SECRET;
        const incoming = request.headers.get("x-webhook-secret");
        if (!secret || incoming !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }

        let body: Record<string, unknown>;
        try {
          body = await request.json();
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        const record = body.record as Record<string, unknown> | undefined;
        if (!record) return new Response("No record", { status: 400 });

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        if (!botToken || !chatId) {
          console.error("Telegram env vars missing");
          return new Response("OK", { status: 200 });
        }

        const id = record.id as string;
        const name = (record.name as string) || "Unnamed listing";
        const type = ((record.type as string) || "").toUpperCase();
        const locality = (record.locality as string) || "";
        const college = (record.college as string) || "";
        const rent = record.rent ? `₹${Number(record.rent).toLocaleString("en-IN")}` : "N/A";
        const owner = (record.owner_name as string) || "N/A";
        const whatsapp = (record.whatsapp as string) || "N/A";
        const gender = (record.gender as string) || "N/A";
        const walk = record.walk_min ? `${record.walk_min} min` : "N/A";

        const text = [
          `🏠 *New listing submitted!*`,
          ``,
          `*${name}* (${type})`,
          `📍 ${locality}${college ? ` · ${college}` : ""}`,
          `💰 Rent: ${rent}`,
          `🚶 Walk: ${walk}`,
          `👤 Gender: ${gender}`,
          ``,
          `*Owner:* ${owner}`,
          `*WhatsApp:* ${whatsapp}`,
          ``,
          `ID: \`${id}\``,
        ].join("\n");

        const siteUrl = process.env.SITE_URL || "https://your-site.com";

        const payload = {
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "✅ Approve", callback_data: `approve:${id}` },
                { text: "❌ Reject", callback_data: `reject:${id}` },
              ],
              [
                { text: "👀 View on admin panel", url: `${siteUrl}/admin/review` },
              ],
            ],
          },
        };

        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          console.error("Telegram sendMessage error:", await res.text());
        }

        return new Response("OK", { status: 200 });
      },
    },
  },
});
