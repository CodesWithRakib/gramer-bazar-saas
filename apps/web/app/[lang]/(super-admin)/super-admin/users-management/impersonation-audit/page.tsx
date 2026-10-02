import { ImpersonationAuditView } from '@/features/super-admin/users-management';

export default async function ImpersonationAuditPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ targetUserId?: string }>;
}) {
  const { lang } = await params;
  const { targetUserId } = await searchParams;
  return <ImpersonationAuditView lang={lang} initialTargetUserId={targetUserId} />;
}
