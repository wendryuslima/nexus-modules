import { useCallback, useEffect, useRef, useState } from "react";

type UseTimelineScrollParams = {
  chatId: string;
  isTimelineLoaded: boolean;
  fetchOlderMessages: () => Promise<unknown>;
  latestItemId?: string;
  latestItemIsMine?: boolean;
  anchorSequence?: number;
  fetchNewerMessages?: () => Promise<unknown>;
};

const useTimelineScroll = ({
  chatId,
  isTimelineLoaded,
  fetchOlderMessages,
  latestItemId,
  latestItemIsMine,
  anchorSequence,
  fetchNewerMessages,
}: UseTimelineScrollParams) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const initiallyScrolledChatIdRef = useRef<string | null>(null);
  const nearBottomRef = useRef(true);
  const [newMessages, setNewMessages] = useState(false);

  useEffect(() => {
    if (initiallyScrolledChatIdRef.current !== chatId) initiallyScrolledChatIdRef.current = null;
    if (!isTimelineLoaded || initiallyScrolledChatIdRef.current === chatId) return;

    const frame = requestAnimationFrame(() => {
      const scrollContainer = scrollContainerRef.current;
      if (anchorSequence !== undefined) {
        scrollContainer?.querySelector<HTMLElement>(`[data-sequence='${anchorSequence}']`)?.scrollIntoView({ block: "center" });
      } else if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
      initiallyScrolledChatIdRef.current = chatId;
    });
    return () => cancelAnimationFrame(frame);
  }, [chatId, isTimelineLoaded, anchorSequence]);

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
    if (!latestItemId || anchorSequence !== undefined) return;
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
  }, [latestItemId, latestItemIsMine, anchorSequence]);

  const scrollToLatest = useCallback(() => {
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
    setNewMessages(false);
  }, []);

  const preservePosition = useCallback(async (fetchMessages: () => Promise<unknown>) => {
    const scrollContainer = scrollContainerRef.current;
    const previousHeight = scrollContainer?.scrollHeight ?? 0;
    const viewportTop = scrollContainer?.getBoundingClientRect().top ?? 0;
    const visible = Array.from(scrollContainer?.querySelectorAll<HTMLElement>("[data-sequence]") ?? [])
      .find((item) => item.getBoundingClientRect().bottom > viewportTop);
    const sequence = visible?.dataset.sequence;
    const previousTop = visible?.getBoundingClientRect().top;

    await fetchMessages();

    requestAnimationFrame(() => {
      if (scrollContainer) {
        const restored = sequence ? scrollContainer.querySelector<HTMLElement>(`[data-sequence='${sequence}']`) : undefined;
        scrollContainer.scrollTop += restored && previousTop !== undefined
          ? restored.getBoundingClientRect().top - previousTop
          : scrollContainer.scrollHeight - previousHeight;
      }
    });
  }, []);
  const loadOlderMessages = useCallback(() => preservePosition(fetchOlderMessages), [preservePosition, fetchOlderMessages]);
  const loadNewerMessages = useCallback(() => fetchNewerMessages ? preservePosition(fetchNewerMessages) : Promise.resolve(), [preservePosition, fetchNewerMessages]);

  return { scrollContainerRef, loadOlderMessages, loadNewerMessages, newMessages, scrollToLatest };
};

export { useTimelineScroll };
