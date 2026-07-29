import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import TextArea from "brancy/components/design/textArea/textArea";
import { handleCompress, handleDecompress } from "brancy/helper/pako";
import { LanguageKey } from "brancy/i18n";
import CustomTable from "brancy/components/store/products/productDetail/popups/customtable";
import styles from "./2-information.module.css";
import { IProduct_Information } from "brancy/models/interfaces";
import { importHTML, exportDocHTML } from "brancy/components/design/textEditor/utils/serializer";
import type { EditorDoc } from "brancy/components/design/textEditor/types";
import Tooltip from "brancy/components/design/tooltip/tooltip";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { MethodType } from "brancy/helper/api";
import { notify, NotifType, ResponseType } from "brancy/components/notifications/notificationBox";
const TextEditor = dynamic(() => import("brancy/components/design/textEditor/TextEditor"), { ssr: false });
export default function Information({
  data,
  upadteCteateFromInformation,
  toggleNext,
  productId,
  categoryId,
}: {
  data: IProduct_Information;
  toggleNext: { toggle: boolean; isNext: boolean };
  upadteCteateFromInformation: (info: IProduct_Information, isNext: boolean) => void;
  productId: number;
  categoryId: number;
}) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [description, setDescription] = useState(
    data.description !== "" ? JSON.parse(data.description).description : "",
  );
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableHtml, setTableHtml] = useState<string>(
    data.description !== "" ? handleDecompress(JSON.parse(data.description).sizeTable)! : "",
  );
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [tableTitle, setTableTitle] = useState<string>(data.description ? JSON.parse(data.description).tableTitle : "");
  const [initialDoc] = useState<EditorDoc>(() => importHTML(description || ""));
  const handleSuggestedDescription = async (content: string) => {
    try {
      const res = await clientFetchApi<{ contentDescription: string }, string>("/api/product/getSuggestedDescription", {
        methodType: MethodType.post,
        session: session,
        data: { contentDescription: content },
        queries: [
          { key: "productId", value: productId.toString() },
          { key: "categoryId", value: categoryId.toString() },
        ],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        return res.value ?? "";
      } else {
        notify(res.info.responseType, NotifType.Warning);
        return "";
      }
    } catch {
      notify(ResponseType.Unexpected, NotifType.Error);
      return "";
    }
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
      toggleNext.isNext,
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
            className="TextArea"
            value={data.caption}
            title="Product Instagram Caption"
            role="textbox"
            name="product-caption"
            aria-label="Product Instagram caption text area"
          />
        </div>
        <div className="headerandinput" style={{ maxWidth: "70%", minWidth: "200px" }}>
          <div className="headerparent">
            <div className="title">
              {t(LanguageKey.product_productDescription)}
              <Tooltip
                triggerType="tooltip"
                tooltipValue={t(LanguageKey.product_Informationplaceholder)}
                position="bottom"
                onClick={true}
              />
            </div>
            <div className="counter" role="status" aria-label="description character count">
              <div className={styles.icon}>T</div>(
              <strong>{description ? description.replace(/<[^>]*>?/gm, "").length : 0}</strong> /<strong>1500</strong>)
            </div>
          </div>
          <TextEditor
            className={styles.textEditorWrap}
            config={{
              placeholder: t(LanguageKey.pageToolspopup_typehere),
              initialDoc,
              autoSave: false,
              theme: "light",
              onChange: (doc: EditorDoc) => setDescription(exportDocHTML(doc)),
              onAIRequest: async (_op, content) => {
                return await handleSuggestedDescription(content);
              },
            }}
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
