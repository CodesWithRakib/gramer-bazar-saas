import { AdminDisputeDetailsView } from "@/features/super-admin/disputes";

export default async function SuperAdminDisputeDetailsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en"; id: string }>;
}) {
  const { lang, id } = await params;
  return <AdminDisputeDetailsView lang={lang} id={id} />;
}
