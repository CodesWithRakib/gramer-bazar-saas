import { SuperAdminAdminsView } from '@/features/super-admin/users-management';

export default async function SuperAdminAdminsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <SuperAdminAdminsView lang={lang} />;
}
