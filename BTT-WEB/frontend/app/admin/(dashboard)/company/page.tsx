import { AdminNotice, AdminPageHeader } from '@/components/admin/AdminUI';
import { CompanySettingsForm } from '@/components/admin/CompanySettingsForm';
import { adminGet } from '@/lib/admin-server';
import { DEFAULT_SETTINGS } from '@/lib/site';
import type { SiteSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminCompanyPage() {
  const settings = await adminGet<SiteSettings>('/api/admin/settings');

  return (
    <>
      <AdminPageHeader
        eyebrow="Settings"
        title="Company information"
        description="Public brand, support, and business information used across the website. Changes are saved to the database."
      />
      {!settings ? (
        <div className="mb-4">
          <AdminNotice type="info">
            Existing settings could not be loaded. The form shows the built-in defaults; saving
            will create or replace the stored settings once the API is reachable.
          </AdminNotice>
        </div>
      ) : null}
      <CompanySettingsForm settings={settings || DEFAULT_SETTINGS} />
    </>
  );
}
