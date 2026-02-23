import { ChangeEvent } from "react";
import InputText from "brancy/components/design/inputText";
import styles from "./step2-cart.module.css";
const CustomerAdscart = () => {
  //  return <Soon />;
  function setInputBox(value: string) {
    throw new Error("Function not implemented.");
  }

  return (
    <>
      <div className={styles.headerTab}>
        <div className={styles.iconbox}>
          <img className={styles.icon} alt="back to user list" src="/back-blue.svg" />
        </div>

        <div className={styles.pageheaders}>
          <div className={styles.iconbox}>
            <img className={styles.icon} alt="show search menu" src="/search-2.svg" />
          </div>
          {/* <div className={styles.iconbox}>
            <img loading="lazy"
decoding="async" className={styles.icon} alt="show my cart" src="/cart.svg" />
            <div className={styles.reddot}></div>
          </div> */}
          <div className={styles.iconbox}>
            <img className={styles.icon} alt="show all notification" src="/group-3128.svg" />
            <div className={styles.reddot}></div>
          </div>
          <img
            loading="lazy"
            decoding="async"
            className={styles.ProfileIcon}
            alt="instagram profile picture"
            src={"/no-profile.svg"}
          />
        </div>
      </div>

      <div className={styles.pinContainer}>
        <div className={styles.left}>
          <div className={styles.header}>
            <div className={styles.headertitle}>order list</div>
            <div className={styles.headercounter}>(3/5)</div>
            <div className={styles.headerline}></div>
          </div>

          <div className={styles.selectedlist}>
            <div className={styles.selectedpage}>
              <div className={styles.profile}>
                <img
                  loading="lazy"
                  decoding="async"
                  className={styles.profileimage}
                  src="/no-profile.svg"
                  alt="profile picture"
                />
                <div className={styles.profiledetail}>
                  <div className={styles.name}>ahoora niazi</div>
                  <div className={styles.username}>@ahoora.niazi</div>
                </div>
              </div>
              <div className={styles.hourkind}>
                <svg className={styles.halfday} width="30" height="30" viewBox="0 0 30 30">
                  <path d="M27.427,7.637a2.88,2.88,0,0,0,.314-.259,3.188,3.188,0,0,0,0-4.5L25.811.952a3.136,3.136,0,0,0-5.049.769A13.607,13.607,0,0,1,27.427,7.637Z" />
                  <path d="M7.907,1.721A13.622,13.622,0,0,0,1.242,7.638a3.151,3.151,0,0,1-.314-.259,3.19,3.19,0,0,1,0-4.5L2.859.952a3.2,3.2,0,0,1,4.5,0A3.148,3.148,0,0,1,7.907,1.721Z" />
                  <path d="M13.207,18.739V20h6.348V18.415H15.938l1.936-1.824a6.175,6.175,0,0,0,.888-1,2.524,2.524,0,0,0,.408-.84,3.177,3.177,0,0,0,.108-.816,2.2,2.2,0,0,0-.4-1.32,2.457,2.457,0,0,0-1.092-.852,3.96,3.96,0,0,0-1.632-.312,4.5,4.5,0,0,0-1.992.42,3.312,3.312,0,0,0-1.344,1.14l1.416.912a1.912,1.912,0,0,1,.756-.636,2.382,2.382,0,0,1,.984-.2,1.54,1.54,0,0,1,1,.276.9.9,0,0,1,.348.768,1.4,1.4,0,0,1-.072.42,1.775,1.775,0,0,1-.24.5,3.4,3.4,0,0,1-.564.624Z" />
                  <path d="M9.875,13.159V20h1.944V11.6H8.2v1.56Z" />
                  <path d="M14.131,2.376A13.209,13.209,0,0,1,24.43,23.9l2.505,4.033a1.514,1.514,0,0,1-1.992,1.954l-4.29-2.751c-.007-.007-.015-.016-.015-.024a13.2,13.2,0,0,1-13,0l-.014.023-4.29,2.751a1.513,1.513,0,0,1-1.99-1.954l2.5-4.033a13.218,13.218,0,0,1,10.3-21.524ZM7.769,25.119a11.449,11.449,0,1,0-4.226-5.142A11.488,11.488,0,0,0,7.769,25.119Z" />
                </svg>

                <svg className={styles.fulday} width="30" height="30" viewBox="0 0 30 30">
                  <path d="M22.456,5.313a13.246,13.246,0,0,0-8.324-2.936l.013,0A13.211,13.211,0,0,0,3.846,23.9l-2.5,4.033a1.514,1.514,0,0,0,1.99,1.954l4.29-2.751.014-.023a13.2,13.2,0,0,0,13,0c0,.007.009.016.015.024l4.29,2.751a1.513,1.513,0,0,0,1.992-1.954L24.43,23.9A13.2,13.2,0,0,0,22.456,5.313ZM14.144,27.05a11.483,11.483,0,1,1,4.391-.872A11.488,11.488,0,0,1,14.144,27.05Z" />
                  <path d="M1.242,7.638A13.622,13.622,0,0,1,7.907,1.721,3.148,3.148,0,0,0,7.361.952a3.2,3.2,0,0,0-4.5,0L.928,2.88a3.19,3.19,0,0,0,0,4.5A3.151,3.151,0,0,0,1.242,7.638Z" />
                  <path d="M27.427,7.637a2.88,2.88,0,0,0,.314-.259,3.188,3.188,0,0,0,0-4.5L25.811.952a3.136,3.136,0,0,0-5.049.769A13.607,13.607,0,0,1,27.427,7.637Z" />
                  <path d="M13.732,18.415V20H7.384v-1.26l3.24-3.06a3.509,3.509,0,0,0,.7-.84,1.575,1.575,0,0,0,.18-.708.9.9,0,0,0-.348-.768,1.54,1.54,0,0,0-1-.276,2.247,2.247,0,0,0-1,.216,1.859,1.859,0,0,0-.744.624L7,13.015a3.279,3.279,0,0,1,1.356-1.14,4.474,4.474,0,0,1,1.98-.42,3.96,3.96,0,0,1,1.632.312,2.424,2.424,0,0,1,1.092.864,2.184,2.184,0,0,1,.4,1.308,2.929,2.929,0,0,1-.288,1.284,4.943,4.943,0,0,1-1.116,1.368L10.12,18.415Z" />
                  <path d="M22.109,18.235H20.741V20h-1.9V18.235H14.321V16.927l3.96-5.328h2.04l-3.672,5.052H18.9V15.079h1.836v1.572h1.368Z" />
                </svg>
              </div>
              <div className={styles.price}>23.222.000</div>

              <svg className={styles.delete} width="21" height="24" viewBox="0 0 21 24">
                <path
                  d="M283.092,28.052h-4.863v-.715a2.721,2.721,0,0,0-2.713-2.713H270.8a2.721,2.721,0,0,0-2.713,2.713v.716h-4.863a.754.754,0,0,0,0,1.508h1.1V45a3.637,3.637,0,0,0,3.628,3.627h10.4A3.637,3.637,0,0,0,281.989,45V29.559h1.1a.753.753,0,1,0,0-1.507ZM269.6,27.336a1.208,1.208,0,0,1,1.206-1.205h4.712a1.208,1.208,0,0,1,1.205,1.205v.716H269.6ZM280.481,45a2.129,2.129,0,0,1-2.121,2.122h-10.4A2.129,2.129,0,0,1,265.839,45V29.559h14.647Zm-10.8-2.634V33.877a.754.754,0,1,1,1.508,0v8.484a.752.752,0,0,1-.751.753h0A.758.758,0,0,1,269.68,42.362Zm5.61.53a.741.741,0,0,1-.22-.533V33.877a.754.754,0,1,1,1.508,0v8.484a.752.752,0,0,1-.754.753h0A.744.744,0,0,1,275.29,42.892Z"
                  transform="translate(-263 -24)"
                />
              </svg>
            </div>
            <div className={styles.selectedpage}>
              <div className={styles.profile}>
                <img
                  loading="lazy"
                  decoding="async"
                  className={styles.profileimage}
                  src="/no-profile.svg"
                  alt="profile picture"
                />
                <div className={styles.profiledetail}>
                  <div className={styles.name}>ahoora niazi</div>
                  <div className={styles.username}>@ahoora.niazi</div>
                </div>
              </div>
              <div className={styles.hourkind}>
                <svg className={styles.halfday} width="30" height="30" viewBox="0 0 30 30">
                  <path d="M27.427,7.637a2.88,2.88,0,0,0,.314-.259,3.188,3.188,0,0,0,0-4.5L25.811.952a3.136,3.136,0,0,0-5.049.769A13.607,13.607,0,0,1,27.427,7.637Z" />
                  <path d="M7.907,1.721A13.622,13.622,0,0,0,1.242,7.638a3.151,3.151,0,0,1-.314-.259,3.19,3.19,0,0,1,0-4.5L2.859.952a3.2,3.2,0,0,1,4.5,0A3.148,3.148,0,0,1,7.907,1.721Z" />
                  <path d="M13.207,18.739V20h6.348V18.415H15.938l1.936-1.824a6.175,6.175,0,0,0,.888-1,2.524,2.524,0,0,0,.408-.84,3.177,3.177,0,0,0,.108-.816,2.2,2.2,0,0,0-.4-1.32,2.457,2.457,0,0,0-1.092-.852,3.96,3.96,0,0,0-1.632-.312,4.5,4.5,0,0,0-1.992.42,3.312,3.312,0,0,0-1.344,1.14l1.416.912a1.912,1.912,0,0,1,.756-.636,2.382,2.382,0,0,1,.984-.2,1.54,1.54,0,0,1,1,.276.9.9,0,0,1,.348.768,1.4,1.4,0,0,1-.072.42,1.775,1.775,0,0,1-.24.5,3.4,3.4,0,0,1-.564.624Z" />
                  <path d="M9.875,13.159V20h1.944V11.6H8.2v1.56Z" />
                  <path d="M14.131,2.376A13.209,13.209,0,0,1,24.43,23.9l2.505,4.033a1.514,1.514,0,0,1-1.992,1.954l-4.29-2.751c-.007-.007-.015-.016-.015-.024a13.2,13.2,0,0,1-13,0l-.014.023-4.29,2.751a1.513,1.513,0,0,1-1.99-1.954l2.5-4.033a13.218,13.218,0,0,1,10.3-21.524ZM7.769,25.119a11.449,11.449,0,1,0-4.226-5.142A11.488,11.488,0,0,0,7.769,25.119Z" />
                </svg>

                <svg className={styles.fulday} width="30" height="30" viewBox="0 0 30 30">
                  <path d="M22.456,5.313a13.246,13.246,0,0,0-8.324-2.936l.013,0A13.211,13.211,0,0,0,3.846,23.9l-2.5,4.033a1.514,1.514,0,0,0,1.99,1.954l4.29-2.751.014-.023a13.2,13.2,0,0,0,13,0c0,.007.009.016.015.024l4.29,2.751a1.513,1.513,0,0,0,1.992-1.954L24.43,23.9A13.2,13.2,0,0,0,22.456,5.313ZM14.144,27.05a11.483,11.483,0,1,1,4.391-.872A11.488,11.488,0,0,1,14.144,27.05Z" />
                  <path d="M1.242,7.638A13.622,13.622,0,0,1,7.907,1.721,3.148,3.148,0,0,0,7.361.952a3.2,3.2,0,0,0-4.5,0L.928,2.88a3.19,3.19,0,0,0,0,4.5A3.151,3.151,0,0,0,1.242,7.638Z" />
                  <path d="M27.427,7.637a2.88,2.88,0,0,0,.314-.259,3.188,3.188,0,0,0,0-4.5L25.811.952a3.136,3.136,0,0,0-5.049.769A13.607,13.607,0,0,1,27.427,7.637Z" />
                  <path d="M13.732,18.415V20H7.384v-1.26l3.24-3.06a3.509,3.509,0,0,0,.7-.84,1.575,1.575,0,0,0,.18-.708.9.9,0,0,0-.348-.768,1.54,1.54,0,0,0-1-.276,2.247,2.247,0,0,0-1,.216,1.859,1.859,0,0,0-.744.624L7,13.015a3.279,3.279,0,0,1,1.356-1.14,4.474,4.474,0,0,1,1.98-.42,3.96,3.96,0,0,1,1.632.312,2.424,2.424,0,0,1,1.092.864,2.184,2.184,0,0,1,.4,1.308,2.929,2.929,0,0,1-.288,1.284,4.943,4.943,0,0,1-1.116,1.368L10.12,18.415Z" />
                  <path d="M22.109,18.235H20.741V20h-1.9V18.235H14.321V16.927l3.96-5.328h2.04l-3.672,5.052H18.9V15.079h1.836v1.572h1.368Z" />
                </svg>
              </div>
              <div className={styles.price}>23.222.000</div>

              <svg className={styles.delete} width="21" height="24" viewBox="0 0 21 24">
                <path
                  d="M283.092,28.052h-4.863v-.715a2.721,2.721,0,0,0-2.713-2.713H270.8a2.721,2.721,0,0,0-2.713,2.713v.716h-4.863a.754.754,0,0,0,0,1.508h1.1V45a3.637,3.637,0,0,0,3.628,3.627h10.4A3.637,3.637,0,0,0,281.989,45V29.559h1.1a.753.753,0,1,0,0-1.507ZM269.6,27.336a1.208,1.208,0,0,1,1.206-1.205h4.712a1.208,1.208,0,0,1,1.205,1.205v.716H269.6ZM280.481,45a2.129,2.129,0,0,1-2.121,2.122h-10.4A2.129,2.129,0,0,1,265.839,45V29.559h14.647Zm-10.8-2.634V33.877a.754.754,0,1,1,1.508,0v8.484a.752.752,0,0,1-.751.753h0A.758.758,0,0,1,269.68,42.362Zm5.61.53a.741.741,0,0,1-.22-.533V33.877a.754.754,0,1,1,1.508,0v8.484a.752.752,0,0,1-.754.753h0A.744.744,0,0,1,275.29,42.892Z"
                  transform="translate(-263 -24)"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.content}>
            <div className={styles.header}>
              <div className={styles.headertitle}>peyment</div>
              <div className={styles.headerline}></div>
            </div>

            <div className={styles.coupon}>
              <div className={styles.coupontitle}>COUPON CODE</div>
              <div className={styles.couponbox}>
                <InputText
                  className="textinputbox"
                  placeHolder="Insert Coupon"
                  handleInputChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setInputBox(e.currentTarget.value);
                  }}
                  maxLength={undefined}
                  value={""}
                />
                <svg className={styles.delete} width="21" height="24" viewBox="0 0 21 24">
                  <path
                    d="M283.092,28.052h-4.863v-.715a2.721,2.721,0,0,0-2.713-2.713H270.8a2.721,2.721,0,0,0-2.713,2.713v.716h-4.863a.754.754,0,0,0,0,1.508h1.1V45a3.637,3.637,0,0,0,3.628,3.627h10.4A3.637,3.637,0,0,0,281.989,45V29.559h1.1a.753.753,0,1,0,0-1.507ZM269.6,27.336a1.208,1.208,0,0,1,1.206-1.205h4.712a1.208,1.208,0,0,1,1.205,1.205v.716H269.6ZM280.481,45a2.129,2.129,0,0,1-2.121,2.122h-10.4A2.129,2.129,0,0,1,265.839,45V29.559h14.647Zm-10.8-2.634V33.877a.754.754,0,1,1,1.508,0v8.484a.752.752,0,0,1-.751.753h0A.758.758,0,0,1,269.68,42.362Zm5.61.53a.741.741,0,0,1-.22-.533V33.877a.754.754,0,1,1,1.508,0v8.484a.752.752,0,0,1-.754.753h0A.744.744,0,0,1,275.29,42.892Z"
                    transform="translate(-263 -24)"
                  />
                </svg>
              </div>
            </div>
            <div className={styles.headerline}></div>

            <div className={styles.summary}>
              <div className={styles.summarydiscription}>
                Order Summary
                <div className={styles.summarycounter}>(2)</div>
              </div>
              <div className={styles.summaryprice}>+ 23.000.000</div>
            </div>
            <div className={styles.summary}>
              <div className={styles.summarydiscription}>
                tax
                <div className={styles.summarycounter}>(9%)</div>
              </div>
              <div className={styles.summaryprice}>+ 2.070.000</div>
            </div>
            <div className={styles.summary}>
              <div className={styles.summarydiscription}>
                coupon saved
                <div className={styles.summarycounter}>(7%)</div>
              </div>
              <div className={styles.summaryprice} style={{ color: "var(--color-light-red)" }}>
                - 3.000.000
              </div>
            </div>
            <div className={styles.headerline}></div>
            <div className={styles.summary}>
              <div className={styles.summarydiscription}>total price</div>
              <div
                className={styles.summaryprice}
                style={{
                  color: "var(--color-dark-blue)",
                  fontWeight: "var(--weight-700)",
                  fontSize: "var(--font-16)",
                }}>
                20.000.000
              </div>
            </div>
          </div>

          <div className={styles.bottom}>
            <div className={styles.alert}>
              <svg className={styles.alertsvg} width="16" height="16" viewBox="0 0 16 16">
                <path d="M8,16a8,8,0,1,1,8-8A8.009,8.009,0,0,1,8,16ZM6.38,11.11a.357.357,0,0,0-.272.131.485.485,0,0,0-.113.317.421.421,0,0,0,.385.448H9.619a.453.453,0,0,0,0-.9L9,11V7a.247.247,0,0,1,.007-.068c-.016.038-.054.056-.113.056H6.38a.453.453,0,0,0,0,.9L7,8v3l-.62.11h0ZM7,4v.941a.124.124,0,0,1-.007.027A.107.107,0,0,0,6.987,5a.1.1,0,0,0,.007.033A.118.118,0,0,1,7,5.061V6h.967l.014,0a.074.074,0,0,0,.019,0,.063.063,0,0,0,.017,0l.017,0H9V5.062a.122.122,0,0,1,.006-.028.089.089,0,0,0,0-.064A.127.127,0,0,1,9,4.94V4H8.02L8.01,4,8,4,7.99,4,7.98,4Z" />
              </svg>
              <div className={styles.alerttext}>
                To create a campaign, your cart must contain at least <strong>5</strong> items
              </div>
            </div>
            <div className="disableButton">Need 2 item to continue</div>
            <div className="saveButton">continue</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerAdscart;
