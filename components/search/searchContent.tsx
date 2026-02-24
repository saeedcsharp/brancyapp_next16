import { SearchContentModel } from "brancy/models/searchBar/searchContent";
import styles from "./searchContent.module.css";

const SearchContent = (props: { data?: SearchContentModel }) => {
  return (
    <div className={styles.popup}>
      <div className={styles.all}>
        {/* pages */}
        <div className={styles.section}>
          <div className={styles.header}>
            <div className={styles.bulletblue}></div>
            <div className={styles.searchtext}>shoes</div>
            <div className={styles.in}>in</div>
            <div className={styles.category}>pages category</div>
            <div onClick={() => console.log("click on see more in page category ")} className={styles.seemore}>
              (see more)
            </div>
            <div className={styles.line}></div>
          </div>
          <div className={styles.page}>
            <div onClick={() => console.log("click on Nike show ")} className={styles.pagebox}>
              <div className={styles.profile}>
                <img loading="lazy" decoding="async" className={styles.image} alt="profile" src="/no-profile.svg" />
                <div className={styles.user}>
                  <div className={styles.username}>
                    nike shoe
                    <img className={styles.verify} alt="verify" src="/badge-verified.svg" />
                  </div>
                  <div className={styles.instagramid}>@nike.shoe</div>
                </div>
              </div>
              <div className={styles.pageline}> </div>
              <div className={styles.pagesort}>
                <div className={styles.kind}>
                  <svg className={styles.kindicon} viewBox="0 0 32 32">
                    <path
                      d="M11.8 26.5c.3 2-1 4-3 4.3-1.8.3-3.7-1-4-3l-1-6.5a9 9 0 0 1-3-6 9 9 0 0 1 8.8-9h1.7v17.2zM26.4 1.6a2 2 0 0 0-2.7-.5l-9.7 5v16.7l9.7 5q1.6.9 2.7-.4a21 21 0 0 0 0-25.9z"
                      fill="var(--color-gray)"></path>
                  </svg>
                  Ads
                </div>
                <div className={styles.pagecategory}>
                  <svg viewBox="0 0 32 32" className={styles.kindicon}>
                    <path
                      d="M4.7 0h5.6a3 3 0 0 1 3 3v7.4a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V4.7C0 2.1 2.1 0 4.7 0m15 0h5.6C27.9 0 30 2.1 30 4.7v5.7a3 3 0 0 1-3 3h-7.3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3M3 16.6h7.3a3 3 0 0 1 3 3V27a3 3 0 0 1-3 3H4.7A4.7 4.7 0 0 1 0 25.3v-5.7a3 3 0 0 1 3-3m16.7 0H27a3 3 0 0 1 3 3v5.7c0 2.6-2.1 4.7-4.7 4.7h-5.6a3 3 0 0 1-3-3v-7.4a3 3 0 0 1 3-3"
                      fill="var(--color-gray)"></path>
                  </svg>
                  Steamer
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* hashtags */}
        <div className={styles.section}>
          <div className={styles.header}>
            <div className={styles.bulletblue}></div>
            <div className={styles.searchtext}>shoes</div>
            <div className={styles.in}>in</div>
            <div className={styles.category}>hastags</div>
            <div className={styles.line}></div>
          </div>
          <div className={styles.hashtags}>
            <div className={styles.hashtagsbox}>#shoes</div>
            <div className={styles.hashtagsbox}>#nike</div>
          </div>
        </div>
        {/* stores */}
        <div className={styles.section}>
          <div className={styles.header}>
            <div className={styles.bulletblue}></div>
            <div className={styles.searchtext}>shoes</div>
            <div className={styles.in}>in</div>
            <div className={styles.category}>Stores</div>
            <div className={styles.seemore}>(see more)</div>
            <div className={styles.line}></div>
          </div>
          <div className={styles.page}>
            <div className={styles.pagebox}>
              <div className={styles.profile}>
                <img className={styles.image} alt="post" src="/post.png" />
                <div className={styles.user}>
                  <div className={styles.username}>nike shoe</div>
                  <div className={styles.rate}>
                    <img className={styles.verify} alt="verify" src="/icon-star.svg" />
                    4.5
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* recent search */}
        <div className={styles.section}>
          <div className={styles.header}>
            <div className={styles.bulletgray}></div>
            <div className={styles.searchtext}>Recent Searches</div>
            <div className={styles.seemore}>(see more)</div>
            <div className={styles.line}></div>
          </div>
          <div className={styles.hashtags}>
            <div className={styles.hashtagsbox}>shoes</div>
            <div className={styles.hashtagsbox}>#nike</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchContent;
