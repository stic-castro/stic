import { SettingsPanel } from '../../features/settings/components/SettingsPanel';
import { getCurrentUserFromCookies } from '../../server/lib/current-user';

export default async function SettingsPage() {
  const currentUser = await getCurrentUserFromCookies();

  return <SettingsPanel user={currentUser} />;
}
