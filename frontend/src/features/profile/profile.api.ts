import type { UserDto } from '@et-trader/shared';
import { api } from '@/lib/api-client';

export type ProfileUpdate = {
  name?: string;
  startingBalance?: number;
  /** A client-resized data URL, or '' to remove the current photo. */
  image?: string;
};

export const updateProfile = (data: ProfileUpdate) =>
  api<UserDto>('/users/me', { method: 'PATCH', body: JSON.stringify(data) });
