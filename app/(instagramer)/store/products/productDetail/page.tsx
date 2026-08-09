import { Suspense } from "react";
import PageComponent from "../../../../../legacy-pages/store/products/productDetail";
import NotAllowedShopper from "brancy/components/notOk/notAllowedShopper";
import { useSession } from "next-auth/react";

type SearchParams = {
  tempId?: string;
};

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { tempId } = await searchParams;
  const { data: session } = useSession();
  if (session?.user.isInfluencer) return <NotAllowedShopper />;

  return (
    <Suspense fallback={<div />}>
      <PageComponent tempId={tempId!} />
    </Suspense>
  );
}
