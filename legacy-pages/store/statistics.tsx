import AdReport from "brancy/components/advertise/adList/popups/adreport";
import Modal from "brancy/components/design/modal";
import NotAllowed from "brancy/components/notOk/notAllowed";
import NotShopper from "brancy/components/notOk/notShopper";
import { NotifType, notify } from "brancy/components/notifications/notificationBox";
import CouponManager from "brancy/components/store/statistics/couponManager";
import CreateCouponModal, { CreateCouponRequest } from "brancy/components/store/statistics/createCouponModal";
import UpdateCouponModal, { UpdateCouponRequest } from "brancy/components/store/statistics/updateCouponModal";
import TotalSalesReport from "brancy/components/store/statistics/totalSalesReport";
import TotalSales from "brancy/components/store/statistics/totalSalesStatistics";
import TwoMonth from "brancy/components/store/statistics/twoMonth";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { packageStatus, RoleAccess } from "brancy/helper/loadingStatus";
import { LanguageKey } from "brancy/i18n";
import { PartnerRole } from "brancy/models/enums";
import IUserCoupon, {
  IBuyerPurchaseReport,
  ISaleMonth,
  ISaleShortMonth,
  IStoreStatisticsInfo,
} from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./statistics.module.css";

const Statistics = () => {
  //  return <Soon />;
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { t } = useTranslation();
  const [hasTotalMore, setHasTotalMore] = useState(false);
  const [advertiseId, setAdvertiseId] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<IUserCoupon | null>(null);
  const [coupons, setCoupons] = useState<IUserCoupon[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [couponsNextMaxId, setCouponsNextMaxId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [couponSearchQuery, setCouponSearchQuery] = useState("");
  const [updatingCouponId, setUpdatingCouponId] = useState<number | null>(null);
  const [isLoadingMoreCoupons, setIsLoadingMoreCoupons] = useState(false);
  const isLoadingMoreCouponsRef = useRef(false);
  const normalCouponsCacheRef = useRef(new Map<string, { coupons: IUserCoupon[]; nextMaxId: string | null }>());
  const router = useRouter();
  const [twoMonth, setTwoMonth] = useState<ISaleMonth[]>([]);
  const [totalSalesStatistics, setTotalSalesStatistics] = useState<ISaleShortMonth[]>([]);
  const [totalSalesReport, setTotalSalesReport] = useState<IBuyerPurchaseReport[] | null>(null);
  function removeMask() {
    setShowReport(false);
  }
  function showAdReport(advertiseId: number) {
    setAdvertiseId(advertiseId);
    setShowReport(true);
  }
  const loadCoupons = useCallback(async () => {
    if (!session) return;
    const query = couponSearchQuery.trim();
    const cacheKey = `${isActive}:${isPrivate}`;
    const cachedCoupons = !query ? normalCouponsCacheRef.current.get(cacheKey) : undefined;
    if (cachedCoupons) {
      setCoupons(cachedCoupons.coupons);
      setCouponsNextMaxId(cachedCoupons.nextMaxId);
      return;
    }
    setIsLoadingCoupons(true);
    setCoupons([]);
    setCouponsNextMaxId(null);
    const response = await clientFetchApi<undefined, IUserCoupon[]>("/api/coupon/GetCoupons", {
      session,
      queries: query ? [{ key: "query", value: query }] : [],
    });
    if (response.succeeded) {
      const firstPage = response.value ?? [];
      const nextMaxId = firstPage.length > 0 ? String(firstPage[firstPage.length - 1].couponId) : null;
      setCoupons(firstPage);
      setCouponsNextMaxId(nextMaxId);
      if (!query) normalCouponsCacheRef.current.set(cacheKey, { coupons: firstPage, nextMaxId });
    } else {
      notify(response.info.responseType, NotifType.Warning);
      setCoupons([]);
      setCouponsNextMaxId(null);
    }
    setIsLoadingCoupons(false);
  }, [couponSearchQuery, isActive, isPrivate, session]);

  const fetchMoreCoupons = useCallback(async (): Promise<IUserCoupon[]> => {
    if (!session || !couponsNextMaxId || couponSearchQuery.trim()) return [];
    const response = await clientFetchApi<undefined, IUserCoupon[]>("/api/coupon/GetCoupons", {
      session,
      queries: [{ key: "nextMaxId", value: couponsNextMaxId }],
    });
    if (!response.succeeded) {
      notify(response.info.responseType, NotifType.Warning);
      setCouponsNextMaxId(null);
      return [];
    }
    const items = response.value ?? [];
    setCouponsNextMaxId(items.length > 0 ? String(items[items.length - 1].couponId) : null);
    return items;
  }, [couponSearchQuery, couponsNextMaxId, isActive, isPrivate, session]);

  const handleLoadMoreCoupons = useCallback(async () => {
    if (isLoadingMoreCouponsRef.current || !couponsNextMaxId || couponSearchQuery.trim()) return;
    isLoadingMoreCouponsRef.current = true;
    setIsLoadingMoreCoupons(true);
    try {
      const newCoupons = await fetchMoreCoupons();
      if (newCoupons.length > 0) {
        setCoupons((current) => {
          const existingIds = new Set(current.map((coupon) => coupon.couponId));
          const updatedCoupons = [...current, ...newCoupons.filter((coupon) => !existingIds.has(coupon.couponId))];
          normalCouponsCacheRef.current.set(`${isActive}:${isPrivate}`, {
            coupons: updatedCoupons,
            nextMaxId: couponsNextMaxId,
          });
          return updatedCoupons;
        });
      }
    } finally {
      isLoadingMoreCouponsRef.current = false;
      setIsLoadingMoreCoupons(false);
    }
  }, [couponSearchQuery, couponsNextMaxId, fetchMoreCoupons]);
  async function handleCreateCoupon(coupon: CreateCouponRequest): Promise<boolean> {
    if (!session) return false;
    const response = await clientFetchApi<CreateCouponRequest, boolean>("/api/coupon/CreateCoupon", {
      methodType: MethodType.post,
      session,
      data: coupon,
    });
    if (!response.succeeded) {
      notify(response.info.responseType, NotifType.Warning);
      return false;
    }
    normalCouponsCacheRef.current.clear();
    await loadCoupons();
    return true;
  }
  async function handleUpdateCoupon(coupon: UpdateCouponRequest): Promise<boolean> {
    if (!session) return false;
    const response = await clientFetchApi<undefined, boolean>("/api/coupon/UpdateCoupon", {
      methodType: MethodType.get,
      session,
      queries: [
        { key: "couponId", value: String(coupon.couponId) },
        { key: "expireTime", value: String(coupon.expireTime) },
        { key: "maxCount", value: String(coupon.maxCount) },
        { key: "showInBio", value: String(coupon.showInBio) },
      ],
    });
    if (!response.succeeded) {
      notify(response.info.responseType, NotifType.Warning);
      return false;
    }
    normalCouponsCacheRef.current.clear();
    await loadCoupons();
    return true;
  }
  async function handleCouponVisibilityChange(coupon: IUserCoupon, isDelete: boolean) {
    if (!session) return;
    setUpdatingCouponId(coupon.couponId);
    const response = await clientFetchApi<undefined, boolean>(
      isDelete ? "/api/coupon/DeleteCoupon" : "/api/coupon/ActivateCoupon",
      {
        session,
        queries: [{ key: "couponId", value: String(coupon.couponId) }],
      },
    );
    if (response.succeeded) {
      setCoupons((previous) =>
        previous.map((item) => (item.couponId === coupon.couponId ? { ...item, isDeleted: isDelete } : item)),
      );
      normalCouponsCacheRef.current.forEach((cached, key) => {
        normalCouponsCacheRef.current.set(key, {
          ...cached,
          coupons: cached.coupons.map((item) =>
            item.couponId === coupon.couponId ? { ...item, isDeleted: isDelete } : item,
          ),
        });
      });
    } else notify(response.info.responseType, NotifType.Warning);
    setUpdatingCouponId(null);
  }
  async function handleLoadMore(pagination: number) {
    //Api to get more total sales report based on <<< pagination >>>
    const res: IBuyerPurchaseReport[] = [
      {
        buyer: {
          fullname: "user6",
          profileUrl: "/no-profile.svg",
          username: "@user6",
        },
        totalPurchases: 24,
        totalAmount: 888999777,
        lastPurchase: Date.now(),
      },
      {
        buyer: {
          fullname: "user7",
          profileUrl: "/no-profile.svg",
          username: "@user7",
        },
        totalPurchases: 19,
        totalAmount: 720000000,
        lastPurchase: Date.now(),
      },
      {
        buyer: {
          fullname: "user8",
          profileUrl: "/no-profile.svg",
          username: "@user8",
        },
        totalPurchases: 15,
        totalAmount: 550000000,
        lastPurchase: Date.now(),
      },
      {
        buyer: {
          fullname: "user9",
          profileUrl: "/no-profile.svg",
          username: "@user9",
        },
        totalPurchases: 11,
        totalAmount: 420000000,
        lastPurchase: Date.now(),
      },
    ];
    console.log("loadmore");
    setTimeout(() => {
      setTotalSalesReport((prev) => (prev ? [...prev, ...res] : []));
      setHasTotalMore(false);
    }, 2000);
  }
  useEffect(() => {
    //Api to get last two month and total sales statistics
    var response: IStoreStatisticsInfo = {
      totalSalesStatistics: [
        {
          day: 1,
          month: 0,
          plusCount: 12,
          totalCount: 80,
          year: 2022,
          totalIncome: 520,
        },
        {
          day: 1,
          month: 5,
          plusCount: 18,
          totalCount: 120,
          year: 2022,
          totalIncome: 680,
        },
        {
          day: 1,
          month: 2,
          plusCount: 24,
          totalCount: 170,
          year: 2023,
          totalIncome: 920,
        },
        {
          day: 1,
          month: 7,
          plusCount: 30,
          totalCount: 210,
          year: 2023,
          totalIncome: 1110,
        },
        {
          day: 1,
          month: 11,
          plusCount: 36,
          totalCount: 260,
          year: 2023,
          totalIncome: 1430,
        },
        {
          day: 1,
          month: 1,
          plusCount: 28,
          totalCount: 240,
          year: 2024,
          totalIncome: 1320,
        },
        {
          day: 1,
          month: 4,
          plusCount: 40,
          totalCount: 320,
          year: 2024,
          totalIncome: 1720,
        },
        {
          day: 1,
          month: 7,
          plusCount: 52,
          totalCount: 410,
          year: 2024,
          totalIncome: 2100,
        },
        {
          day: 1,
          month: 10,
          plusCount: 60,
          totalCount: 460,
          year: 2024,
          totalIncome: 2450,
        },
        {
          day: 1,
          month: 0,
          plusCount: 22,
          totalCount: 180,
          year: 2025,
          totalIncome: 980,
        },
        {
          day: 2,
          month: 10,
          plusCount: 24,
          totalCount: 195,
          year: 2025,
          totalIncome: 1100,
        },
        {
          day: 15,
          month: 10,
          plusCount: 28,
          totalCount: 220,
          year: 2025,
          totalIncome: 1250,
        },
        {
          day: 28,
          month: 10,
          plusCount: 34,
          totalCount: 260,
          year: 2025,
          totalIncome: 1420,
        },
        {
          day: 3,
          month: 11,
          plusCount: 30,
          totalCount: 240,
          year: 2025,
          totalIncome: 1320,
        },
        {
          day: 11,
          month: 11,
          plusCount: 36,
          totalCount: 280,
          year: 2025,
          totalIncome: 1500,
        },
        {
          day: 19,
          month: 11,
          plusCount: 42,
          totalCount: 330,
          year: 2025,
          totalIncome: 1710,
        },
      ],
      twoMonth: [
        {
          dayList: [],
          month: 0,
          plusCount: 0,
          totalCount: 3800,
          users: [],
          year: 2024,
          totalIncom: 18500,
          previousPlusCount: undefined,
          lastUpdate: 0,
        },
        {
          dayList: [],
          month: 1,
          plusCount: 14,
          totalCount: 3699,
          users: [],
          year: 2024,
          totalIncom: 25000,
          previousPlusCount: undefined,
          lastUpdate: 0,
        },
      ],
      totalSalesReport: [
        {
          buyer: {
            fullname: "user1",
            profileUrl: "/no-profile.svg",
            username: "@user1",
          },
          totalPurchases: 28,
          totalAmount: 1100000000,
          lastPurchase: Date.now(),
        },
        {
          buyer: {
            fullname: "user2",
            profileUrl: "/no-profile.svg",
            username: "@user2",
          },
          totalPurchases: 21,
          totalAmount: 840000000,
          lastPurchase: Date.now(),
        },
        {
          buyer: {
            fullname: "user3",
            profileUrl: "/no-profile.svg",
            username: "@user3",
          },
          totalPurchases: 17,
          totalAmount: 630000000,
          lastPurchase: Date.now(),
        },
        {
          buyer: {
            fullname: "user4",
            profileUrl: "/no-profile.svg",
            username: "@user4",
          },
          totalPurchases: 13,
          totalAmount: 490000000,
          lastPurchase: Date.now(),
        },
        {
          buyer: {
            fullname: "user5",
            profileUrl: "/no-profile.svg",
            username: "@user5",
          },
          totalPurchases: 9,
          totalAmount: 360000000,
          lastPurchase: Date.now(),
        },
        {
          buyer: {
            fullname: "user5b",
            profileUrl: "/no-profile.svg",
            username: "@user5b",
          },
          totalPurchases: 7,
          totalAmount: 275000000,
          lastPurchase: Date.now() - 1000 * 60 * 60 * 24 * 20,
        },
      ],
    };
    setTwoMonth(response.twoMonth);
    setTotalSalesStatistics(response.totalSalesStatistics);
    setTimeout(() => {
      setTotalSalesReport(response.totalSalesReport);
      setHasTotalMore(true);
    }, 2000);
  }, []);
  useEffect(() => {
    if (!session) return;
    if (session?.user.currentIndex === -1) router.push("/user");
    if (!session || !packageStatus(session)) router.push("/upgrade");
  }, [session]);
  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);
  if (!session?.user.isShopper) return <NotShopper />;
  if (!RoleAccess(session, PartnerRole.Products) && !RoleAccess(session, PartnerRole.Orders)) return <NotAllowed />;
  return (
    session &&
    session!.user.currentIndex !== -1 && (
      <>
        {/* head for SEO */}
        <Head>
          {" "}
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <title>Bran.cy ▸ {t(LanguageKey.navbar_Statistics)}</title>
          <meta name="description" content="Advanced Instagram post management tool" />
          <meta name="theme-color"></meta>
          <meta
            name="keywords"
            content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
          />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://www.Brancy.app/page/posts" />
          {/* Add other meta tags as needed */}
        </Head>
        {/* head for SEO */}
        {/* <Soon /> */}
        <main>
          {/* ___twomonth___*/}

          <div className={styles.pinContainer}>
            {twoMonth.length > 0 && <TwoMonth data={twoMonth} />}
            {/* ___statistics___*/}

            <TotalSales data={totalSalesStatistics} />

            {/* ___salesreport___*/}

            <TotalSalesReport
              salesReports={totalSalesReport}
              handleLoadMore={handleLoadMore}
              hasTotalMore={hasTotalMore}
            />
            <CouponManager
              coupons={coupons}
              isLoading={isLoadingCoupons}
              isLoadingMore={isLoadingMoreCoupons}
              onReachEnd={handleLoadMoreCoupons}
              isActive={isActive}
              isPrivate={isPrivate}
              searchQuery={couponSearchQuery}
              onSearchQueryChange={setCouponSearchQuery}
              onActiveFilterChange={setIsActive}
              onPrivateFilterChange={setIsPrivate}
              updatingCouponId={updatingCouponId}
              onCreateClick={() => setShowCreateCoupon(true)}
              onEditClick={(coupon) => {
                setEditingCoupon(coupon);
              }}
              onVisibilityChange={handleCouponVisibilityChange}
            />
          </div>
        </main>
        {showReport && <AdReport removeMask={removeMask} advertiseId={advertiseId} />}
        <CreateCouponModal
          closePopup={() => setShowCreateCoupon(false)}
          showContent={showCreateCoupon}
          onCreate={handleCreateCoupon}
        />
        <Modal closePopup={() => setEditingCoupon(null)} classNamePopup="popup" showContent={Boolean(editingCoupon)}>
          {editingCoupon && (
            <UpdateCouponModal
              coupon={editingCoupon}
              closePopup={() => setEditingCoupon(null)}
              onUpdate={handleUpdateCoupon}
            />
          )}
        </Modal>
      </>
    )
  );
};

export default Statistics;
