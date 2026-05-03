import { useRouter } from "next/router";
import { useEffect } from "react";

interface ProductProps {
  // Add your props here if needed
}
const ProductPage: React.FC<ProductProps> = () => {
  const router = useRouter();
  const { shopId } = router.query;
  useEffect(() => {
    if (shopId) {
      router.push(`/user/shop/${shopId}`);
    }
  }, [shopId, router]);

  return <></>;
};

export default ProductPage;
