import { Suspense } from "react";
import PageComponent from "../../../../../legacy-pages/store/products/productDetail";

type SearchParams = {
  tempId?: string;
};

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { tempId } = await searchParams;

  return (
    <Suspense fallback={<div />}>
      <PageComponent tempId={tempId!} />
    </Suspense>
  );
}
