import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TextArea from "../../../../design/textArea/textArea";
import { handleCompress, handleDecompress } from "../../../../../helper/pako";
import { LanguageKey } from "../../../../../i18n";
import { IProduct_Information } from "../../../../../models/store/IProduct";
import CustomTable from "./customtable";
import styles from "./information.module.css";

const ReactQuill = dynamic(() => import("react-quill-ver2"), { ssr: false });

export default function Information({
  data,
  upadteCteateFromInformation,
  toggleNext,
}: {
  data: IProduct_Information;
  toggleNext: { toggle: boolean; isNext: boolean };
  upadteCteateFromInformation: (info: IProduct_Information, isNext: boolean) => void;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [description, setDescription] = useState(
    data.description !== "" ? JSON.parse(data.description).description : ""
  );
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableHtml, setTableHtml] = useState<string>(
    data.description !== "" ? handleDecompress(JSON.parse(data.description).sizeTable)! : ""
  );
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [tableTitle, setTableTitle] = useState<string>(data.description ? JSON.parse(data.description).tableTitle : "");
  const modules = {
    toolbar: [
      [
        {
          color: [
            "var(--text-h1)",
            "var(--text-h2)",
            "var(--text-h3)",
            "var(--color-gray)",
            "var(--color-dark-yellow)",
            "var(--color-dark-red)",
            "var(--color-purple)",
            "var(--color-dark-green)",
            "var(--color-firoze)",
            "var(--color-light-blue)",
            "var(--color-dark-blue)",
          ],
        },
        {
          background: [
            "var(--text-h1)",
            "var(--text-h2)",
            "var(--text-h3)",
            "var(--color-gray30)",
            "var(--color-light-yellow30)",
            "var(--color-light-red30)",
            "var(--color-purple30)",
            "var(--color-light-green30)",
            "var(--color-firoze30)",
            "var(--color-light-blue30)",
            "var(--color-light-blue30)",
          ],
        },
      ],
      [{ header: "1" }, { header: "2" }],
      [{ align: [] }],
      ["bold", "italic", "underline", "strike"],
      ["link"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  useEffect(() => {
    if (loading) {
      setLoading(false);
      return;
    }
    upadteCteateFromInformation(
      {
        caption: data.caption,
        description: JSON.stringify({
          description: description,
          sizeTable: handleCompress(tableHtml),
          tableTitle: tableTitle,
        }),
        sizeTable: tableHtml,
        tableTitle: tableTitle,
      },
      toggleNext.isNext
    );
  }, [toggleNext.toggle]);

  const handleInsertTable = (html: string, tableTitle: string) => {
    setTableHtml(html);
    setTableTitle(tableTitle);
    console.log("create table", html);
    console.log("create title table", tableTitle);
  };

  const handleDeleteTable = () => {
    setTableHtml("");
    console.log("جدول حذف شد");
  };

  return (
    <>
      <div className={styles.information}>
        <div className="headerandinput" style={{ maxWidth: "40%", minWidth: "200px" }}>
          <div className="headerparent">
            <div className="title">{t(LanguageKey.product_instagramcaption)}</div>
            <div className="counter" role="status" aria-label="description character count">
              <div className={styles.icon}>T</div>(<strong>{data.caption.length}</strong> /<strong>2200</strong>)
            </div>
          </div>
          <TextArea
            className={"message"}
            value={data.caption}
            title="Product Instagram Caption"
            role="textbox"
            name="product-caption"
            aria-label="Product Instagram caption text area"
          />
        </div>
        <div className="headerandinput" style={{ maxWidth: "70%", minWidth: "200px" }}>
          <div className="headerparent">
            <div className="title">{t(LanguageKey.product_productDescription)}</div>
            <div className="counter" role="status" aria-label="description character count">
              <div className={styles.icon}>T</div>(
              <strong>{description ? description.replace(/<[^>]*>?/gm, "").length : 0}</strong> /<strong>1500</strong>)
            </div>
          </div>
          <ReactQuill
            className={`${styles.quillEditor} message`}
            theme="snow"
            value={description}
            onChange={setDescription}
            modules={modules}
            placeholder={t(LanguageKey.product_Informationplaceholder)}
          />
          <div className="headerandinput" style={{ marginTop: "10px" }}>
            <div className="title">{t(LanguageKey.product_addtable)}</div>
            <div className="ButtonContainer" style={{ justifyContent: "start" }}>
              <button style={{ maxWidth: "380px" }} onClick={() => setShowTableModal(true)} className="saveButton">
                {tableHtml ? t(LanguageKey.product_EditTable) : t(LanguageKey.product_addNewTable)}
              </button>
              {tableHtml && (
                <button
                  className="cancelButton"
                  style={{ maxWidth: "fit-content" }}
                  onClick={() => setShowPreviewModal(true)}>
                  {t(LanguageKey.product_PreviewTable)}
                </button>
              )}
              {tableHtml && (
                <img
                  onClick={handleDeleteTable}
                  style={{
                    cursor: "pointer",
                    width: "26px",
                    height: "26px",
                  }}
                  title="ℹ️ delete table"
                  src="/delete.svg"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {showTableModal && (
        <CustomTable
          onClose={() => setShowTableModal(false)}
          onInsertTable={handleInsertTable}
          initialTable={tableHtml}
          initialTableTitle={tableTitle}
        />
      )}

      {showPreviewModal && (
        <>
          <div className="dialogBg" onClick={() => setShowPreviewModal(false)} />
          <div
            className="popup"
            style={{
              width: "80%",
              maxWidth: "800px",
              justifyContent: "flex-start",
            }}>
            <img
              onClick={() => setShowPreviewModal(false)}
              style={{
                cursor: "pointer",
                width: "30px",
                height: "30px",
                alignSelf: "end",
              }}
              title="ℹ️ close"
              src="/close-box.svg"
            />

            {tableHtml && <div className={styles.tablePreview} dangerouslySetInnerHTML={{ __html: tableHtml }} />}
          </div>
        </>
      )}
    </>
  );
}
