import { ChangeEvent, JSXElementConstructor, ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "saeed/i18n";
import InputText from "../inputText";
import RingLoader from "../loader/ringLoder";
import styles from "./dragDrop.module.css";
const DragDrop = (props: {
  data: JSX.Element[];
  handleOptionSelect: (id: any) => void;
  searchMod?: boolean;
  externalSearchMod?: boolean;
  onExternalSearch?: (searchTerm: string) => void;
  item?: number;
  resetItemValue?: boolean;
  dangerBorder?: boolean;
  isRefresh?: boolean;
  isLoadingMoreItems?: boolean;
  handleGetMoreItems?: () => Promise<void>;
  externalSearchLoading?: boolean;
  externalSearchText?: string;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [closed, setClosed] = useState(true);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [itemValue, setItemValue] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [searchElements, setSearchElements] = useState<JSX.Element[]>([]);
  const [children, setChildren] = useState<JSX.Element[]>(props.data.filter((v) => v.props.id !== "0"));
  const [isSearch, setIsSearch] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [externalSearchText, setExternalSearchText] = useState(props.externalSearchText || "");

  function updateDropdownPosition() {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 300; // ارتفاع تقریبی منوی کشویی
      const shouldOpenUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
      setOpenUpwards(shouldOpenUpwards);
      setDropdownPosition({
        top: shouldOpenUpwards ? rect.top : rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    }
  }

  // تابع wrapper برای scroll event که شرط closed را بررسی می‌کند
  function handleScroll() {
    if (!closed) {
      updateDropdownPosition();
    }
  }

  // تابع برای تشخیص رسیدن به انتهای لیست و فراخوانی handleGetMoreItems
  function handleMenuScroll(e: React.UIEvent<HTMLDivElement>) {
    const target = e.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const threshold = 10; // آستانه پیکسلی برای شروع زودتر بارگذاری

    const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;

    if (isAtBottom && !hasReachedEnd && props.handleGetMoreItems) {
      setHasReachedEnd(true);
      props.handleGetMoreItems();
    }

    // اگر کاربر از انتها دور شد، وضعیت را reset کن
    if (!isAtBottom && hasReachedEnd) {
      setHasReachedEnd(false);
    }
  }

  function toggleOptions() {
    if (closed) {
      updateDropdownPosition();
      setIsVisible(true);
      setClosed(false);
      setHasReachedEnd(false); // reset state هنگام باز شدن
    } else {
      setIsClosing(true);
      setTimeout(() => {
        setClosed(true);
        setIsVisible(false);
        setIsClosing(false);
        setHasReachedEnd(false); // reset state هنگام بسته شدن
      }, 200); // مدت زمان انیمیشن بسته شدن
    }
  }
  function handleSelectIcon(index: number, id: any) {
    setItemValue(index);
    props.handleOptionSelect(id);
    // بسته شدن منو با تاخیر کوتاه برای اطمینان از اتمام انتخاب
    setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        setClosed(true);
        setIsVisible(false);
        setIsClosing(false);
        setHasReachedEnd(false); // reset state هنگام بسته شدن
      }, 200);
    }, 50);
  }
  function handleSelectItemFormSearch(id: any) {
    const itemIndex = props.data.findIndex((x) => x.props.id == id);
    setSearchText("");
    setItemValue(itemIndex);
    props.handleOptionSelect(id);
    setIsSearch(false);
    // بسته شدن منو با تاخیر کوتاه برای اطمینان از اتمام انتخاب
    setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        setClosed(true);
        setIsVisible(false);
        setIsClosing(false);
        setHasReachedEnd(false); // reset state هنگام بسته شدن
      }, 200);
    }, 50);
  }
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Node;
    // بررسی اینکه کلیک خارج از dropdown اصلی و منوی باز شده است
    const isClickOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);
    const isClickOutsideMenu = dropdownMenuRef.current && !dropdownMenuRef.current.contains(target);

    if (isClickOutsideDropdown && isClickOutsideMenu) {
      setIsClosing(true);
      setTimeout(() => {
        setClosed(true);
        setIsVisible(false);
        setIsClosing(false);
        setHasReachedEnd(false); // reset state هنگام بسته شدن
      }, 200);
    }
  }
  const { t } = useTranslation();
  function getTextContent(element: ReactNode): string {
    if (typeof element === "string") {
      return element;
    } else if (Array.isArray(element)) {
      return element.map(getTextContent).join(" ");
    } else if (typeof element === "object" && element !== null && "props" in element) {
      const el = element as ReactElement<any, string | JSXElementConstructor<any>>;
      return getTextContent(el.props.children);
    }
    return "";
  }
  function handleSearch(e: ChangeEvent<HTMLInputElement>) {
    var searchValue = e.target.value;
    if (searchValue.length === 0) {
      setSearchText("");
      setIsSearch(false);
      return;
    }
    setIsSearch(true);
    setSearchText(searchValue);
    const array = children.map((v) => v.props);
    let filteredArray = props.data.filter((item) => {
      const hasId = item.props.id !== "0";
      const textContent = getTextContent(item.props.children);
      const matchesSearch = textContent.toLowerCase().includes(searchValue.toLowerCase());
      return hasId && matchesSearch;
    });
    setSearchElements(filteredArray);
  }

  function handleExternalSearch(e: ChangeEvent<HTMLInputElement>) {
    const searchValue = e.target.value;
    setExternalSearchText(searchValue);

    // پاک کردن timeout قبلی
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchValue.length === 0) {
      // اگر جستجو خالی باشد، فوراً API را فراخوانی کن
      if (props.onExternalSearch) {
        props.onExternalSearch("");
      }
      return;
    }

    // تنظیم timeout جدید برای debounce (500ms وقفه)
    debounceTimerRef.current = setTimeout(() => {
      if (props.onExternalSearch) {
        props.onExternalSearch(searchValue);
      }
    }, 500);
  }
  useEffect(() => {
    if (!closed) {
      setIsVisible(true);
      document.addEventListener("mousedown", handleClickOutside);
      // اضافه کردن event listener برای scroll
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleScroll);

      // به‌روزرسانی externalSearchText وقتی dropdown باز می‌شود
      if (props.externalSearchText !== undefined) {
        // پاک کردن timeout جاری برای جلوگیری از تداخل
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        // تاخیر کوچک برای جلوگیری از تداخل با debounce
        setTimeout(() => {
          setExternalSearchText(props.externalSearchText || "");
        }, 50);
      }
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      // حذف event listener برای scroll
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
      setSearchText("");
      setIsSearch(false);
      setExternalSearchText("");
      // پاک کردن timeout هنگام cleanup
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [closed]);
  useEffect(() => {
    if (props.resetItemValue) setItemValue(0);
  }, [props.resetItemValue]);
  useEffect(() => {
    if (props.item !== undefined) setItemValue(props.item);
  }, [props.isRefresh]);

  // Cleanup timeout هنگام unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // پورتال منوی بازشونده
  const dropdownMenu =
    isVisible && dropdownPosition
      ? ReactDOM.createPortal(
          <div
            ref={dropdownMenuRef}
            className={
              isClosing
                ? openUpwards
                  ? styles.dropupClosing
                  : styles.dropdownClosing
                : openUpwards
                ? styles.dropup
                : styles.dropdown
            }
            style={{
              position: "fixed",
              top: !openUpwards ? dropdownPosition.top : undefined,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              bottom: openUpwards ? window.innerHeight - dropdownPosition.top : undefined,
              zIndex: 9999,
              maxHeight: "300px",
              overflowY: "auto",
            }}
            onScroll={handleMenuScroll}
            onClick={(e) => {
              // جلوگیری از بسته شدن منو هنگام کلیک روی محتوای داخلی
              e.stopPropagation();
            }}>
            {props.searchMod && (
              <div
                style={{ margin: "5px" }}
                onClick={(e) => {
                  e.stopPropagation();
                }}>
                <InputText className={"serachMenuBar"} handleInputChange={handleSearch} value={searchText} />
              </div>
            )}
            {props.externalSearchMod && (
              <div
                style={{ margin: "5px" }}
                onClick={(e) => {
                  e.stopPropagation();
                }}>
                <InputText
                  className={"serachMenuBar"}
                  handleInputChange={handleExternalSearch}
                  value={externalSearchText}
                />
              </div>
            )}
            {props.externalSearchLoading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "20px",
                }}>
                <RingLoader />
              </div>
            ) : (
              <>
                {!isSearch &&
                  props.data.map((option, index) => (
                    <div
                      className={`${styles.option} ${index === itemValue ? styles.selectedOption : ""}`}
                      key={index}
                      onClick={() => {
                        handleSelectIcon(index, option.props.id);
                      }}>
                      <div className={styles.title}>{option}</div>
                      {index === itemValue && (
                        <svg fill="none" height="8" viewBox="0 0 80 70">
                          <path
                            d="M70 15 28.7 60 10 39.5"
                            stroke="var(--color-light-blue)"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="20"></path>
                        </svg>
                      )}
                    </div>
                  ))}
                {isSearch &&
                  searchElements.length > 0 &&
                  searchElements.map((option, index) => (
                    <div
                      className={`${styles.option} ${index === itemValue ? styles.selectedOption : ""}`}
                      key={index}
                      onClick={() => {
                        handleSelectItemFormSearch(option.props.id);
                      }}>
                      <div className={styles.title}>{option}</div>
                      {index === itemValue && (
                        <svg fill="none" height="8" viewBox="0 0 80 70">
                          <path
                            d="M70 15 28.7 60 10 39.5"
                            stroke="var(--color-light-blue)"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="20"></path>
                        </svg>
                      )}
                    </div>
                  ))}
                {isSearch && searchElements.length === 0 && (
                  <div className={styles.option}>{t(LanguageKey.noresult)}</div>
                )}
              </>
            )}
            {props.isLoadingMoreItems && <RingLoader />}
          </div>,
          document.body
        )
      : null;

  return (
    props.data && (
      <>
        <div
          ref={dropdownRef}
          className={`${props.dangerBorder && itemValue === 0 ? styles.dangerselectbox : styles.selectbox} ${
            !closed ? styles.activeSelectbox : ""
          }`}
          onClick={toggleOptions}>
          <div className={styles.selectoption}>
            <div className={styles.titleheader}>{props.data[itemValue]}</div>
            <svg className={`${styles.arrowIcon} ${!closed ? styles.rotateArrow : ""}`} height="6" viewBox="0 0 12 6.5">
              <path d="M0 1.1.4.3A1 1 0 0 1 2 .3l3.4 3.4.6.2.7-.2L10.1.3a1 1 0 0 1 1.6 0 1 1 0 0 1 0 1.6L8.3 5.3a3 3 0 0 1-2.3 1 3 3 0 0 1-2.3-1L.4 1.9z" />
            </svg>
          </div>
        </div>
        {dropdownMenu}
      </>
    )
  );
};

export default DragDrop;
