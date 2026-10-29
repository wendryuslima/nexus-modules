import { useCallback, useEffect, useRef, useState } from "react";

type UseTimelineScrollParams = {
  chatId: string;
  isTimelineLoaded: boolean;
  fetchOlderMessages: () => Promise<unknown>;
  latestItemId?: string;
  latestItemIsMine?: boolean;
};

const useTimelineScroll = ({
  chatId,
  isTimelineLoaded,
  fetchOlderMessages,
  latestItemId,
  latestItemIsMine,
}: UseTimelineScrollParams) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const initiallyScrolledChatIdRef = useRef<string | null>(null);
  const nearBottomRef = useRef(true);
  const [newMessages, setNewMessages] = useState(false);

  useEffect(() => {
    if (!isTimelineLoaded || initiallyScrolledChatIdRef.current === chatId) return;

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;

    initiallyScrolledChatIdRef.current = chatId;
  }, [chatId, isTimelineLoaded]);

  useEffect(() => {
    const viewport = scrollContainerRef.current;
    if (!viewport) return;
    const update = () => {
      nearBottomRef.current = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 120;
      if (nearBottomRef.current) setNewMessages(false);
    };
    viewport.addEventListener("scroll", update);
    return () => viewport.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!latestItemId) return;
    if (!latestItemIsMine && !nearBottomRef.current) {
      setNewMessages(true);
      return;
    }

    requestAnimationFrame(() => {
      scrollContainerRef.current?.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [latestItemId, latestItemIsMine]);

  const scrollToLatest = useCallback(() => {
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
    setNewMessages(false);
  }, []);

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

  return { scrollContainerRef, loadOlderMessages, newMessages, scrollToLatest };
};

export { useTimelineScroll };
