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
import { useInfiniteScroll } from "brancy/helper/useInfiniteScroll";
import { IBankCard, IGeneralBallance, IGetInvoice, IGetSubInvoice, IInvoice } from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MethodType } from "brancy/helper/api";
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
  const [cards, setCards] = useState<IBankCard[]>([]);
  const [invoices, setInvoices] = useState<IGetInvoice | null>(null);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showSubInvoicesPopup, setShowSubInvoicesPopup] = useState<string | null>(null);
  const [subInvoicesByCard, setSubInvoicesByCard] = useState<Record<string, IGetSubInvoice>>({});
  const [showOrderDetailsPopup, setShowOrderDetailsPopup] = useState<IInvoice | null>(null);
  const [showInvoicePopup, setShowInvoicePopup] = useState<IInvoice | null>(null);
  const [generalBalance, setGeneralBalance] = useState<IGeneralBallance[]>([]);
  const [generalBalanceLoading, setGeneralBalanceLoading] = useState(false);
  useEffect(() => {
    if (!session) return;
    if (session?.user.currentIndex === -1) router.push("/user");
    if (!session || !packageStatus(session)) router.push("/upgrade");
  }, [session]);

  useEffect(() => {
    if (!session) return;
    fetchCards();
    fetchInvoices();
    fetchGeneralBalance();
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleChangeDefaultCard = async (cardNumber: string) => {
    setCards((current) =>
      current.map((card) => ({
        ...card,
        isDefault: card.cardNumber === cardNumber,
      })),
    );
  };

  async function fetchCards() {
    try {
      const res = await clientFetchApi<null, IBankCard[]>("/api/wallet/getInstagramerBankCards", { session });
      if (res && res.succeeded) {
        const v: any = res.value;
        if (Array.isArray(v)) {
          setCards(v);
        } else if (v && Array.isArray(v.value)) {
          setCards(v.value);
        } else if (v && Array.isArray(v.cards)) {
          setCards(v.cards);
        } else if (v && typeof v === "object") {
          // single object returned — wrap into array
          setCards([v]);
        } else {
          setCards([]);
        }
      } else {
        notify(res.info.responseType, NotifType.Warning);
        setCards([]);
      }
    } catch (err) {
      console.error("fetchCards error", err);
      notify(ResponseType.Unexpected, NotifType.Error);
      setCards([]);
    }
  }

  async function fetchInvoices() {
    setInvoicesLoading(true);
    try {
      const res = await clientFetchApi<null, IGetInvoice>("/api/wallet/getInvoices", {
        session,
        queries: [{ key: "nextMaxId", value: "" }],
      });
      if (res && res.succeeded) {
        setInvoices(res.value);
      } else {
        notify(res.info.responseType, NotifType.Warning);
        setInvoices({ items: [], nextMaxId: null });
      }
    } catch (err) {
      console.error("fetchInvoices error", err);
      notify(ResponseType.Unexpected, NotifType.Error);
      setInvoices({ items: [], nextMaxId: null });
    } finally {
      setInvoicesLoading(false);
    }
  }
  const fetchGeneralBalance = async (from = 0) => {
    setGeneralBalanceLoading(true);
    try {
      const response = await clientFetchApi<null, IGeneralBallance[]>("/api/wallet/getGenerallBallance", {
        session,
        methodType: MethodType.get,
        queries: [
          { key: "from", value: from.toString() },
          { key: "end", value: Date.now().toString() },
        ],
      });
      if (response.succeeded) {
        console.log("General balance response:", response.value);
        setGeneralBalance(response.value);
      } else notify(response.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setGeneralBalanceLoading(false);
    }
  };
  const fetchMoreInvoices = useCallback(async (): Promise<IInvoice[]> => {
    const nextMaxId = invoices?.nextMaxId;
    if (!session || !nextMaxId) return [];

    try {
      const res = await clientFetchApi<null, IGetInvoice>("/api/wallet/getInvoices", {
        session,
        queries: [{ key: "nextMaxId", value: nextMaxId }],
      });

      if (!res.succeeded) {
        notify(res.info.responseType, NotifType.Warning);
        setInvoices((current) => (current ? { ...current, nextMaxId: null } : current));
        return [];
      }

      const nextPage = res.value ?? { items: [], nextMaxId: null };
      const nextItems = Array.isArray(nextPage.items) ? nextPage.items : [];
      setInvoices((current) =>
        current ? { ...current, nextMaxId: nextItems.length ? nextPage.nextMaxId : null } : current,
      );
      return nextItems;
    } catch (err) {
      console.error("fetchMoreInvoices error", err);
      notify(ResponseType.Unexpected, NotifType.Error);
      setInvoices((current) => (current ? { ...current, nextMaxId: null } : current));
      return [];
    }
  }, [invoices?.nextMaxId, session]);

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
  const { containerRef: invoicesScrollRef, isLoadingMore: invoicesLoadingMore } = useInfiniteScroll<IInvoice>({
    hasMore: Boolean(invoices?.nextMaxId),
    fetchMore: fetchMoreInvoices,
    onDataFetched: (newInvoices) => {
      setInvoices((current) => (current ? { ...current, items: [...current.items, ...newInvoices] } : current));
    },
    getItemId: (invoice) => invoice.id,
    currentData: invoices?.items ?? [],
    isLoading: invoicesLoading,
    enabled: Boolean(session && invoices),
  });

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
        <WalletTile generalBalance={generalBalance} cards={cards} />
        <div className="pinContainer">
          {/* --------------------------------Card status----------------------------------------- */}
          <div className="tooBigCard">
            <header className="headerChild" title="↕ Resize the Card" role="button">
              <div className="circle" aria-hidden="true" />
              <h2 className="Title">کارت های بانکی</h2>
            </header>
            <BankCard
              cards={cards}
              generalBalance={generalBalance}
              loading={generalBalanceLoading}
              onFromDateChange={fetchGeneralBalance}
              onSelectCard={(cardNumber) => setShowSubInvoicesPopup(cardNumber)}
              onCardAdded={() => void fetchCards()}
            />
          </div>
          {/* --------------------------------Invoices----------------------------------------- */}
          <div className="tooBigCard">
            <header className="headerChild" title="↕ Resize the Card" role="button">
              <div className="circle" aria-hidden="true" />
              <h2 className="Title">تراکنش‌ها</h2>
            </header>
            <Invoices
              invoices={invoices}
              invoicesLoading={invoicesLoading}
              invoicesLoadingMore={invoicesLoadingMore}
              hasMore={Boolean(invoices?.nextMaxId)}
              containerRef={invoicesScrollRef}
              openInvoicePopup={(invoice) => setShowInvoicePopup(invoice)}
            />
          </div>
          {/* --------------------------------Sub Invoices----------------------------------------- */}
          <div className="tooBigCard"></div>
        </div>
      </main>

      {/* ------------------------------------------------------------------------- */}
      <Modal
        closePopup={() => setShowSubInvoicesPopup(null)}
        classNamePopup={"popupLarge"}
        showContent={showSubInvoicesPopup !== null}>
        {showSubInvoicesPopup && (
          <SubInvoicesPopup
            cardNumber={showSubInvoicesPopup}
            subInvoices={subInvoicesByCard[showSubInvoicesPopup] ?? null}
            generalBalance={generalBalance}
            onClose={() => setShowSubInvoicesPopup(null)}
            onSubInvoicesChange={(subInvoices) => {
              setSubInvoicesByCard((current) => ({ ...current, [showSubInvoicesPopup]: subInvoices }));
            }}
            changeDefaultCard={handleChangeDefaultCard}
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
