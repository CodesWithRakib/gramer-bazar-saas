import { RiderProfileView } from "@/features/rider/profile";

export default async function RiderProfilePage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <RiderProfileView lang={lang} />;
}
