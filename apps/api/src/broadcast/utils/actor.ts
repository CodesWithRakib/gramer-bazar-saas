import type { BroadcastActor } from '../services/broadcast-campaigns.service.js';

interface ActorLike {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

/** Build a display actor for audit logging from the authenticated principal. */
export function toBroadcastActor(user: ActorLike | undefined | null): BroadcastActor {
  const id = user?.id ?? 'system';
  const name =
    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || user?.phone || 'Super Admin';
  return { id, name };
}
