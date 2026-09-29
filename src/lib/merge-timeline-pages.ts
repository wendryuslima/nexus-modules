import type {
  ListTimelineResponseDto,
  TimelineItemDto,
} from "@/types/chats/timeline-dto";

const mergeTimelinePages = (
  pages: readonly ListTimelineResponseDto[],
): TimelineItemDto[] => pages.toReversed().flatMap((page) => page.data.items);

export { mergeTimelinePages };
