import { createFileRoute } from "@tanstack/react-router";
import { directSupabase } from "@/lib/directSupabase";

export const Route = createFileRoute("/api/public/contact/$listingId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { listingId } = params;
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(listingId)) {
          return new Response("Contact is unavailable for this sample listing.", { status: 404 });
        }

        const { data, error } = await directSupabase
          .from("listings")
          .select("name, whatsapp")
          .eq("id", listingId)
          .eq("status", "approved")
          .maybeSingle();

        if (error || !data?.whatsapp) {
          return new Response("Owner contact is unavailable.", { status: 404 });
        }

        const number = data.whatsapp.replace(/[^0-9]/g, "");
        if (!number) return new Response("Owner contact is unavailable.", { status: 404 });

        const message = `Hi, I found your listing on DUNest. I'm interested in ${data.name || "your property"}. Can we talk?`;
        const destination = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
        return new Response(null, {
          status: 302,
          headers: {
            Location: destination,
            "Cache-Control": "no-store, private",
            "Referrer-Policy": "no-referrer",
          },
        });
      },
    },
  },
});