import { SettingsPanel } from "@/features/admin/settings-panel";
import { ModulesPanel } from "@/features/admin/modules-panel";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <ModulesPanel />
      <SettingsPanel />
    </div>
  );
}
