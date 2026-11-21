type PresenceSnapshotEvent = {
  version: 1;
  type: "presence.snapshot";
  data: { userIds: string[]; complete: boolean };
};

type PresenceChangedEvent = {
  version: 1;
  type: "presence.changed";
  data: { userId: string; online: boolean };
};

type UserPresence = {
  onlineUserIds: string[];
  ready: boolean;
};

export type { PresenceSnapshotEvent, PresenceChangedEvent, UserPresence };
