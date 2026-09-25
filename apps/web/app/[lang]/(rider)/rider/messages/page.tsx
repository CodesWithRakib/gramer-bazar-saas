import { RiderMessagesView } from "@/features/rider/messages";

export default async function RiderMessagesPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <RiderMessagesView lang={lang} />;
}
