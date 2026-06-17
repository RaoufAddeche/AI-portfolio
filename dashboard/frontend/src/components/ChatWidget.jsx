import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import { useLang } from "../i18n.jsx";

export default function ChatWidget() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: t("chat.greeting") }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);

  const suggestions = [t("chat.s1"), t("chat.s2"), t("chat.s3")];

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Met à jour le message d'accueil si la langue change avant tout échange.
  useEffect(() => {
    setMessages((m) => (m.length === 1 ? [{ role: "assistant", content: t("chat.greeting") }] : m));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const send = async (question) => {
    const q = (question ?? input).trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, lang }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: res.ok ? data.answer : data.detail || t("chat.error") },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: t("chat.unavailable") }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat"
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" strokeWidth={1.75} /> : <MessageSquare className="h-6 w-6" strokeWidth={1.75} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[32rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl animate-fade-up">
          <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft text-accent">
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{t("chat.header")}</p>
              <p className="text-xs text-muted">{t("chat.subtitle")}</p>
            </div>
          </div>

          <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {loading && <Bubble role="assistant" content="…" />}

            {messages.length === 1 && (
              <div className="space-y-2 pt-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full rounded-lg border border-line px-3 py-2 text-left text-xs text-body transition-colors hover:border-accent hover:text-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-line p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chat.placeholder")}
              className="field flex-1 py-2"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
            >
              <Send className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Bubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isUser
            ? "max-w-[85%] rounded-2xl rounded-br-sm bg-accent px-3.5 py-2 text-sm text-white"
            : "max-w-[85%] rounded-2xl rounded-bl-sm bg-surface-2 px-3.5 py-2 text-sm text-ink"
        }
      >
        {content}
      </div>
    </div>
  );
}
