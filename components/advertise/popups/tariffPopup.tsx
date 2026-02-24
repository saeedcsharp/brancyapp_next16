import PriceFormater, { PriceFormaterClassName, PriceType } from "brancy/components/priceFormater";
import { unixToFormattedDate } from "brancy/helper/formatTimeAgo";
import { IInfluencerTeriffe } from "brancy/models/market/myLink";
import styles from "./adPopupStyle.module.css";
export default function TarrifPopup({ teriif, removeMask }: { teriif: IInfluencerTeriffe; removeMask: () => void }) {
  return (
    <>
      <>
        <div className="frameParent">
          <div className="headerChild" title="↕ Resize the Card">
            <div className="circle"></div>
            <div className="Title">tariff</div>
          </div>
        </div>
        <div className={styles.all}>
          <div className={styles.section2}>
            <div className={styles.section}>
              <div className={styles.headerparent} style={{ justifyContent: "center" }}>
                <div className={styles.headertitle2}>
                  <strong>only Today</strong>
                </div>
              </div>
              <div className={styles.explain1}>
                Advertising price tariff only for <strong>today</strong>
              </div>
            </div>
            <div className={styles.content}>
              <div className={styles.price}>
                <div className={styles.priceheader}>Post</div>

                <div className={styles.post}>
                  <PriceFormater
                    fee={teriif.today12HPost}
                    pricetype={PriceType.Dollar}
                    className={PriceFormaterClassName.PostPrice}
                  />
                  <div className={styles.halfday}>12 HOURS</div>
                </div>

                <div className={styles.story}>
                  <PriceFormater
                    fee={teriif.today24HPost}
                    pricetype={PriceType.Dollar}
                    className={PriceFormaterClassName.PostPrice}
                  />
                  <div className={styles.fullday}>24 HOURS</div>
                </div>
              </div>

              <div
                className={styles.price}
                style={{
                  borderLeft: "1px solid var(--content-box)",
                }}>
                <div className={styles.priceheader}>Story</div>
                <div className={styles.post}>
                  <PriceFormater
                    fee={teriif.today12HStory}
                    pricetype={PriceType.Dollar}
                    className={PriceFormaterClassName.PostPrice}
                  />
                  <div className={styles.halfday}>12 HOURS</div>
                </div>
                <div className={styles.story}>
                  <PriceFormater
                    fee={teriif.today24HStory}
                    pricetype={PriceType.Dollar}
                    className={PriceFormaterClassName.PostPrice}
                  />
                  <div className={styles.fullday}>24 HOURS</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section2}>
            <div className={styles.section}>
              <div className={styles.headerparent} style={{ justifyContent: "center" }}>
                <div className={styles.headertitle2}>
                  <strong>Basic</strong> (other days)
                </div>
              </div>
              <div className={styles.explain1}>
                Advertising price tariff for <strong>other days</strong>
              </div>
            </div>
            <div className={styles.content}>
              <div className={styles.price}>
                <div className={styles.priceheader}>Post</div>
                <div className={styles.post}>
                  <PriceFormater
                    fee={teriif.basic12HPost}
                    pricetype={PriceType.Dollar}
                    className={PriceFormaterClassName.PostPrice}
                  />
                  <div className={styles.halfday}>12 HOURS</div>
                </div>
                <div className={styles.story}>
                  <PriceFormater
                    fee={teriif.basic24HPost}
                    pricetype={PriceType.Dollar}
                    className={PriceFormaterClassName.PostPrice}
                  />
                  <div className={styles.fullday}>24 HOURS</div>
                </div>
              </div>
              <div
                className={styles.price}
                style={{
                  borderLeft: "1px solid var(--content-box)",
                }}>
                <div className={styles.priceheader}>Story</div>
                <div className={styles.post}>
                  <PriceFormater
                    fee={teriif.basic12HStory}
                    pricetype={PriceType.Dollar}
                    className={PriceFormaterClassName.PostPrice}
                  />
                  <div className={styles.halfday}>12 HOURS</div>
                </div>
                <div className={styles.story}>
                  <PriceFormater
                    fee={teriif.basic24HStory}
                    pricetype={PriceType.Dollar}
                    className={PriceFormaterClassName.PostPrice}
                  />
                  <div className={styles.fullday}>24 HOURS</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section2}>
            <div className={styles.section}>
              <div className={styles.headerparent} style={{ justifyContent: "center" }}>
                <div className={styles.headertitle2}>
                  <strong>Campaign</strong>
                </div>
              </div>
              <div className={styles.explain1}>
                Advertising price tariff for <strong> Campaign</strong>
              </div>
            </div>
            <div className={styles.content}>
              <div className={styles.price}>
                <div className={styles.priceheader}>Post</div>
                <div className={styles.post}>
                  <PriceFormater
                    fee={teriif.campaign24HPost}
                    pricetype={PriceType.Dollar}
                    className={PriceFormaterClassName.PostPrice}
                  />
                  <div className={styles.fullday}>24 HOURS</div>
                </div>
              </div>
              <div
                className={styles.price}
                style={{
                  borderLeft: "1px solid var(--content-box)",
                }}>
                <div className={styles.priceheader}>Story</div>
                <div className={styles.post}>
                  <PriceFormater
                    fee={teriif.campaign24HStory}
                    pricetype={PriceType.Dollar}
                    className={PriceFormaterClassName.PostPrice}
                  />
                  <div className={styles.fullday}>24 HOURS</div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.explain1}>
            last Modified : <strong>{unixToFormattedDate(teriif.lastUpdate)}</strong>
          </div>
        </div>
      </>
    </>
  );
}
