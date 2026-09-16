import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import { SubInvoiceStatus } from "brancy/models/enums";
import { IBankCard, IGeneralBallance } from "brancy/models/interfaces";
import PriceFormater, { PriceFormaterClassName, PriceType } from "brancy/components/priceFormater";
import InputBox from "brancy/components/design/inputBox/inputBox";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import RingLoader from "../design/loader/ringLoder";
import SwitchButton from "../design/switchButton/switchButton";
import { useSession } from "next-auth/react";
import Slider, { SliderSlide } from "brancy/components/design/slider/slider";
import styles from "./bankCard.module.css";
import { useTranslation } from "react-i18next";
type BankCardItemProps =
  | {
      card: IBankCard;
      generalBalance: IGeneralBallance[];
      loading: boolean;
      onSelectCard?: (bamckCrd: string) => void;
      onDefaultCardChange?: (cardNumber: string) => void;
      isAddCard?: false;
      onCardAdded?: () => void;
    }
  | {
      isAddCard: true;
      onCardAdded?: () => void;
    };
type BankCardProps = {
  defaultCardNumber?: string;
  onGeneralBalanceChange?: (balance: IGeneralBallance[]) => void;
  onSelectCard?: (cardNumber: string) => void;
  onDefaultCardChange?: (cardNumber: string) => void;
};
function BankCardItem(props: BankCardItemProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState("");
  const [addCardLoading, setAddCardLoading] = useState(false);
  const [cardNumberInvalid, setCardNumberInvalid] = useState(false);

  const handleCardNumberChange = (value: string) => {
    setNewCardNumber(value.replace(/\D/g, "").slice(0, 16));
    setCardNumberInvalid(false);
  };

  const handleAddCard = async (event: FormEvent) => {
    event.preventDefault();
    if (newCardNumber.length !== 16 || addCardLoading) return;

    setAddCardLoading(true);
    try {
      const response = await clientFetchApi<{ cardNumber: string }, boolean>("/api/wallet/addCardNumber", {
        session,
        methodType: MethodType.get,
        queries: [{ key: "cardNumber", value: newCardNumber }],
      });

      if (!response.succeeded) {
        setCardNumberInvalid(true);
        notify(response.info.responseType, NotifType.Warning);
        return;
      }

      notify(ResponseType.Ok, NotifType.Success);
      setNewCardNumber("");
      setCardNumberInvalid(false);
      props.onCardAdded?.();
      setShowAddForm(false);
    } catch {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setAddCardLoading(false);
    }
  };

  if (props.isAddCard) {
    return (
      <>
        <button className={styles.addCardTile} type="button" onClick={() => setShowAddForm((current) => !current)}>
          <span className={styles.addCardIcon} aria-hidden="true">
            +
          </span>
          <span>{t("Add Bank Card")}</span>
          <small>{t("Register a new card")}</small>
        </button>

        {showAddForm && (
          <form className="headerandinput" onSubmit={handleAddCard}>
            <label className={styles.label} htmlFor="wallet-card-number">
              {t("Card Number")}

              <InputBox
                className="textinputbox"
                handleInputChange={(event: ChangeEvent<HTMLInputElement>) => handleCardNumberChange(event.target.value)}
                value={newCardNumber}
                numberType
                maxLength={16}
                inputMode="numeric"
                autoComplete="cc-number"
                id="wallet-card-number"
                name="wallet-card-number"
              />

              {cardNumberInvalid && (
                <small className={styles.invalidCardMessage} role="alert">
                  {t("Notify_InvalidBankCardNumber")}
                </small>
              )}
            </label>
            <div className="ButtonContainer">
              <button
                className={newCardNumber.length === 16 ? "saveButton" : "disableButton"}
                type="submit"
                disabled={newCardNumber.length !== 16}>
                {t("Register Bank Card")}
              </button>
            </div>
          </form>
        )}
      </>
    );
  }

  const { card, generalBalance, loading, onSelectCard, onDefaultCardChange } = props;
  const cardBalances = generalBalance.filter((item) => item.cardNumber === card.cardNumber);
  const priceType = cardBalances[0]?.priceType ?? PriceType.Toman;
  const total = cardBalances
    .filter((item) => item.status === SubInvoiceStatus.None)
    .reduce((sum, item) => sum + item.totalPrice, 0);
  const totalPriceType = cardBalances.find((item) => item.status === SubInvoiceStatus.None)?.priceType ?? priceType;
  const [setDefaultCardLoading, setSetDefaultCardLoading] = useState(false);
  const [settleLoading, setSettleLoading] = useState(false);

  const setDefaultCard = async () => {
    if (!session || setDefaultCardLoading) return;

    setSetDefaultCardLoading(true);
    try {
      const response = await clientFetchApi<null, boolean>("/api/wallet/setDefaultCard", {
        session,
        queries: [{ key: "cardNumber", value: card.cardNumber }],
      });

      if (response.succeeded) {
        notify(ResponseType.Ok, NotifType.Success);
        onDefaultCardChange?.(card.cardNumber);
      } else {
        notify(response.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      console.error("setDefaultCard error", error);
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setSetDefaultCardLoading(false);
    }
  };

  const settleCard = async () => {
    if (!session || settleLoading) return;

    setSettleLoading(true);
    try {
      const response = await clientFetchApi<null, boolean>("/api/wallet/settleRequest", {
        session,
        methodType: MethodType.get,
        queries: [{ key: "cardNumber", value: card.cardNumber }],
        data: undefined,
      });

      if (response.succeeded) {
        notify(ResponseType.Ok, NotifType.Success);
      } else {
        notify(response.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      console.error("settleCard error", error);
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setSettleLoading(false);
    }
  };

  return (
    <div className={styles.bankCardContainer}>
      <div className={styles.bankCard}>
        <div className={styles.bankCarddetail}>
          <div className={styles.cardNumber}>{card.cardNumber}</div>
          <div className={styles.iban}>{card.iban}</div>
          <span className={styles.holder}>{card.accountHolderName}</span>
        </div>
        <div className="headerparent">
          <div className="explain">
            {card.bankName} -{card.bankCountryCode}
          </div>
          <div className={styles.badges}>
            {card.isDefault && <span className="IDgreen">{t("active")}</span>}
            {!card.isActive && <span className="IDred">{t("Suspended")}</span>}
          </div>
        </div>
      </div>
      <div className="headerparent" onClick={(event) => event.stopPropagation()}>
        <div className="title2">{t("Default Card")}</div>
        <SwitchButton
          name={`default-card-${card.cardNumber}`}
          checked={card.isDefault}
          handleToggle={setDefaultCard}
          disabled={!session || setDefaultCardLoading}
          className={!card.isActive ? "fadeDiv" : undefined}
          role="switch"
          aria-label={t("Default Card")}
        />
      </div>

      <div className={`${styles.statusGrid} ${loading ? styles.cardsLoading : ""}`}>
        <div className="headerandinput">
          <PriceFormater
            pricetype={priceType}
            fee={cardBalances
              .filter((item) => item.status === SubInvoiceStatus.None)
              .reduce((sum, item) => sum + item.totalPrice, 0)}
            className={PriceFormaterClassName.PostPrice}
          />
          <span className={styles.statusLabel}>{t("Unsettled")}</span>
        </div>
        <div className="headerandinput">
          <PriceFormater
            pricetype={priceType}
            fee={cardBalances
              .filter((item) => item.status === SubInvoiceStatus.Settled)
              .reduce((sum, item) => sum + item.totalPrice, 0)}
            className={PriceFormaterClassName.PostPrice}
          />
          <span className={styles.statusLabel}>{t("Settled")}</span>
        </div>
        <div className="headerandinput">
          <PriceFormater
            pricetype={priceType}
            fee={cardBalances
              .filter((item) => item.status === SubInvoiceStatus.AwaitingSettled)
              .reduce((sum, item) => sum + item.totalPrice, 0)}
            className={PriceFormaterClassName.PostPrice}
          />
          <span className={styles.statusLabel}>{t("Awaiting Settled")}</span>
        </div>

        <div className="headerandinput">
          <PriceFormater
            pricetype={priceType}
            fee={cardBalances
              .filter((item) => item.status === SubInvoiceStatus.Failed)
              .reduce((sum, item) => sum + item.totalPrice, 0)}
            className={PriceFormaterClassName.PostPrice}
          />
          <span className={styles.statusLabel}>{t("Failed")}</span>
        </div>
      </div>

      <div className="ButtonContainer">
        <div className="cancelButton" onClick={() => onSelectCard?.(card.cardNumber)}>
          {t("History")}
        </div>
        <button
          type="button"
          className={session && !settleLoading && total > 0 ? "saveButton" : "disableButton"}
          onClick={settleCard}
          disabled={!session || settleLoading || total <= 0}>
          {settleLoading ? <RingLoader color="white" width={20} height={20} /> : t("Settle Request")}
        </button>
      </div>
    </div>
  );
}

export default function BankCard({
  defaultCardNumber,
  onGeneralBalanceChange,
  onSelectCard,
  onDefaultCardChange,
}: BankCardProps) {
  const { data: session } = useSession();
  const [cards, setCards] = useState<IBankCard[]>([]);
  const [generalBalance, setGeneralBalance] = useState<IGeneralBallance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
    try {
      const response = await clientFetchApi<null, IBankCard[]>("/api/wallet/getInstagramerBankCards", { session });
      if (!response.succeeded) {
        notify(response.info.responseType, NotifType.Warning);
        setCards([]);
        return;
      }

      const value: any = response.value;
      if (Array.isArray(value)) setCards(value);
      else if (value && Array.isArray(value.value)) setCards(value.value);
      else if (value && Array.isArray(value.cards)) setCards(value.cards);
      else if (value && typeof value === "object") setCards([value]);
      else setCards([]);
    } catch (error) {
      console.error("fetchCards error", error);
      notify(ResponseType.Unexpected, NotifType.Error);
      setCards([]);
    }
  };

  const fetchGeneralBalance = async () => {
    setLoading(true);
    try {
      const response = await clientFetchApi<null, IGeneralBallance[]>("/api/wallet/getGenerallBallance", {
        session,
        methodType: MethodType.get,
        queries: [
          { key: "from", value: "0" },
          { key: "end", value: Date.now().toString() },
        ],
      });
      if (response.succeeded) {
        setGeneralBalance(response.value);
        onGeneralBalanceChange?.(response.value);
      } else notify(response.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session) return;
    void fetchCards();
    void fetchGeneralBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const orderedCards = [...cards]
    .map((card) => (defaultCardNumber ? { ...card, isDefault: card.cardNumber === defaultCardNumber } : card))
    .sort((first, second) => Number(second.isDefault) - Number(first.isDefault));
  const defaultCard = orderedCards.find((card) => card.isDefault);

  return (
    <Slider
      key={defaultCard?.cardNumber ?? "no-default-card"}
      spaceBetween={16}
      initialIndex={orderedCards.length > 0 ? 1 : 0}>
      <SliderSlide>
        <BankCardItem isAddCard onCardAdded={fetchCards} />
      </SliderSlide>
      {orderedCards.map((card, index) => (
        <SliderSlide key={`${card.cardNumber}-${index}`}>
          <BankCardItem
            card={card}
            generalBalance={generalBalance}
            loading={loading}
            onSelectCard={onSelectCard}
            onDefaultCardChange={onDefaultCardChange}
          />
        </SliderSlide>
      ))}
    </Slider>
  );
}
