import { useCallback, useEffect, useRef } from "react";

type UseTimelineScrollParams = {
  chatId: string;
  isTimelineLoaded: boolean;
  fetchOlderMessages: () => Promise<unknown>;
};

const useTimelineScroll = ({
  chatId,
  isTimelineLoaded,
  fetchOlderMessages,
}: UseTimelineScrollParams) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const initiallyScrolledChatIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isTimelineLoaded || initiallyScrolledChatIdRef.current === chatId) return;

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;

    initiallyScrolledChatIdRef.current = chatId;
  }, [chatId, isTimelineLoaded]);

  const loadOlderMessages = useCallback(async () => {
    const scrollContainer = scrollContainerRef.current;
    const previousHeight = scrollContainer?.scrollHeight ?? 0;

    await fetchOlderMessages();

    requestAnimationFrame(() => {
      if (scrollContainer) {
        scrollContainer.scrollTop += scrollContainer.scrollHeight - previousHeight;
      }
    });
  }, [fetchOlderMessages]);

  return { scrollContainerRef, loadOlderMessages };
};

export { useTimelineScroll };
