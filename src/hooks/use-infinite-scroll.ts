import { useEffect, useRef } from "react";

type InfiniteScrollOptions = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  itemCount: number;
  fetchNextPage: () => Promise<unknown>;
};

const useInfiniteScroll = ({ hasNextPage, isFetchingNextPage, isFetchNextPageError, itemCount, fetchNextPage }: InfiniteScrollOptions) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || isFetchNextPageError) return;
    const viewport = scrollAreaRef.current?.querySelector<HTMLElement>("[data-slot='scroll-area-viewport']");
    const sentinel = sentinelRef.current;
    if (!viewport || !sentinel) return;
    let requested = false;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !requested) {
        requested = true;
        void fetchNextPage();
      }
    }, { root: viewport, rootMargin: "0px 0px 160px 0px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, itemCount, fetchNextPage]);

  return { scrollAreaRef, sentinelRef };
};

export { useInfiniteScroll };
