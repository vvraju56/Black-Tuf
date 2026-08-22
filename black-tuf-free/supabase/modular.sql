-- ============================================================
-- Black Tuf — Modular platform
-- Run this in the Supabase SQL editor (after matching.sql).
-- Adds:
--   1. get_module_flags() public RPC (feature toggles via site_settings)
--   2. Seed rows for the services catalogue (dynamic services)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Public module-flags RPC — readable by every role.
-- Stored under site_settings.key = 'modules' (jsonb), admin-only writes.
-- ------------------------------------------------------------
create or replace function public.get_module_flags()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select value from public.site_settings where key = 'modules'),
    '{}'::jsonb
  );
$$;

grant execute on function public.get_module_flags() to anon, authenticated;

-- ------------------------------------------------------------
-- 2. Services seed — admin can later edit / add / disable these.
-- slugs mirror the matching `domains` ids so project forms and
-- engineer domains stay consistent.
-- ------------------------------------------------------------
insert into public.services (name, slug, description, icon, price, is_active, sort_order) values
  ('Web Development',             'web',        'High-performance web applications and portals built with modern frameworks and cloud-native architecture.', 'Globe',      null, true, 1),
  ('Mobile Application Development', 'mobile',   'Native and cross-platform mobile apps for iOS and Android with seamless backend integration.',           'Smartphone', null, true, 2),
  ('UI/UX & Graphic Design',      'uiux',       'Pixel-perfect interfaces, branding and user research that turn complex products into intuitive experiences.', 'Palette',    null, true, 3),
  ('Game Development',            'game',       'Immersive 2D and 3D games and interactive experiences for mobile, web, and desktop platforms.',             'Gamepad2',   null, true, 4),
  ('AI Development',              'ai',         'Custom AI agents, machine learning pipelines, and generative AI integrations tailored to your domain.',       'Brain',      null, true, 5),
  ('IoT Automation',              'iot',        'Connected device ecosystems, real-time monitoring dashboards, and automated edge-to-cloud pipelines.',      'Activity',   null, true, 6),
  ('PLC Programming',             'plc',        'Industrial automation logic for PLCs across Siemens, Allen Bradley, and Mitsubishi platforms.',               'Cpu',        null, true, 7),
  ('Electrical Works',            'electrical', 'Design, installation, and commissioning of LV panels, wiring, and power distribution systems.',             'Zap',        null, true, 8)
on conflict (slug) do nothing;
