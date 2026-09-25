import { CustomerWishlistView } from "@/features/customer/wishlist";

export default async function CustomerWishlistPage({
  params,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
}) {
  const { lang } = await params;
  return <CustomerWishlistView lang={lang} />;
}
