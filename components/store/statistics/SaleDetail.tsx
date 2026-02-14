import Head from "next/head";
import React from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "saeed/i18n";
import styles from "./saleDetail.module.css";

interface SaleDetailProps {
  saleId: number;
  onClose?: () => void;
}

const SaleDetail: React.FC<SaleDetailProps> = ({ saleId, onClose }) => {
  const { t } = useTranslation();

  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ sale Detail</title>
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
      <>
        <div className={styles.header}>
          <div className={styles.saleheader}>
            <img style={{ cursor: "pointer" }} onClick={onClose} src="/close-box.svg" alt="Close" />

            <h1 className={styles.salemodel}>{t(LanguageKey.storestatistics_sales || "Sale Detail")}</h1>
            <h2 className={styles.salenumber}>({saleId})</h2>
          </div>
        </div>
        <div className={styles.saleDetailContent}>
          <p>Sale ID: {saleId}</p>
          {/* Add more sale detail content here */}
        </div>
      </>
    </>
  );
};

export default SaleDetail;
