import type {
  ListTimelineResponseDto,
  TimelineItemDto,
} from "@/types/chats/timeline-dto";

const mergeTimelinePages = (
  pages: readonly ListTimelineResponseDto[],
  liveMessages: readonly TimelineItemDto[] = [],
): TimelineItemDto[] => {
  const items = new Map<string, TimelineItemDto>();
  for (const page of pages) {
    for (const item of page.data.items) items.set(item.id, item);
  }
  for (const item of liveMessages) items.set(item.id, item);
  return [...items.values()].sort((a, b) => a.sequence - b.sequence || a.id.localeCompare(b.id));
};

export { mergeTimelinePages };
