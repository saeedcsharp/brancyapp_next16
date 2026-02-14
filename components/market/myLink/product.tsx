import { ChangeEvent, useState } from "react";
import InputText from "saeed/components/design/inputText";
import { IProducts } from "saeed/models/market/myLink";
import styles from "./mylink.module.css";

const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const Products = (props: { data: IProducts | null }) => {
  const [isContentVisible, setIsContentVisible] = useState(true);

  const toggleContentVisibility = () => {
    setIsContentVisible((prev) => !prev);
  };
  function handleSearchPeopleInputChange(e: ChangeEvent<HTMLInputElement>): void {
    throw new Error("Function not implemented.");
  }

  return (
    <>
      {props.data && (
        <div
          key={"product"}
          id="product"
          className={styles.all}
          style={{ backgroundColor: "var(--color-dark-blue10)" }}>
          <div className={styles.header} onClick={toggleContentVisibility}>
            <div className={`${styles.squre} ${!isContentVisible ? styles.closed : ""}`}></div>
            <div className={styles.headertext}>
              our
              <div className={styles.headertextblue}>products</div>
            </div>
            <div className={styles.line}></div>
          </div>

          <div className={`${styles.content} ${isContentVisible ? styles.show : ""}`}>
            <div className={styles.product}>
              <div className={styles.searchContainer}>
                <InputText
                  style={{
                    maxWidth: "250px",
                    borderRadius: " var(--br8) 0px 0px var(--br8)",
                  }}
                  className="textinputbox"
                  handleInputChange={handleSearchPeopleInputChange}
                  placeHolder="Search product or PID"
                  value={""}
                  maxLength={undefined}
                  name={""}
                />
                <div className={styles.searchbtn}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M12.5201 11.0201H11.7301L11.4501 10.7501C13.7901 8.02008 13.4801 3.91008 10.7501 1.57008C8.02008 -0.769915 3.91008 -0.459916 1.57008 2.27008C-0.769915 5.00008 -0.459916 9.11008 2.27008 11.4501C4.71008 13.5401 8.31009 13.5401 10.7501 11.4501L11.0201 11.7301V12.5201L13.7401 15.2101L15.2301 13.7201L12.5201 11.0201ZM6.52008 11.0201C4.03008 11.0201 2.02008 9.01008 2.02008 6.52008C2.02008 4.03008 4.03008 2.02008 6.52008 2.02008C9.01008 2.02008 11.0201 4.03008 11.0201 6.52008C11.0201 9.00008 9.01008 11.0201 6.53008 11.0201C6.53008 11.0201 6.53008 11.0201 6.52008 11.0201Z"
                      fill="var(--color-ffffff)"
                    />
                  </svg>
                </div>
              </div>

              <div className={styles.productContainer}>
                <div className={styles.productitem}>
                  <img
                    loading="lazy"
                    decoding="async"
                    className={styles.productimage}
                    alt="review rate"
                    src="/post.png"
                  />
                  <div className={styles.productname}>Product name one</div>
                  <div className={styles.pricesection}>
                    <div className={styles.price}>
                      <div className={styles.priceold}>15.555.555 تومان</div>
                      <div className={styles.discountprice}>5 %</div>
                    </div>
                    <div className={styles.price}>
                      <div className={styles.pricenew}>15.555.555 تومان</div>
                    </div>
                  </div>
                </div>
                <div className={styles.productitem}>
                  <img
                    loading="lazy"
                    decoding="async"
                    className={styles.productimage}
                    alt="review rate"
                    src="/post.png"
                  />
                  <div className={styles.productname}>Product name one</div>
                  <div className={styles.pricesection}>
                    <div className={styles.price}>
                      <div className={styles.priceold}>15.555.555 تومان</div>
                      <div className={styles.discountprice}>5 %</div>
                    </div>
                    <div className={styles.price}>
                      <div className={styles.pricenew}>15.555.555 تومان</div>
                    </div>
                  </div>
                </div>

                <div className={styles.productitem}>
                  <img
                    loading="lazy"
                    decoding="async"
                    className={styles.productimage}
                    alt="review rate"
                    src="/post.png"
                  />
                  <div className={styles.productname}>Product name one</div>
                  <div className={styles.pricesection}>
                    <div className={styles.price}>
                      <div className={styles.priceold}>15.555.555 تومان</div>
                      <div className={styles.discountprice}>5 %</div>
                    </div>
                    <div className={styles.price}>
                      <div className={styles.pricenew}>15.555.555 تومان</div>
                    </div>
                  </div>
                </div>

                <div className={styles.productitem}>
                  <img
                    loading="lazy"
                    decoding="async"
                    className={styles.productimage}
                    alt="review rate"
                    src="/post.png"
                  />
                  <div className={styles.productname}>Product name one</div>
                  <div className={styles.pricesection}>
                    <div className={styles.price}>
                      <div className={styles.priceold}>15.555.555 تومان</div>
                      <div className={styles.discountprice}>5 %</div>
                    </div>
                    <div className={styles.price}>
                      <div className={styles.pricenew}>15.555.555 تومان</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.showallproduct}>Show All Product ↗️</div>

              <div className={styles.couponsection}>
                Discount Code
                <div className={styles.couponcode}>
                  3hj498UTR3JF
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    style={{ width: "15px", cursor: "pointer" }}>
                    <path
                      fill="var(--color-ffffff)"
                      d="M24.2 14.7V6.2L18 .1h-6.9a7 7 0 0 0-4 1.7 6 6 0 0 0-1.4 2 6 6 0 0 0-3.8 1.7A5 5 0 0 0 0 9.7v8.8a6 6 0 0 0 2 4.2A6 6 0 0 0 5.6 24h7.7a6 6 0 0 0 5.3-3.7 5.6 5.6 0 0 0 5.6-5.6m-8 6.6a4 4 0 0 1-2.9 1.2H5.7a4 4 0 0 1-2.6-1 4 4 0 0 1-1.5-3V9.7A4 4 0 0 1 3 6.6a5 5 0 0 1 3-1.3h6.3l5.2 5.2v7.9a4 4 0 0 1-1.2 3m2.7-2.5V10l-6-6.1H7.5l.8-1a5 5 0 0 1 3-1.3h6.2l5.3 5.3c0 9-.5 10-1.2 10.8a4 4 0 0 1-2.6 1.2m-5.5-2.1a1 1 0 0 1-.8.7H6.4a.7.7 0 1 1 0-1.5h6.3a.7.7 0 0 1 .8.8m0-4.3a.7.7 0 0 1-.8.8H6.4a.7.7 0 1 1 0-1.5h6.3a1 1 0 0 1 .8.7"
                      data-name="Path 2641"
                    />
                  </svg>
                </div>
                <div
                  className={styles.timer}
                  style={{
                    height: "40px",
                    width: "150px",
                    border: "1px solid red",
                  }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Products;
