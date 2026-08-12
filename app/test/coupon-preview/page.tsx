"use client";

import IUserCoupon from "brancy/models/interfaces";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";

const CouponManager = dynamic(() => import("brancy/components/store/statistics/couponManager"), { ssr: false });

const coupons: IUserCoupon[] = Array.from({ length: 7 }, (_, index) => ({
  couponId: index + 1,
  code: `BRANCY${20 + index}`,
  discount: 10 + index * 5,
  expireTime: Math.floor(Date.now() / 1000) + 86400 * (index + 1),
  isDeleted: false,
  useCount: index * 2,
  maxCount: 20,
  userId: null,
  showInBio: index % 2 === 0,
  instagramerId: 1,
  createdTime: Math.floor(Date.now() / 1000),
  updateTime: Math.floor(Date.now() / 1000),
  maxDiscount: 1000000,
}));

export default function CouponPreviewPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  return (
    <main style={{ minHeight: "100vh", padding: 24, background: "var(--background-root)" }}>
      <CouponManager
        coupons={coupons}
        isLoading={false}
        isLoadingMore={false}
        containerRef={containerRef}
        isActive={isActive}
        isPrivate={isPrivate}
        onActiveFilterChange={setIsActive}
        onPrivateFilterChange={setIsPrivate}
        updatingCouponId={null}
        onCreateClick={() => undefined}
        onVisibilityChange={() => undefined}
      />
    </main>
  );
}
