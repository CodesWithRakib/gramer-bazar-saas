import { AdminMessagesView } from "@/features/super-admin/messages";

export default async function SuperAdminMessagesPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminMessagesView lang={lang} namespace="super-admin" />;
}
