import { useState } from "react";
import { MessageSquare, Star, Send } from "lucide-react";
import { toast } from "sonner";

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  needs: string;
  date: string;
}

interface StudentReviewsProps {
  listingId: string;
  listingName: string;
}

const STORAGE_KEY = (id: string) => `dunest.reviews.${id}`;

function loadReviews(id: string): Review[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY(id)) ?? "[]");
  } catch {
    return [];
  }
}

function saveReviews(id: string, reviews: Review[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY(id), JSON.stringify(reviews));
}

export function StudentReviews({ listingId, listingName }: StudentReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(() => loadReviews(listingId));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", rating: 5, text: "", needs: "" });
  const [hover, setHover] = useState(0);

  const submit = () => {
    if (!form.name.trim() || !form.text.trim()) {
      toast.error("Please enter your name and review");
      return;
    }
    const review: Review = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      rating: form.rating,
      text: form.text.trim(),
      needs: form.needs.trim(),
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    };
    const updated = [review, ...reviews];
    setReviews(updated);
    saveReviews(listingId, updated);
    setForm({ name: "", rating: 5, text: "", needs: "" });
    setOpen(false);
    toast.success("Review submitted!");
  };

  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  return (
    <div className="mb-5 border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-brand-green" />
          <span className="text-sm font-semibold">Student reviews</span>
          {avg !== null && (
            <span className="flex items-center gap-0.5 text-xs font-bold text-amber-600">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              {avg} ({reviews.length})
            </span>
          )}
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-semibold text-brand-green-dark hover:underline"
        >
          {open ? "Cancel" : "+ Write a review"}
        </button>
      </div>

      {/* Write form */}
      {open && (
        <div className="p-4 border-b border-border bg-white">
          <p className="text-xs text-muted-foreground mb-3">
            Sharing for <strong>{listingName}</strong> — helps future students!
          </p>

          <label className="block mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your name</span>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="First name only is fine"
              className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
            />
          </label>

          {/* Star rating */}
          <label className="block mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rating</span>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setForm((f) => ({ ...f, rating: s }))}
                >
                  <Star
                    size={22}
                    className={(hover || form.rating) >= s
                      ? "fill-amber-400 text-amber-400"
                      : "text-border"}
                  />
                </button>
              ))}
            </div>
          </label>

          <label className="block mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your experience</span>
            <textarea
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              rows={3}
              placeholder="How was your stay? Food, cleanliness, owner behaviour..."
              className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
            />
          </label>

          <label className="block mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              What could be improved? (optional)
            </span>
            <textarea
              value={form.needs}
              onChange={(e) => setForm((f) => ({ ...f, needs: e.target.value }))}
              rows={2}
              placeholder="e.g. WiFi is slow, water issues in morning, no parking..."
              className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
            />
          </label>

          <button
            onClick={submit}
            className="flex items-center gap-2 bg-brand-green hover:bg-brand-green-dark text-white text-sm font-semibold px-4 py-2 rounded-xl"
          >
            <Send size={14} /> Submit review
          </button>
        </div>
      )}

      {/* Reviews list */}
      <div className="divide-y divide-border">
        {reviews.length === 0 && !open && (
          <p className="text-xs text-muted-foreground text-center py-5 px-4">
            No reviews yet — be the first to share your experience!
          </p>
        )}
        {reviews.slice(0, 5).map((r) => (
          <div key={r.id} className="px-4 py-3 bg-white">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{r.name}</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={11}
                      className={r.rating >= s ? "fill-amber-400 text-amber-400" : "text-border"} />
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground">{r.date}</span>
            </div>
            <p className="text-xs text-foreground/80">{r.text}</p>
            {r.needs && (
              <p className="text-xs text-muted-foreground mt-1">
                <span className="font-semibold text-amber-600">Needs improvement:</span> {r.needs}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
