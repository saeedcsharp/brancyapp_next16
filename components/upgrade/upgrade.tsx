import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { GetServerResult, MethodType } from "saeed/models/IResult";
import { NotifType, notify, ResponseType } from "../notifications/notificationBox";
import Loading from "../notOk/loading";
import PriceFormater, { PriceFormaterClassName, PriceType } from "../priceFormater";
import styles from "./upgrade.module.css";
export interface PaymentInfo {
  accountType: number;
  price: number;
  id: number;
  packageMonthDuration: number;
  priceType: PriceType;
  description: string;
  minFollowerCount: number;
  maxFollowerCount: number;
}
function Upgrade(props: { removeMask: () => void }) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [packages, setPackages] = useState<PaymentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  async function getPSGInfo() {
    try {
      const res = await GetServerResult<boolean, PaymentInfo[]>(
        MethodType.get,
        session,
        "Instagramer" + "/PSG/GetPackagePrices"
      );
      if (res.succeeded) {
        setPackages(res.value);
        setLoading(false);
      } else notify(res.info.responseType, NotifType.Success);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleRedirectToPayment(month: number) {
    try {
      const res = await GetServerResult<boolean, string>(
        MethodType.get,
        session,
        "Instagramer" + "/PSG/GetPackageRedirectUrl",
        null,
        [{ key: "monthCount", value: month.toString() }]
      );
      if (res.succeeded) {
        router.push(res.value);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  useEffect(() => {
    if (!session) return;
    getPSGInfo();
  }, [session]);
  return (
    <>
      <div
        className="dialogBg"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <div className={styles.popupsignup}>
          <div className="headerandinput" style={{ alignItems: "center" }}>
            <svg
              onClick={props.removeMask}
              style={{ alignSelf: "end" }}
              className={styles.closebtn}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16">
              <path
                d="M15.3 14.2a.8.8 0 1 1-1 1L8 9.2l-6.2 6.2a.8.8 0 1 1-1-1l6-6.4L.7 1.8a.8.8 0 1 1 1-1l6.3 6L14.2.7a.8.8 0 1 1 1 1L9.2 8z"
                fill="var(--text-h1)"
              />
            </svg>
            {loading && <Loading />}
            {!loading && (
              <>
                <div className="title">Upgrade</div>
                <div className={styles.packageList}>
                  {packages.map((pkg) => (
                    <div
                      onClick={() => handleRedirectToPayment(pkg.packageMonthDuration)}
                      key={pkg.id}
                      className={styles.packageCard}>
                      <div className={styles.packageHeader}>
                        <h3 className={styles.packageTitle}>{pkg.description}</h3>
                        <span className={styles.packagePrice}>
                          <PriceFormater
                            pricetype={pkg.priceType}
                            fee={pkg.price}
                            className={PriceFormaterClassName.PostPrice}
                          />
                        </span>
                      </div>
                      <div className={styles.packageDetails}>
                        <span>
                          Duration: {pkg.packageMonthDuration} {pkg.packageMonthDuration > 1 ? "months" : "month"}
                        </span>
                        <span>
                          Followers: {pkg.minFollowerCount} - {pkg.maxFollowerCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* <svg fill="none" height="100px" viewBox="0 0 160 116">
              <path
                fill="var(--color-dark-blue60)"
                d="M153.3 38a6.7 6.7 0 1 1 0 13.4H115a6.7 6.7 0 1 1 0 13.4h21a6.7 6.7 0 1 1 0 13.4h-9.7c-4.7 0-8.5 3-8.5 6.7q0 3.7 5.8 6.7a6.7 6.7 0 1 1 0 13.4H44a6.7 6.7 0 1 1 0-13.4H6.7a6.7 6.7 0 1 1 0-13.4H45a6.7 6.7 0 1 0 0-13.4H21a6.7 6.7 0 1 1 0-13.4h38.4a6.7 6.7 0 1 1 0-13.4zm0 26.8a6.7 6.7 0 1 1 0 13.4 6.7 6.7 0 0 1 0-13.4"
              />
              <path
                fill="var(--background-root)"
                d="M82.5 110a41.5 41.5 0 1 0 0-83 41.5 41.5 0 0 0 0 83"
              />
              <path
                stroke="var(--color-dark-blue60)"
                strokeWidth="2"
                d="M111 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              />
              <path
                fill="var(--color-dark-blue60)"
                d="M141 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6M39 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6"
              />
              <path
                fill="var(--color-dark-blue)"
                d="M122.6 8q2-.1 3.8 1 2 1 2.5 3.3a4 4 0 0 1-1 3.7l-2.4 2.2-.7.6q-.7.7-.7 1.7-.2 1.2-1.4 1.4c-1.3.3-2.4-.5-2.4-1.7q-.1-1.6.7-2.8l1.5-1.7 1.7-1.5q.8-.6.4-1.7-.5-1-1.5-1H122q-.9 0-1.3.9l-.6 1.3q-.2.7-.8 1.2c-.7.5-2 .4-2.6-.2q-1-1-.6-2.4a6 6 0 0 1 3-3.5q1.8-.8 3.5-.8m0 1q-1.8-.1-3.5 1-1.5 1-2 2.6v1q0 .7 1 .7a1 1 0 0 0 .9-.5l.1-.3.5-1.2q.5-1.4 2.2-1.8 1.5-.2 3 .6 1 1 .8 2.6-.3.9-1 1.6l-2.2 1.9q-1.3 1.2-1.2 3 0 .5.5.7 1 .5 1.4-.6.3-1.6 1.6-2.7l2.2-2a3.4 3.4 0 0 0 .8-3.9q-.4-1.2-1.6-1.9-1.5-.9-3.4-.9M124 25a2 2 0 0 1-2 2c-1 0-2-.8-2-2s1-2 2-2a2 2 0 0 1 2 2m-1 0a1 1 0 0 0-1-1.1q-1 .1-1 1 0 1.2 1 1.2t1-1M24.6 25q2-.1 3.8 1 2 1 2.5 3.3a4 4 0 0 1-1 3.7l-2.4 2.2-.7.6q-.7.7-.7 1.7-.3 1.2-1.4 1.5c-1.3.2-2.4-.6-2.4-1.8q-.1-1.5.7-2.8l1.5-1.7 1.7-1.5q.8-.6.4-1.7-.4-1-1.5-1H24q-.9 0-1.3.9l-.6 1.3q-.2.7-.8 1.2c-.7.5-2 .4-2.6-.2q-1-1-.6-2.4a6 6 0 0 1 3-3.5q1.8-.9 3.5-.8m0 1q-1.8-.1-3.5 1-1.5 1-2 2.6v1q0 .6 1 .7a1 1 0 0 0 .9-.5l.1-.3.5-1.2q.5-1.4 2.2-1.8 1.5-.2 3 .6 1 1 .8 2.6-.3.9-1 1.6l-2.2 1.9q-1.3 1.2-1.2 3 0 .5.5.7 1 .5 1.4-.6.3-1.6 1.6-2.7l2.2-2a3.4 3.4 0 0 0 .8-3.9q-.4-1.2-1.6-1.9-1.5-.9-3.4-.9M26 42a2 2 0 0 1-2 2c-1 0-2-.8-2-2s1-2 2-2a2 2 0 0 1 2 2m-1 0a1 1 0 0 0-1-1.1q-1 .1-1 1 0 1.2 1 1.2t1-1M83.8 38q5.2-.1 9.6 2.3 5.2 3 6.4 8.7 1 5.5-2.7 9.5-2.9 3-6.1 5.8l-1.6 1.5C88.2 67 88 68.6 87.6 70q-.6 3.2-3.6 4c-3.3.7-6-1.4-6.2-4.6q-.1-4 1.8-7.1 1.6-2.5 4-4.3 2.2-1.9 4.2-3.9 2-1.9 1-4.3-1-2.5-3.7-2.9h-2.9q-2.2.4-3.3 2.4l-1.5 3.4a7 7 0 0 1-2 3 5.4 5.4 0 0 1-6.6-.2c-2-1.9-2-4-1.4-6.3q1.8-6.2 7.7-9.1a18 18 0 0 1 8.7-2m.1 2.4q-5-.1-9 2.6-4.1 2.5-5.2 7a5 5 0 0 0 0 2.2q.4 1.8 2.4 2 1.6 0 2.4-1.3l.4-.9 1.2-2.9c1.2-2.4 2.8-4.2 5.7-4.7 2.6-.4 5.2-.2 7.3 1.7q3.1 2.6 2.3 6.4a8 8 0 0 1-2.8 4.2l-5.3 4.9a9 9 0 0 0-3 7.7q0 1.3 1.3 2c1.3.5 3.2.4 3.5-1.7a11 11 0 0 1 4-7q2.9-2.4 5.5-4.9a9 9 0 0 0 2.2-10 10 10 0 0 0-4.1-5 16 16 0 0 0-8.8-2.3"
              />
              <path
                fill="var(--color-dark-blue)"
                d="m127 55.8.1-.3.7 2.5a47 47 0 0 1-9.1 39.8q-.9.9-1.7.3t0-1.7q1.6-2 3-4.2a45 45 0 0 0-1.3-49 44.3 44.3 0 1 0-15.6 64.6l1-.6q1-.3 1.5.6a1 1 0 0 1-.5 1.4q-3 1.8-6.4 2.9l-6 1.8a47 47 0 0 1-48.9-19.6l-2.7-4.8a40 40 0 0 1-5-18.2 48 48 0 0 1 1-13.3 43 43 0 0 1 11.5-21.5 46 46 0 0 1 43-13.6A47 47 0 0 1 127 54.7zM88 85c0 2.9-2.1 5-5 5-2.7 0-5-2-5-5s2.4-5 5-5c2.9 0 5 2 5 5m-2.3 0c0-1.5-1-2.7-2.5-2.7a3 3 0 0 0-3 2.6c0 2 1.4 2.8 2.8 2.8s2.8-.8 2.7-2.6m22.5 22.9q-1 0-1.1-.8t.4-1.4l2.4-2 4.1-4.3q1-1 1.7-.2t0 1.9q-3.1 3.8-7 6.6z"
              />
            </svg> */}

            {/* <div className="title">are you sure !?</div>
            <div className="explain">
              you are attempting to <strong>Upgrade</strong> your account
            </div> */}
          </div>
          {/* <button className="saveButton">Upgrade</button> */}
        </div>
      </div>
    </>
  );
}

export default Upgrade;
