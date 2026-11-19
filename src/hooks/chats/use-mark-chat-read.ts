import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { applyChatReadState } from "@/lib/chat-read-state";
import { markChatRead } from "@/services/chats/mark-chat-read";
import { sessionGeneration, sessionSuspended } from "@/services/auth/session-lifecycle";
import { ApiError } from "@/services/http/api-error";


const useMarkChatRead = (chatId: string, throughSequence: number | undefined) => {
  const client = useQueryClient();
  useEffect(() => {
    if (throughSequence === undefined) return;
    const generation = sessionGeneration();
    const abort = new AbortController();
    let running = false;
    let done = false;
    let attempts = 0;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const acknowledge = async () => {
      if (running || done || abort.signal.aborted || document.visibilityState !== "visible" || sessionSuspended() || generation !== sessionGeneration()) return;
      running = true;
      try {
        const { data } = await markChatRead(chatId, throughSequence, abort.signal);
        if (!abort.signal.aborted && generation === sessionGeneration() && !sessionSuspended()) {
          done = true;
          applyChatReadState(client, data);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status < 500 && error.status !== 429) { done = true; return; }
        if (!abort.signal.aborted) retry = setTimeout(() => { void acknowledge(); }, Math.min(30_000, 2_000 * 2 ** Math.min(attempts++, 4)));
      } finally { running = false; }
    };
    const onVisible = () => { void acknowledge(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onVisible);
    void acknowledge();
    return () => {
      abort.abort(); clearTimeout(retry);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onVisible);
    };
  }, [chatId, throughSequence, client]);
};

export { useMarkChatRead };
