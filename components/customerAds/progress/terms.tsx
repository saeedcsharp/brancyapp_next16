import Head from "next/head";
import { useState } from "react";
import CheckBoxButton from "brancy/components/design/checkBoxButton";
import styles from "./progress.module.css";
function TermsAndCondition(prop: { changeCheckBox: (checkBox: boolean) => void; checkBox: boolean }) {
  const [checkBax, setCheckBax] = useState<boolean>(prop.checkBox);
  const handleChangeCheckBox = () => {
    const check = checkBax;
    setCheckBax(!checkBax);
    prop.changeCheckBox(!check);
  };
  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ 🛂 Terms & Conditions</title>
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
      <div className={styles.stepcontainer0}>
        <div className="title">terms and conditions </div>
        <div className={styles.terms}>
          <p>
            1. An Intellectual Property clause will inform users that the contents, logo and other visual media you
            created is your property and is protected by copyright laws.
          </p>
          <p>
            2. A Termination clause will inform users that any accounts on your website and mobile app, or users' access
            to your website and app, can be terminated in case of abuses or at your sole discretion.
          </p>
          <p>3. A Governing Law clause will inform users which laws govern the agreement.</p>
          <p>
            4. A Termination clause will inform users that any accounts on your website and mobile app, or users' access
            to your website and app, can be terminated in case of abuses or at your sole discretion.
          </p>
          <p>5. A Governing Law clause will inform users which laws govern the agreement.</p>
        </div>
        <div style={{ height: "20px", position: "relative", left: "2px" }}>
          <CheckBoxButton
            handleToggle={handleChangeCheckBox}
            value={checkBax}
            textlabel={"I have read and agree to Terms and Conditions."}
            title={"I have read and agree to Terms and Conditions."}
          />
        </div>
      </div>
    </>
  );
}

export default TermsAndCondition;
