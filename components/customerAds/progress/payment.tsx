import Head from "next/head";
import { ChangeEvent, useState } from "react";
import { DateObject } from "react-multi-date-picker";
import AdsTypeComp from "brancy/components/advertise/adsType";
import TimeTypeComp from "brancy/components/advertise/timeType";
import InputText from "brancy/components/design/inputText";
import PriceFormater, { PriceFormaterClassName, PriceType } from "brancy/components/priceFormater";
import initialzedTime from "brancy/helper/manageTimer";
import { AdvertiserStatus, ICustomer } from "brancy/models/customerAds/customerAd";
import styles from "brancy/components/customerAds/progress/progress.module.css";
const taxFactor = 10;
function Payment(props: { customerAd: ICustomer }) {
  const [inputBox, setInputBox] = useState<string>("");
  const [customerAd, setCustomerAd] = useState<ICustomer>(filterVerifiedAds());
  const [coupon, setCoupon] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(sum() + (taxFactor / 100) * sum() - coupon);
  async function handleInsertCoupon() {
    //Api to insert coupon
    const response = 100000;
    setCoupon(response);
    setTotalCost((prev) => prev - response);
  }
  async function handleDeleteCoupon() {
    //Api to delete coupon
    const response = 0;
    const preCoupon = coupon;
    setCoupon(response);
    setTotalCost((prev) => prev + preCoupon);
  }
  function filterVerifiedAds() {
    let newCustomerAds = props.customerAd;
    const newAds = newCustomerAds.advertisers.filter((x) => x.satus === AdvertiserStatus.Verified);
    newCustomerAds.advertisers = newAds;
    return newCustomerAds;
  }
  function sum() {
    return customerAd.advertisers.reduce((accum, product) => accum + product.price, 0);
  }

  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ 📊 Payment Check</title>
        <meta name="description" content="Advanced Instagram post management tool" />
        <meta
          name="keywords"
          content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/page/posts" />
        {/* Add other meta tags as needed */}
      </Head>
      {/* head for SEO */}
      <div className={styles.stepcontainer5}>
        <div className={styles.top}>
          <div className={styles.chartcolumnheader}>
            <div className={styles.adcharttitle}>type</div>
            <div className={styles.adcharttitle}>date & time</div>
            <div className={styles.adcharttitle}>Ad No.</div>
          </div>
          <div className={styles.chartcolumn}>
            <div className={styles.addetailcontentheader}>
              <span className={styles.day}>
                <AdsTypeComp adType={customerAd.adType} />
              </span>

              <span className={styles.day}>
                <TimeTypeComp timeType={customerAd.adTimeType} />
              </span>
            </div>
            <div className={styles.addetailcontentheader}>
              <div className={styles.date}>
                <span className={styles.day}>
                  {new DateObject({
                    date: customerAd.adTime,
                    calendar: initialzedTime().calendar,
                    locale: initialzedTime().locale,
                  }).format("YYYY")}
                </span>
                /
                <span className={styles.day}>
                  {new DateObject({
                    date: customerAd.adTime,
                    calendar: initialzedTime().calendar,
                    locale: initialzedTime().locale,
                  }).format("MM")}
                </span>
                /
                <span className={styles.day}>
                  {new DateObject({
                    date: customerAd.adTime,
                    calendar: initialzedTime().calendar,
                    locale: initialzedTime().locale,
                  }).format("DD")}
                </span>
                <br></br>
                <span className={styles.hour}>
                  {new DateObject({
                    date: customerAd.adTime,
                    calendar: initialzedTime().calendar,
                    locale: initialzedTime().locale,
                  }).format("hh")}
                </span>
                :
                <span className={styles.hour}>
                  {new DateObject({
                    date: customerAd.adTime,
                    calendar: initialzedTime().calendar,
                    locale: initialzedTime().locale,
                  }).format("mm A")}
                </span>
              </div>
            </div>
            <div className={styles.addetailcontentheader}>
              <div className={styles.span}>
                ( <span className={styles.day}>{customerAd.customerAdId}</span> )
              </div>
            </div>
          </div>
        </div>
        <div className={styles.downduble}>
          <div className={styles.downchild} style={{ maxHeight: "300px" }}>
            <div className={styles.chartcolumnheader}>
              <div className={styles.adcharttitle} style={{ maxWidth: "20px", marginLeft: "10px" }}>
                #
              </div>
              <div className={styles.adcharttitle} style={{ maxWidth: "100%" }}>
                Target Page
              </div>
              <div className={styles.adcharttitle} style={{ maxWidth: "115px", marginRight: "10px" }}>
                price
              </div>
            </div>

            {customerAd.advertisers.map((v) => (
              <div key={v.asvertiseId} className={styles.chartcolumn} style={{ maxHeight: "300px" }}>
                <div className={styles.addetailcontent} style={{ maxWidth: "20px", marginLeft: "10px" }}>
                  {customerAd.advertisers.indexOf(v) + 1}
                </div>
                <div className={styles.addetailcontent} style={{ maxWidth: "100%" }}>
                  {v.username}
                </div>
                <div
                  className={styles.addetailcontent}
                  style={{
                    alignItems: "flex-end",
                    maxWidth: "115px",
                    marginRight: "10px",
                  }}>
                  <PriceFormater
                    fee={v.price}
                    pricetype={PriceType.Toman}
                    className={PriceFormaterClassName.PostPrice}
                  />
                </div>
              </div>
            ))}
          </div>
          <div
            className={styles.downchild}
            style={{
              padding: "var(--padding-20)",
              gap: "var(--gap-20)",
              alignContent: "space-between",
            }}>
            <div className="headerandinput">
              <div className={styles.coupontitle}>COUPON CODE</div>
              <div className={styles.couponbox}>
                <InputText
                  className="textinputbox"
                  placeHolder="Insert Coupon"
                  handleInputChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setInputBox(e.currentTarget.value);
                  }}
                  maxLength={undefined}
                  value={inputBox}
                  name={""}
                />

                {coupon && (
                  <svg
                    onClick={handleDeleteCoupon}
                    viewBox="0 0 21 24"
                    className="stopButton"
                    style={{
                      height: "40px",
                      minWidth: "40px",
                      width: "40px",
                      padding: "var(--padding-10)",
                    }}>
                    <path
                      fill="var(--color-dark-red)"
                      d="M20 4h-4.8v-.7A2.7 2.7 0 0 0 12.5.6H7.8a2.7 2.7 0 0 0-2.7 2.7v.8H.2a.8.8 0 0 0 0 1.5h1.1V21A3.6 3.6 0 0 0 5 24.6h10.4A3.6 3.6 0 0 0 19 21V5.6h1A.8.8 0 1 0 20 4M6.7 3.4a1.2 1.2 0 0 1 1.2-1.2h4.7a1.2 1.2 0 0 1 1.2 1.2v.8H6.6ZM17.5 21a2 2 0 0 1-2.1 2.1H5A2 2 0 0 1 2.8 21V5.6h14.7ZM6.7 18.4V9.9a.8.8 0 1 1 1.5 0v8.5a1 1 0 0 1-.8.7 1 1 0 0 1-.7-.7m5.6.5-.2-.5V9.9a.8.8 0 1 1 1.5 0v8.5a1 1 0 0 1-.8.7z"
                    />
                  </svg>
                )}
                {!coupon && (
                  <svg
                    onClick={handleInsertCoupon}
                    className="saveButton"
                    style={{
                      height: "40px",
                      minWidth: "40px",
                      width: "40px",
                      padding: "var(--padding-10)",
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                    width="15 "
                    height="15"
                    viewBox="0 0 25 24"
                    fill="none">
                    <path
                      d="M24.17 14.64V6.14L18.04 0.01H16.24C14.54 0.01 12.84 0.01 11.07 0C9.57997 0.1 8.17997 0.72 7.08997 1.74C6.46997 2.3 5.97997 2.98 5.64997 3.75C4.22997 3.88 2.89997 4.48 1.85997 5.45C0.619973 6.49 -0.0700266 8.05 -2.65772e-05 9.66V18.41C0.0599734 20.05 0.789973 21.58 2.01997 22.66C3.02997 23.5 4.29997 23.97 5.60997 23.99H13.32C15.69 23.99 17.8 22.5 18.59 20.27C21.69 20.25 24.19 17.72 24.17 14.62V14.64ZM16.23 21.29C15.46 22.07 14.42 22.5 13.32 22.5H5.61997C4.65997 22.48 3.72997 22.14 2.98997 21.52C2.08997 20.73 1.54997 19.6 1.50997 18.4V9.67C1.44997 8.46 1.95997 7.3 2.89997 6.53C3.71997 5.77 4.77997 5.31 5.88997 5.22C7.57997 5.22 9.27997 5.23 10.99 5.24H12.17L17.41 10.48V17.04V18.37C17.42 19.46 16.99 20.51 16.22 21.29H16.23ZM18.9 18.75C18.9 18.62 18.94 18.49 18.94 18.36V9.85L12.81 3.73H11.01C9.79997 3.73 8.58997 3.73 7.35997 3.73C7.58997 3.4 7.85997 3.1 8.14997 2.83C8.96997 2.07 10.03 1.61 11.14 1.52C12.83 1.53 14.53 1.54 16.24 1.54H17.42L22.65 6.78V14.8C22.59 16.88 20.97 18.59 18.9 18.74V18.75ZM13.35 16.63C13.35 17.03 13.03 17.35 12.63 17.35H6.30997C5.90997 17.35 5.58997 17.03 5.58997 16.63C5.58997 16.23 5.90997 15.91 6.30997 15.91H12.63C13.03 15.91 13.35 16.23 13.35 16.63ZM13.35 12.4C13.35 12.8 13.03 13.12 12.63 13.12H6.30997C5.90997 13.12 5.58997 12.8 5.58997 12.4C5.58997 12 5.90997 11.68 6.30997 11.68H12.63C13.03 11.68 13.35 12 13.35 12.4Z"
                      fill="white"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div className={styles.priceparent}>
              <div className={styles.pricedetail}>
                <div className={styles.pricetitle}>
                  Order
                  <div className={styles.tag}>({props.customerAd.advertisers.length} pages) </div>
                </div>
                <div className={styles.pricenumber}>
                  +
                  <PriceFormater fee={sum()} pricetype={PriceType.Toman} className={PriceFormaterClassName.PostPrice} />
                </div>
              </div>
              <div className={styles.pricedetail}>
                <div className={styles.pricetitle}>
                  Tax
                  <div className={styles.tag}>({taxFactor}%) </div>
                </div>
                <div className={styles.pricenumber}>
                  +
                  <PriceFormater
                    fee={(sum() * taxFactor) / 100}
                    pricetype={PriceType.Toman}
                    className={PriceFormaterClassName.PostPrice}
                  />
                </div>
              </div>
              <div className={styles.pricedetail}>
                <div className={styles.pricetitle}>
                  Coupon
                  <div className={styles.tag}>(10%) </div>
                </div>
                <div
                  className={styles.pricenumber}
                  style={{
                    color: "var(--color-dark-red)",
                  }}>
                  -{" "}
                  <PriceFormater
                    fee={coupon}
                    pricetype={PriceType.Toman}
                    className={PriceFormaterClassName.PostPriceRed}
                  />
                </div>
              </div>
            </div>
            <div className={styles.totalprice} style={{ height: "30px", justifyContent: "end" }}>
              <div className={styles.pricedetail}>
                <div
                  className={styles.tag}
                  style={{
                    fontWeight: "var(--weight-800)",
                    fontSize: "var(--font-16)",
                  }}>
                  Total cost
                </div>
                <div
                  className={styles.pricenumber}
                  style={{
                    color: "var(--color-dark-blue)",
                    fontWeight: "var(--weight-800)",
                    fontSize: "var(--font-16)",
                  }}>
                  <PriceFormater
                    fee={totalCost}
                    pricetype={PriceType.Toman}
                    className={PriceFormaterClassName.PostPriceBlue}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Payment;
