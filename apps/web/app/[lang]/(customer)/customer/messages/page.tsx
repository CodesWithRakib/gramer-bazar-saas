import { CustomerMessagesView } from "@/features/customer/messages";

export default async function CustomerMessagesPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <CustomerMessagesView lang={lang} />;
}
