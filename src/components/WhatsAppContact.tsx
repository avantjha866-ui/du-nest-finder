import { MessageCircle } from "lucide-react";

interface WhatsAppContactProps {
  whatsapp: string;
  listingName: string;
  className?: string;
  label?: string;
}

export function WhatsAppContact({
  whatsapp,
  listingName,
  className = "",
  label = "WhatsApp owner",
}: WhatsAppContactProps) {
  if (!whatsapp) return null;

  // Strip non-digits, add 91 country code if needed
  const digits = whatsapp.replace(/\D/g, "");
  const number = digits.startsWith("91") ? digits : `91${digits}`;

  const message = encodeURIComponent(
    `Hi! I found your listing "${listingName}" on DUNest. I'm interested — can we talk?`
  );

  const href = `https://wa.me/${number}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-[#25D366] hover:bg-[#1ebe5d] text-white transition-colors ${className}`}
    >
      <MessageCircle size={16} />
      {label}
    </a>
  );
}
