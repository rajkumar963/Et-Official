import type { Metadata } from 'next';
import { ProfileView } from '@/features/profile/components/profile-view';

export const metadata: Metadata = { title: 'Your profile' };

export default function Page() {
  return <ProfileView />;
}
