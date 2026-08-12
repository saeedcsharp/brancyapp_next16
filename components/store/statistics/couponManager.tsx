import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import SwitchButton from "brancy/components/design/switchButton/switchButton";
import RingLoader from "brancy/components/design/loader/ringLoder";
import Slider, { SliderSlide } from "brancy/components/design/slider/slider";
import initialzedTime from "brancy/helper/manageTimer";
import { LanguageKey } from "brancy/i18n";
import IUserCoupon from "brancy/models/interfaces";
import styles from "./couponManager.module.css";
import useHideDiv from "brancy/hook/useHide";

interface CouponManagerProps {
  coupons: IUserCoupon[];
  isLoading: boolean;
  isLoadingMore: boolean;
  onReachEnd: () => void;
  isActive: boolean;
  isPrivate: boolean;
  onActiveFilterChange: (value: boolean) => void;
  onPrivateFilterChange: (value: boolean) => void;
  updatingCouponId: number | null;
  onCreateClick: () => void;
  onVisibilityChange: (coupon: IUserCoupon, showInBio: boolean) => void;
}

const CouponManager = ({
  coupons,
  isLoading,
  isLoadingMore,
  onReachEnd,
  isActive,
  isPrivate,
  onActiveFilterChange,
  onPrivateFilterChange,
  updatingCouponId,
  onCreateClick,
  onVisibilityChange,
}: CouponManagerProps) => {
  const { t } = useTranslation();
  const { hidePage, gridSpan, toggle } = useHideDiv(true, 57);

  return (
    <section style={gridSpan} className={styles.container} aria-labelledby="coupon-manager-title">
      <div onClick={toggle} className={styles.header}>
        <div>
          <div className="circle" />
          <h2 id="coupon-manager-title" className="Title">
            {t(LanguageKey.storestatistics_couponTitle)}
          </h2>
        </div>
        <div className={styles.actions}>
          {hidePage && (
            <button
              className="saveButton"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onCreateClick();
              }}>
              {t(LanguageKey.storestatistics_addCoupon)}
            </button>
          )}
        </div>
      </div>

      {hidePage && (
        <>
          <div className={styles.filterToolbar} onClick={(event) => event.stopPropagation()}>
            <div className={styles.filterGroup}>
              <label className={`${styles.filter} ${isActive ? styles.filterSelected : ""}`}>
                {t(LanguageKey.active)}
                <SwitchButton
                  name="coupon-filter-active"
                  checked={isActive}
                  handleToggle={(event) => onActiveFilterChange(event.target.checked)}
                  role="switch"
                />
              </label>
              <label className={`${styles.filter} ${isPrivate ? styles.filterSelected : ""}`}>
                {t(LanguageKey.pageTools_onlyprivate)}
                <SwitchButton
                  name="coupon-filter-private"
                  checked={isPrivate}
                  handleToggle={(event) => onPrivateFilterChange(event.target.checked)}
                  role="switch"
                />
              </label>
            </div>
          </div>
          {isLoading ? (
            <div className={styles.loading}>
              <RingLoader />
            </div>
          ) : coupons.length === 0 ? (
            <p className={styles.empty}>{t(LanguageKey.storestatistics_noCoupons)}</p>
          ) : (
            <Slider className={styles.list} itemsPerSlide={2} onReachEnd={onReachEnd} isLoading={isLoadingMore}>
              {coupons.map((coupon) => {
                const exhausted = coupon.maxCount > 0 && coupon.useCount >= coupon.maxCount;
                const expired = coupon.expireTime > 0 && coupon.expireTime < Date.now();
                return (
                  <SliderSlide key={coupon.couponId}>
                    <article className={styles.coupon}>
                      <div className={styles.codeRow}>
                        <strong>{coupon.code}</strong>
                        <span
                          className={`${styles.status} ${expired || exhausted || coupon.isDeleted ? styles.inactive : ""}`}>
                          {coupon.isDeleted
                            ? t(LanguageKey.storestatistics_couponDeleted)
                            : expired
                              ? t(LanguageKey.storestatistics_couponExpired)
                              : exhausted
                                ? t(LanguageKey.storestatistics_couponExhausted)
                                : t(LanguageKey.storestatistics_couponActive)}
                        </span>
                      </div>
                      <div className={styles.details}>
                        <span>{t(LanguageKey.storestatistics_discountValue, { discount: coupon.discount })}</span>
                        <span>
                          {t(LanguageKey.storestatistics_couponUsage, {
                            used: coupon.useCount,
                            max: coupon.maxCount || t(LanguageKey.storestatistics_unlimited),
                          })}
                        </span>
                        {coupon.maxDiscount !== null && (
                          <span>
                            {t(LanguageKey.storestatistics_maxDiscountValue, {
                              value: coupon.maxDiscount.toLocaleString(),
                            })}
                          </span>
                        )}
                        <span>
                          {t(LanguageKey.storestatistics_expiryValue, {
                            date: coupon.expireTime
                              ? new DateObject({
                                  date: coupon.expireTime * 1000,
                                  calendar: initialzedTime().calendar,
                                  locale: initialzedTime().locale,
                                }).format("YYYY/MM/DD")
                              : "-",
                          })}
                        </span>
                      </div>
                      <label className={styles.visibilityControl}>
                        {t(LanguageKey.storestatistics_showInBio)}
                        <SwitchButton
                          name={`coupon-${coupon.couponId}-show-in-bio`}
                          checked={coupon.showInBio}
                          handleToggle={(event) => onVisibilityChange(coupon, event.target.checked)}
                          disabled={updatingCouponId === coupon.couponId}
                          role="switch"
                        />
                      </label>
                    </article>
                  </SliderSlide>
                );
              })}
            </Slider>
          )}
        </>
      )}
    </section>
  );
};

export default CouponManager;
