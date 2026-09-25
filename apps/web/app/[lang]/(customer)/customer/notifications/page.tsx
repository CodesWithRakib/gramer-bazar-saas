import { CustomerNotificationsView } from "@/features/customer/notifications";

export default async function CustomerNotificationsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <CustomerNotificationsView lang={lang} />;
}
