import type { Profile } from './profile';

export type NotificationType = 'follow' | 'like' | 'comment' | 'mention';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  actorId: string;
  entityId: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationWithActor extends Notification {
  actor: Profile;
}
