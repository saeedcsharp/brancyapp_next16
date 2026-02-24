import React, { useEffect, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CheckBoxButton from "brancy/components/design/checkBoxButton";
import PriceFormater, { PriceFormaterClassName, PriceType } from "brancy/components/priceFormater";
import { LanguageKey } from "brancy/i18n";
import styles from "./7-InCart.module.css";

const MemoizedCheckBoxButton = React.memo(CheckBoxButton);

const orders = [
  {
    id: "1",
    items: 2,
    price: 1000,
    deliverDate: "12:58 AM",
    customer: {
      name: "asghar",
      username: "@Csharpphile",
      profilePic: "/no-profile.svg",
    },
  },
  {
    id: "1",
    items: 3,
    price: 1000,
    deliverDate: "9:15 AM",
    customer: {
      name: "akbar",
      username: "@akbar",
      profilePic: "/no-profile.svg",
    },
  },
  {
    id: "1",
    items: 3,
    price: 1000,
    deliverDate: "10:15 AM",
    customer: {
      name: "Ali Reza",
      username: "@AliReza",
      profilePic: "/no-profile.svg",
    },
  },

  {
    id: "1",
    items: 2,
    price: 1000,
    deliverDate: "12:58 AM",
    customer: {
      name: "asghar",
      username: "@Csharpphile",
      profilePic: "/no-profile.svg",
    },
  },
  {
    id: "1",
    items: 3,
    price: 1000,
    deliverDate: "9:15 AM",
    customer: {
      name: "akbar",
      username: "@akbar",
      profilePic: "/no-profile.svg",
    },
  },
  {
    id: "1",
    items: 3,
    price: 1000,
    deliverDate: "10:15 AM",
    customer: {
      name: "Ali Reza",
      username: "@AliReza",
      profilePic: "/no-profile.svg",
    },
  },
  {
    id: "1",
    items: 2,
    price: 1000,
    deliverDate: "12:58 AM",
    customer: {
      name: "asghar",
      username: "@Csharpphile",
      profilePic: "/no-profile.svg",
    },
  },
  {
    id: "1",
    items: 3,
    price: 1000,
    deliverDate: "9:15 AM",
    customer: {
      name: "akbar",
      username: "@akbar",
      profilePic: "/no-profile.svg",
    },
  },
  {
    id: "1",
    items: 3,
    price: 1000,
    deliverDate: "10:15 AM",
    customer: {
      name: "Ali Reza",
      username: "@AliReza",
      profilePic: "/no-profile.svg",
    },
  },
  {
    id: "1",
    items: 2,
    price: 1000,
    deliverDate: "12:58 AM",
    customer: {
      name: "asghar",
      username: "@Csharpphile",
      profilePic: "/no-profile.svg",
    },
  },
  {
    id: "1",
    items: 3,
    price: 1000,
    deliverDate: "9:15 AM",
    customer: {
      name: "akbar",
      username: "@akbar",
      profilePic: "/no-profile.svg",
    },
  },
  {
    id: "1",
    items: 3,
    price: 1000,
    deliverDate: "10:15 AM",
    customer: {
      name: "Ali Reza",
      username: "@AliReza",
      profilePic: "/no-profile.svg",
    },
  },
  {
    id: "1",
    items: 2,
    price: 1000,
    deliverDate: "12:58 AM",
    customer: {
      name: "asghar",
      username: "@Csharpphile",
      profilePic: "/no-profile.svg",
    },
  },
  {
    id: "1",
    items: 3,
    price: 1000,
    deliverDate: "9:15 AM",
    customer: {
      name: "akbar",
      username: "@akbar",
      profilePic: "/no-profile.svg",
    },
  },
  {
    id: "1",
    items: 3,
    price: 1000,
    deliverDate: "10:15 AM",
    customer: {
      name: "Ali Reza",
      username: "@AliReza",
      profilePic: "/no-profile.svg",
    },
  },
];
interface SelectionState {
  selectedOrders: Set<string>;
  clickedOrders: Set<string>;
  selectedMenu: boolean;
  selectAll: boolean;
  isDragging: boolean;
  startX: number;
  scrollLeft: number;
}

type SelectionAction =
  | { type: "SELECT_ALL" }
  | { type: "DESELECT_ALL" }
  | { type: "TOGGLE_SELECT_ONE"; payload: { id: string; checked: boolean } }
  | { type: "ROW_CLICK"; payload: { id: string } }
  | { type: "SET_STATE"; payload: Partial<SelectionState> };

const initialState: SelectionState = {
  selectedOrders: new Set(),
  clickedOrders: new Set(),
  selectedMenu: false,
  selectAll: false,
  isDragging: false,
  startX: 0,
  scrollLeft: 0,
};

function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
  switch (action.type) {
    case "SELECT_ALL":
      return {
        ...state,
        selectedOrders: new Set(orders.map((o) => o.id)),
        selectedMenu: true,
        selectAll: true,
      };

    case "DESELECT_ALL":
      return {
        ...state,
        selectedOrders: new Set(),
        selectedMenu: false,
        selectAll: false,
      };

    case "TOGGLE_SELECT_ONE": {
      const newSelectedOrders = new Set(state.selectedOrders);
      action.payload.checked ? newSelectedOrders.add(action.payload.id) : newSelectedOrders.delete(action.payload.id);
      return {
        ...state,
        selectedOrders: newSelectedOrders,
        selectedMenu: !!newSelectedOrders.size,
        selectAll: newSelectedOrders.size === orders.length,
      };
    }

    case "ROW_CLICK":
      return {
        ...state,
        clickedOrders: new Set(state.clickedOrders).add(action.payload.id),
      };

    case "SET_STATE":
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

export default function InCart({
  showOrder,
  handleMoveToInCart,
}: {
  showOrder: (orderId: string) => void;
  handleMoveToInCart: () => void;
}) {
  const { t } = useTranslation();
  const labels = {
    all: t(LanguageKey.Storeorder_all),
    orderId: t(LanguageKey.Storeorder_ORDERID),
    customer: t(LanguageKey.Storeorder_CUSTOMER),
    items: t(LanguageKey.Storeorder_ITEMS),
    price: t(LanguageKey.Storeorder_PRICE),
    orderDate: t(LanguageKey.Storeorder_OrderDATE),
    delivery: t(LanguageKey.Storeorder_DELIVERY),
    destination: t(LanguageKey.Storeorder_Destination),
    status: t(LanguageKey.Storeorder_STATUS),
    sentdate: t(LanguageKey.Storeorder_SentDATE),
    deliverdate: t(LanguageKey.Storeorder_deliverdate),
    comment: t(LanguageKey.comments),
  };
  const [state, dispatch] = useReducer(selectionReducer, initialState);
  const [clickedOrder, setClickedOrder] = useState<string | null>(null); // شناسه سفارشی که کلیک شده است
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const position = useRef({ startX: 0, scrollLeft: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tableContainerRef.current) return;
    setIsDragging(true);
    position.current.startX = e.pageX - tableContainerRef.current.offsetLeft;
    position.current.scrollLeft = tableContainerRef.current.scrollLeft;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !tableContainerRef.current) return;
      e.preventDefault();
      const x = e.pageX - tableContainerRef.current.offsetLeft;
      tableContainerRef.current.scrollLeft = position.current.scrollLeft - (x - position.current.startX);
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);
  // کنترل نمایش یا عدم نمایش پاپ‌آپ
  const isSomeSelected = state.selectedOrders.size > 0;
  const isAllSelected = state.selectedOrders.size === orders.length;

  return (
    <>
      <div
        className={styles.tableContainer}
        onMouseDown={handleMouseDown}
        onMouseLeave={() => setIsDragging(false)}
        onMouseUp={() => setIsDragging(false)}
        ref={tableContainerRef}>
        {/* نمایش پاپ‌آپ در صورت انتخاب شدن یک یا چند چک‌باکس */}

        <table className={styles.table}>
          <thead className={styles.headertable}>
            <tr>
              <th style={{ minWidth: "160px" }}>{labels.customer}</th>

              <th style={{ minWidth: "50px" }}>{labels.items}</th>

              <th style={{ minWidth: "85px" }}>{labels.deliverdate}</th>
              <th style={{ minWidth: "100px" }}>{labels.price}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={index} className={styles.row}>
                <td style={{ minWidth: "160px" }} className={`${styles.customer} translate`}>
                  <img
                    loading="lazy"
                    decoding="async"
                    src={order.customer.profilePic}
                    alt="profile"
                    className="instagramimage"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/no-profile.svg";
                    }}
                  />
                  <div className={`${styles.instagramprofiledetail} translate`}>
                    <div className="instagramusername">{order.customer.name}</div>
                    <div className="instagramid">{order.customer.username}</div>
                  </div>
                </td>
                <td style={{ minWidth: "50px" }} className={styles.items}>
                  {order.items}
                </td>{" "}
                <td style={{ minWidth: "85px" }} className={styles.date}>
                  {order.deliverDate}
                  {/* <span className={styles.day}>
                    {new DateObject(v.date).format("YYYY")}
                  </span>
                  /
                  <span className={styles.day}>
                    {new DateObject(v.date).format("MM")}
                  </span>
                  /
                  <span className={styles.day}>
                    {new DateObject(v.date).format("DD")}
                  </span>
                  <br></br>
                  <span className={styles.hour}>
                    {new DateObject(v.date).format("hh")}
                  </span>
                  :
                  <span className={styles.hour}>
                    {new DateObject(v.date).format("mm A")}
                  </span> */}
                </td>
                <td style={{ minWidth: "100px" }} className={styles.fee}>
                  <PriceFormater
                    fee={order.price}
                    pricetype={PriceType.Toman}
                    className={PriceFormaterClassName.PostPrice}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* پاپ‌آپ */}
    </>
  );
}
