import { SuperAdminAdminsView } from "@/features/super-admin/users-management";

export default async function SuperAdminAdminsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <SuperAdminAdminsView lang={lang} />;
}
