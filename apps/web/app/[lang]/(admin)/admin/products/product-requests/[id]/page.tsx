import { AdminProductRequestDetailsView } from "@/features/admin/products";

export default async function ProductRequestDetailsPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en"; id: string }>;
}) {
  const { lang, id } = await params;
  return <AdminProductRequestDetailsView lang={lang} id={id} />;
}
