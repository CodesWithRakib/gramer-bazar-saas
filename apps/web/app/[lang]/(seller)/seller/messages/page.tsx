import { SellerMessagesView } from "@/features/seller/messages";

export default async function SellerMessagesPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <SellerMessagesView lang={lang} />;
}
