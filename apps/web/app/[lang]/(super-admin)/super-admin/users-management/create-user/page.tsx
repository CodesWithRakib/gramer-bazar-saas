import { SuperAdminCreateUserView } from "@/features/super-admin/users-management";

export default async function SuperAdminCreateUserPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <SuperAdminCreateUserView lang={lang} />;
}
