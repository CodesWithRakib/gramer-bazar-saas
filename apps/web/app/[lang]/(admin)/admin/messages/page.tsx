import { AdminMessagesView } from "@/features/admin/messages";

export default async function AdminMessagesPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <AdminMessagesView lang={lang} namespace="admin" />;
}
