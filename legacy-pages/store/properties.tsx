import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import EditBusinessHours from "../../components/advertise/properties/popups/editBusinessHours";
import Modal from "../../components/design/modal";
import ToggleCheckBoxButton from "../../components/design/toggleCheckBoxButton";
import NotShopper from "../../components/notOk/notShopper";
import { changePositionToFixed, changePositionToRelative } from "../../helper/changeMarketAdsStyle";
import { findDayName } from "../../helper/findDayName";
import { packageStatus } from "../../helper/loadingStatus";
import { numbToAmAndPmTime } from "../../helper/numberFormater";
import { LanguageKey } from "../../i18n";
import { BusinessDay, IBusinessHour } from "../../models/advertise/peoperties";
import styles from "./properties.module.css";

const MapComponent = dynamic(() => import("../../components/mainLeaftlet"), {
  ssr: false,
});

interface StoreInfo {
  storeName: string;
  phone1: string;
  phone2: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  website: string;
  instagram: string;
  telegram: string;
  whatsapp: string;
}

interface DeliveryBranch {
  postEnabled: boolean;
  latitude: number;
  longitude: number;
}

interface NearbyBranch {
  id: string;
  name: string;
  managerName: string;
  address: string;
  phone: string;
  distance: number; // in kilometers
  estimatedTime: number; // in minutes
  latitude: number;
  longitude: number;
  isOpen: boolean;
  rating: number;
}

interface NotificationSettings {
  sms: boolean;
  email: boolean;
  systemNotification: boolean;
  instagramDirect: boolean;
  systemMessage: boolean;
}
const Properties = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    storeName: "",
    phone1: "",
    phone2: "",
    email: "",
    address: "",
    latitude: 35.6892,
    longitude: 51.389,
    website: "",
    instagram: "",
    telegram: "",
    whatsapp: "",
  });

  const [deliveryBranch, setDeliveryBranch] = useState<DeliveryBranch>({
    postEnabled: false,
    latitude: 35.6892,
    longitude: 51.389,
  });

  const [nearbyBranches, setNearbyBranches] = useState<NearbyBranch[]>([
    {
      id: "1",
      name: "شعبه مرکزی اصفهان",
      managerName: "علی اکبری",
      address: "اصفهان، میدان نقش جهان، پاساژ حکیم",
      phone: "۰۳۱۳۳۲۲۱۱۰۰",
      distance: 1.8,
      estimatedTime: 12,
      latitude: 32.6546,
      longitude: 51.668,
      isOpen: true,
      rating: 4.7,
    },
    {
      id: "2",
      name: "شعبه چهارباغ اصفهان",
      managerName: "زهرا محمدی",
      address: "اصفهان، خیابان چهارباغ عباسی، نرسیده به سی و سه پل",
      phone: "۰۳۱۳۶۶۵۵۴۴۳",
      distance: 3.2,
      estimatedTime: 18,
      latitude: 32.6416,
      longitude: 51.6593,
      isOpen: true,
      rating: 4.6,
    },
    {
      id: "3",
      name: "شعبه خیابان کاوه",
      managerName: "حسین رضایی",
      address: "اصفهان، خیابان کاوه، نبش کوچه شهید بهشتی",
      phone: "۰۳۱۳۲۲۴۴۵۵۶",
      distance: 5.5,
      estimatedTime: 28,
      latitude: 32.6823,
      longitude: 51.6351,
      isOpen: false,
      rating: 4.3,
    },
  ]);

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>("1");
  const [mapCenter, setMapCenter] = useState({ lat: 32.6546, lng: 51.668 });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    sms: false,
    email: false,
    systemNotification: false,
    instagramDirect: false,
    systemMessage: false,
  });

  const [businessHours, setBusinessHours] = useState<IBusinessHour[]>([
    { dayName: BusinessDay.Monday, timerInfo: { startTime: 0, endTime: 1410 } },
    { dayName: BusinessDay.Tuesday, timerInfo: { startTime: 0, endTime: 1410 } },
    { dayName: BusinessDay.Wednesday, timerInfo: { startTime: 0, endTime: 1410 } },
    { dayName: BusinessDay.Thursday, timerInfo: { startTime: 0, endTime: 1410 } },
    { dayName: BusinessDay.Friday, timerInfo: null },
    { dayName: BusinessDay.Saturday, timerInfo: { startTime: 0, endTime: 1410 } },
    { dayName: BusinessDay.Sunday, timerInfo: { startTime: 0, endTime: 1410 } },
  ]);

  const [showBusinessHoursPopup, setShowBusinessHoursPopup] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const removeMask = () => {
    changePositionToRelative();
    setShowBusinessHoursPopup(false);
  };

  const handleShowBusinessHour = () => {
    changePositionToFixed();
    setShowBusinessHoursPopup(true);
  };

  const saveBusinessHour = (info: IBusinessHour[]) => {
    // TODO: API call to save business hours
    setBusinessHours(info);
    removeMask();
  };

  useEffect(() => {
    if (session) {
      loadStoreProperties();
    }
  }, [session]);

  const loadStoreProperties = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/store/properties');
      // const data = await response.json();
      // setStoreInfo(data.storeInfo);
      // setDeliveryBranch(data.deliveryBranch);
      // setNotifications(data.notifications);
    } catch (error) {
      console.error("Error loading store properties:", error);
    }
  };

  const handleStoreInfoChange = (field: keyof StoreInfo, value: string | number) => {
    setStoreInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (field: keyof NotificationSettings) => {
    setNotifications((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleDeliveryToggle = () => {
    setDeliveryBranch((prev) => ({ ...prev, postEnabled: !prev.postEnabled }));
  };

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranchId(branchId);
    const branch = nearbyBranches.find((b) => b.id === branchId);
    if (branch) {
      setMapCenter({ lat: branch.latitude, lng: branch.longitude });
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSaveProperties = async () => {
    setIsSaving(true);
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/store/properties', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ storeInfo, deliveryBranch, notifications })
      // });
      console.log("Saving properties:", { storeInfo, deliveryBranch, notifications });
      alert("تنظیمات با موفقیت ذخیره شد!");
    } catch (error) {
      console.error("Error loading store properties:", error);
      alert("خطا در ذخیره تنظیمات!");
    } finally {
      setIsSaving(false);
    }
  };

  if (!session?.user.isShopper) return <NotShopper />;
  if (session?.user.currentIndex === -1) router.push("/user");
  if (!session || !packageStatus(session)) router.push("/upgrade");
  return (
    session &&
    session!.user.currentIndex !== -1 && (
      <>
        {/* head for SEO */}
        <Head>
          {" "}
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
          <title>Bran.cy ▸ {t(LanguageKey.navbar_Properties)}</title>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="description" content="Manage your store properties and settings on Bran.cy" />
          <meta name="theme-color" />
          <meta name="keywords" content="store settings, business properties, store management, Brancy store" />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://www.brancy.app/store/properties" aria-label="Canonical link" />
        </Head>
        {/* head for SEO */}
        {/* <Soon /> */}
        <main className="pinContainer">
          {/* ___Sales list___*/}
          <div className="tooBigCard">
            <div className={styles.all}>
              <div className="headerChild">
                <div className="circle"></div>
                <div className="Title">اطلاعات فروشگاه</div>
              </div>
              <div className={styles.section}>
                <div className={styles.option}>
                  <div className={styles.headerparent}>
                    <div className={styles.headertitle}>نام فروشگاه</div>
                  </div>
                  <input
                    type="text"
                    className={styles.input}
                    value={storeInfo.storeName}
                    onChange={(e) => handleStoreInfoChange("storeName", e.target.value)}
                    placeholder="نام فروشگاه خود را وارد کنید"
                  />
                </div>

                <div className={styles.option}>
                  <div className={styles.headerparent}>
                    <div className={styles.headertitle}>شماره تلفن ۱</div>
                  </div>
                  <input
                    type="tel"
                    className={styles.input}
                    value={storeInfo.phone1}
                    onChange={(e) => handleStoreInfoChange("phone1", e.target.value)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  />
                </div>

                <div className={styles.option}>
                  <div className={styles.headerparent}>
                    <div className={styles.headertitle}>شماره تلفن ۲</div>
                  </div>
                  <input
                    type="tel"
                    className={styles.input}
                    value={storeInfo.phone2}
                    onChange={(e) => handleStoreInfoChange("phone2", e.target.value)}
                    placeholder="۰۲۱۱۲۳۴۵۶۷۸"
                  />
                </div>

                <div className={styles.option}>
                  <div className={styles.headerparent}>
                    <div className={styles.headertitle}>ایمیل</div>
                  </div>
                  <input
                    type="email"
                    className={styles.input}
                    value={storeInfo.email}
                    onChange={(e) => handleStoreInfoChange("email", e.target.value)}
                    placeholder="store@example.com"
                  />
                </div>

                <div className={styles.option}>
                  <div className={styles.headerparent}>
                    <div className={styles.headertitle}>آدرس</div>
                  </div>
                  <textarea
                    className={styles.textarea}
                    value={storeInfo.address}
                    onChange={(e) => handleStoreInfoChange("address", e.target.value)}
                    placeholder="آدرس کامل فروشگاه را وارد کنید"
                    rows={4}
                  />
                </div>

                <div className={styles.option}>
                  <div className={styles.headerparent}>
                    <div className={styles.headertitle}>موقعیت مکانی</div>
                  </div>
                  <div className={styles.mapContainer}>
                    <MapComponent
                      location={{
                        lat: storeInfo.latitude,
                        lng: storeInfo.longitude,
                      }}
                      handleSelectPosition={(position: { lat: number; lng: number }) => {
                        handleStoreInfoChange("latitude", position.lat);
                        handleStoreInfoChange("longitude", position.lng);
                      }}
                      scrollWheelZoom={true}
                      draggable={true}
                    />
                  </div>
                </div>
              </div>
              <button className={styles.saveButton} onClick={handleSaveProperties} disabled={isSaving}>
                {isSaving ? "در حال ذخیره..." : "ذخیره اطلاعات فروشگاه"}
              </button>
            </div>
          </div>
          {/* ___Social Media___*/}
          <div className="tooBigCard" style={{ gridRowEnd: "span 41" }}>
            <div className={styles.all}>
              <div className="headerChild">
                <div className="circle"></div>
                <div className="Title">شبکه‌های اجتماعی و ارتباط</div>
              </div>
              <div className={styles.section}>
                <div className={styles.option}>
                  <div className={styles.headerparent}>
                    <div className={styles.headertitle}>وب‌سایت</div>
                  </div>
                  <input
                    type="url"
                    className={styles.input}
                    value={storeInfo.website}
                    onChange={(e) => handleStoreInfoChange("website", e.target.value)}
                    placeholder="https://www.yourstore.com"
                  />
                </div>

                <div className={styles.option}>
                  <div className={styles.headerparent}>
                    <div className={styles.headertitle}>اینستاگرام</div>
                  </div>
                  <input
                    type="text"
                    className={styles.input}
                    value={storeInfo.instagram}
                    onChange={(e) => handleStoreInfoChange("instagram", e.target.value)}
                    placeholder="@namefrooshgah"
                  />
                </div>

                <div className={styles.option}>
                  <div className={styles.headerparent}>
                    <div className={styles.headertitle}>تلگرام</div>
                  </div>
                  <input
                    type="text"
                    className={styles.input}
                    value={storeInfo.telegram}
                    onChange={(e) => handleStoreInfoChange("telegram", e.target.value)}
                    placeholder="@namefrooshgah"
                  />
                </div>

                <div className={styles.option}>
                  <div className={styles.headerparent}>
                    <div className={styles.headertitle}>واتس‌اپ</div>
                  </div>
                  <input
                    type="tel"
                    className={styles.input}
                    value={storeInfo.whatsapp}
                    onChange={(e) => handleStoreInfoChange("whatsapp", e.target.value)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  />
                </div>
              </div>
              {/* <button className={styles.saveButton} onClick={handleSaveProperties} disabled={isSaving}>
                {isSaving ? "در حال ذخیره..." : "ذخیره شبکه‌های اجتماعی"}
              </button> */}
            </div>
          </div>
          {/* ___delivery branch___*/}
          <div className="tooBigCard">
            <div className={styles.all}>
              <div className="headerChild">
                <div className="circle"></div>
                <div className="Title">شعبه‌های توزیع</div>
              </div>
              {/* سیستم ارسال پستی */}
              <div className={styles.section}>
                <div className={styles.postmodel}>
                  <div className={styles.iconmodel}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 46 41">
                      <path
                        fill="var(--color-light-yellow)"
                        d="M19.6 15.8 45.2 0l-.4 2-.6 3.8q-.7 4.3-1.7 8.5a21 21 0 0 1-10.2 13.2L28 30.2a5.5 5.5 0 0 1-8-1.7l-6.5-9.9a7 7 0 0 0-8.7-2.4l-.6.2 7 10.3q2.2 3.6 4.7 7a9 9 0 0 0 7.5 4.3h12.3L32 32.2l.5-.3 2-1.3L41.2 41H24.6a13 13 0 0 1-11.4-6L0 15.5c3.7-3.1 8.6-3.8 12.4-1.8q2.6 1.5 4.1 4l5.9 9q1.5 2.6 4.1 1l5.7-3.5a19 19 0 0 0 8.1-13.3l.4-2.4.5-2.6-20 12.3z"
                      />
                    </svg>
                  </div>
                  <div className={styles.frame}>
                    <div className={styles.title}>پست</div>
                    <div className={styles.text}>فعال‌سازی سیستم ارسال پستی</div>
                    <div className={styles.ready}></div>
                  </div>
                  <ToggleCheckBoxButton
                    name="postDelivery"
                    handleToggle={handleDeliveryToggle}
                    checked={deliveryBranch.postEnabled}
                    title="فعال‌سازی ارسال پستی"
                    role="switch"
                  />
                </div>
              </div>
              {/* نقشه اصلی */}
              <div className={styles.deliveryMapContainer}>
                <MapComponent
                  location={mapCenter}
                  handleSelectPosition={(position: { lat: number; lng: number }) => {
                    setMapCenter({ lat: position.lat, lng: position.lng });
                  }}
                  scrollWheelZoom={true}
                  draggable={true}
                />
              </div>

              {/* لیست شعبه‌های نزدیک */}
              <div className={styles.branchesSection}>
                <div className={styles.branchesHeader}>
                  <h3 className="title2">شعبه‌های نزدیک شما</h3>
                  <div className="explain">انتخاب کنید و موقعیت را روی نقشه مشاهده کنید</div>
                </div>

                <div className={styles.branchesGrid}>
                  {nearbyBranches.map((branch) => (
                    <div
                      key={branch.id}
                      className={`${styles.branchCard} ${
                        selectedBranchId === branch.id ? styles.branchCardSelected : ""
                      }`}
                      onClick={() => handleBranchSelect(branch.id)}>
                      <div className={styles.branchHeader}>
                        <div className={styles.branchNameSection}>
                          <div className={styles.branchName}>{branch.name}</div>
                          <div className={styles.branchRating}>
                            <svg className={styles.starIcon} viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{branch.rating}</span>
                          </div>
                        </div>
                        <div
                          className={`${styles.branchStatus} ${
                            branch.isOpen ? styles.statusOpen : styles.statusClosed
                          }`}>
                          {branch.isOpen ? "باز" : "بسته"}
                        </div>
                      </div>

                      <div className={styles.branchManager}>
                        <svg className={styles.iconSmall} viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>متصدی: {branch.managerName}</span>
                      </div>

                      <div className={styles.branchAddress}>
                        <svg className={styles.iconSmall} viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{branch.address}</span>
                      </div>

                      <div className={styles.branchPhone}>
                        <svg className={styles.iconSmall} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span>{branch.phone}</span>
                      </div>

                      <div className={styles.branchFooter}>
                        <div className={styles.branchDistance}>
                          <svg className={styles.iconSmall} viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{branch.distance} کیلومتر</span>
                        </div>
                        <div className={styles.branchTime}>
                          <svg className={styles.iconSmall} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                          </svg>
                          <span>حدود {branch.estimatedTime} دقیقه</span>
                        </div>
                      </div>

                      {selectedBranchId === branch.id && (
                        <div className={styles.branchSelected}>
                          <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>انتخاب شده</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* ___Business Hours___*/}
          <div className="tooBigCard">
            <div className={styles.all}>
              <div className="frameParent">
                <div className="headerChild">
                  <div className="circle"></div>
                  <div className="Title">ساعات کاری</div>
                </div>
                <div
                  title="ویرایش ساعات کاری"
                  onClick={handleShowBusinessHour}
                  className="twoDotIconContainer"
                  style={{ cursor: "pointer" }}>
                  <svg className="twoDotIcon" fill="none" viewBox="0 0 14 5">
                    <path
                      fill="var(--color-gray)"
                      d="M2.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
                    />
                  </svg>
                </div>
              </div>
              {businessHours.map((v, i) => (
                <div className={styles.section} key={i}>
                  <div className={styles.headerparent}>
                    <div className={styles.headertitle1}>{t(findDayName(v.dayName))}</div>
                    {v.timerInfo ? (
                      numbToAmAndPmTime(v.timerInfo?.startTime) === "12:00 AM" &&
                      numbToAmAndPmTime(v.timerInfo?.endTime) === "11:30 PM" ? (
                        <div className={styles.open} title="فعال ۲۴ ساعته">
                          {t(LanguageKey.advertiseProperties_24hours)}
                        </div>
                      ) : (
                        <div className={styles.active}>
                          <div className={styles.activehour}>
                            <div className={styles.amhour}>{numbToAmAndPmTime(v.timerInfo?.startTime)}</div>-
                            <div className={styles.pmhour}>{numbToAmAndPmTime(v.timerInfo?.endTime)}</div>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className={styles.close} title="غیرفعال در تمام روز">
                        {t(LanguageKey.advertiseProperties_close)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* ___notification___*/}
          <div className="bigcard" style={{ gridRowEnd: "span 41" }}>
            <div className={styles.all}>
              <div className="frameParent">
                <div className="headerChild">
                  <div className="circle"></div>
                  <div className="Title">اعلان‌ها</div>
                </div>
              </div>
              <div className={styles.section}>
                <div className={styles.headerparent}>
                  <div className={styles.headertitle1}>پیامک </div>
                  <ToggleCheckBoxButton
                    name="smsNotification"
                    handleToggle={() => handleNotificationToggle("sms")}
                    checked={notifications.sms}
                    title="اعلان پیامکی"
                    role="switch"
                  />
                </div>
              </div>
              <div className={styles.section}>
                <div className={styles.headerparent}>
                  <div className={styles.headertitle1}>ایمیل </div>
                  <ToggleCheckBoxButton
                    name="emailNotification"
                    handleToggle={() => handleNotificationToggle("email")}
                    checked={notifications.email}
                    title="اعلان ایمیلی"
                    role="switch"
                  />
                </div>
              </div>
              <div className={styles.section}>
                <div className={styles.headerparent}>
                  <div className={styles.headertitle1}>اعلان سیستمی</div>
                  <ToggleCheckBoxButton
                    name="systemNotification"
                    handleToggle={() => handleNotificationToggle("systemNotification")}
                    checked={notifications.systemNotification}
                    title="اعلان سیستمی"
                    role="switch"
                  />
                </div>
              </div>
              <div className={styles.section}>
                <div className={styles.headerparent}>
                  <div className={styles.headertitle1}>دایرکت اینستاگرام </div>
                  <ToggleCheckBoxButton
                    handleToggle={() => handleNotificationToggle("instagramDirect")}
                    checked={notifications.instagramDirect}
                    name="instagramDirect"
                    title="دایرکت اینستاگرام"
                    role="switch"
                  />
                </div>
              </div>
              <div className={styles.section}>
                <div className={styles.headerparent}>
                  <div className={styles.headertitle1}>پیام سیستمی </div>
                  <ToggleCheckBoxButton
                    name="systemMessage"
                    handleToggle={() => handleNotificationToggle("systemMessage")}
                    checked={notifications.systemMessage}
                    title="پیام سیستمی"
                    role="switch"
                  />
                </div>
              </div>
              {/* <button className={styles.saveButton} onClick={handleSaveProperties} disabled={isSaving}>
                {isSaving ? "در حال ذخیره..." : "ذخیره تنظیمات اعلان"}
              </button> */}
            </div>
          </div>
        </main>
        <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={showBusinessHoursPopup}>
          <EditBusinessHours businessInfo={businessHours} removeMask={removeMask} saveBusinessHour={saveBusinessHour} />
        </Modal>
      </>
    )
  );
};

export default Properties;
