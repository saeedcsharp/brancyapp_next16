import Modal from "brancy/components/design/modal";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import BankCard from "brancy/components/wallet/bankCard";
import InvoicePopup from "brancy/components/wallet/modal/invoicePopup";
import Invoices from "brancy/components/wallet/invoices";
import WalletTile from "brancy/components/wallet/WalletTile";
import OrderDetailPopup from "brancy/components/wallet/modal/orderDetailPopup";
import SubInvoicesPopup from "brancy/components/wallet/modal/subInvoicePopup";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { packageStatus } from "brancy/helper/loadingStatus";
import { IGeneralBallance, IGetSubInvoice, IInvoice } from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
const Payment = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  // حالت‌های محلی برای فرم‌ها
  const [generalBalance, setGeneralBalance] = useState<IGeneralBallance[]>([]);
  const [defaultCardNumber, setDefaultCardNumber] = useState<string>();
  const [showSubInvoicesPopup, setShowSubInvoicesPopup] = useState<string | null>(null);
  const [subInvoicesByCard, setSubInvoicesByCard] = useState<Record<string, IGetSubInvoice>>({});
  const [showOrderDetailsPopup, setShowOrderDetailsPopup] = useState<IInvoice | null>(null);
  const [showInvoicePopup, setShowInvoicePopup] = useState<IInvoice | null>(null);
  useEffect(() => {
    if (!session) return;
    if (session?.user.currentIndex === -1) router.push("/user");
    if (!session || !packageStatus(session)) router.push("/upgrade");
  }, [session]);

  useEffect(() => {
    if (!session) return;
  }, [session]);

  const handleChangeDefaultCard = (cardNumber: string) => {
    setDefaultCardNumber(cardNumber);
  };

  const getInvoice = useCallback(
    async (invoiceId: string) => {
      if (!session) return;
      try {
        const res = await clientFetchApi<null, IInvoice>("/api/wallet/getInvoice", {
          session,
          queries: [{ key: "invoiceId", value: invoiceId }],
        });
        if (!res.succeeded) {
          notify(res.info.responseType, NotifType.Warning);
          return;
        }
        setShowOrderDetailsPopup(res.value);
        setShowInvoicePopup(null);
      } catch (err) {
        console.error("getInvoice error", err);
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [session],
  );
  if (!session || session!.user.currentIndex === -1) return null;

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <title>برنسی ▸ عملیات پرداخت و کیف پول</title>
        <meta name="description" content="صفحه عملیات پرداخت و کیف پول در پلتفرم برانسی" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <main>
        <WalletTile generalBalance={generalBalance} />
        <div className="pinContainer">
          {/* --------------------------------Card status----------------------------------------- */}
          <div className="tooBigCard">
            <header className="headerChild" title="↕ Resize the Card" role="button">
              <div className="circle" aria-hidden="true" />
              <h2 className="Title">کارت های بانکی</h2>
            </header>
            <BankCard
              defaultCardNumber={defaultCardNumber}
              onGeneralBalanceChange={setGeneralBalance}
              onSelectCard={(cardNumber) => setShowSubInvoicesPopup(cardNumber)}
              onDefaultCardChange={handleChangeDefaultCard}
            />
          </div>
          {/* --------------------------------Invoices----------------------------------------- */}
          <div className="tooBigCard">
            <header className="headerChild" title="↕ Resize the Card" role="button">
              <div className="circle" aria-hidden="true" />
              <h2 className="Title">تراکنش‌ها</h2>
            </header>
            <Invoices openInvoicePopup={(invoice) => setShowInvoicePopup(invoice)} />
          </div>
          {/* --------------------------------Sub Invoices----------------------------------------- */}
          <div className="tooBigCard"></div>
        </div>
      </main>

      {/* ------------------------------------------------------------------------- */}
      <Modal
        closePopup={() => setShowSubInvoicesPopup(null)}
        classNamePopup={"popup"}
        showContent={showSubInvoicesPopup !== null}>
        {showSubInvoicesPopup && (
          <SubInvoicesPopup
            cardNumber={showSubInvoicesPopup}
            subInvoices={subInvoicesByCard[showSubInvoicesPopup] ?? null}
            onClose={() => setShowSubInvoicesPopup(null)}
            onSubInvoicesChange={(subInvoices) => {
              setSubInvoicesByCard((current) => ({ ...current, [showSubInvoicesPopup]: subInvoices }));
            }}
          />
        )}
      </Modal>
      <Modal
        closePopup={() => setShowInvoicePopup(null)}
        classNamePopup={"popupLarge"}
        showContent={showInvoicePopup !== null}>
        {showInvoicePopup && (
          <InvoicePopup
            invoice={showInvoicePopup}
            subInvoices={showInvoicePopup.subInvoices}
            getInvoice={getInvoice}
            onClose={() => setShowInvoicePopup(null)}
          />
        )}
      </Modal>
      <Modal
        closePopup={() => setShowOrderDetailsPopup(null)}
        classNamePopup={"popupLarge"}
        showContent={showOrderDetailsPopup !== null}>
        {showOrderDetailsPopup && (
          <OrderDetailPopup
            invoice={showOrderDetailsPopup}
            onClose={() => setShowOrderDetailsPopup(null)}
            backToInvoiceList={(invoice) => {
              setShowOrderDetailsPopup(null);
              setShowInvoicePopup(invoice);
            }}
          />
        )}
      </Modal>
    </>
  );
};

export default Payment;
