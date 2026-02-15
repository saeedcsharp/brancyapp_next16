import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InputText from "saeed/components/design/inputText";
import RadioButton from "saeed/components/design/radioButton";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import System from "saeed/components/setting/general/system";
import UserPartners from "saeed/components/userPanel/setting/partner";
import { LanguageKey } from "saeed/i18n";
import { IRefreshToken } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { GetServerResult, MethodType } from "saeed/helper/apihelper";
import { IPartner_User } from "saeed/models/userPanel/setting";
import styles from "./setting.module.css";
function InputField({
  label,
  placeholder,
  maxLength,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  maxLength: number;
  value: string;
  className?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="headerandinput">
      <div className="headertext">{label}</div>
      <div className="headerparent">
        <InputText
          placeHolder={placeholder}
          maxLength={maxLength}
          className="textinputbox"
          handleInputChange={onChange}
          value={value}
        />
      </div>
    </div>
  );
}
function Setting() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session, update } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  // state برای نگهداری تصویر پروفایل
  const [profileImage, setProfileImage] = useState<string | null>(null);
  // تابع برای آپلود تصویر پروفایل
  const handleProfileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imageUrl = URL.createObjectURL(e.target.files[0]);
      setProfileImage(imageUrl); // ذخیره تصویر آپلود شده
    }
  };
  const [formData, setFormData] = useState({
    name: "",
    instagramid: "",
    nationalCode: "",
    birthDay: "",
    mobile: "",
    email: "",
    creditNumber: "",
  });
  const [bankName, setBankName] = useState<string>(""); // برای نمایش نام بانک
  const banks: { [key: string]: string } = {
    "606373": "بانک قرض‌الحسنه مهر ایران",
    "627648": "بانک توسعه صادرات ایران",
    "636949": "بانک حکمت ایرانیان",
    "627412": "بانک اقتصاد نوین",
    "502908": "بانک توسعه تعاون",
    "627961": "بانک صنعت و معدن",
    "505785": "بانک ایران زمین",
    "627760": "پست بانک ایران",
    "603799": "بانک ملی ایران",
    "639194": "بانک مهر ایران",
    "502229": "بانک پاسارگاد",
    "627488": "بانک کارآفرین",
    "603770": "بانک کشاورزی",
    "622106": "بانک پارسیان",
    "639607": "بانک سرمایه",
    "621986": "بانک سامان",
    "636214": "بانک آینده",
    "628157": "بانک انصار",
    "639346": "بانک سینا",
    "628023": "بانک مسکن",
    "589210": "بانک سپه",
  };

  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState(false); // پاپ‌آپ حذف
  const [newAddress, setNewAddress] = useState({
    subject: "",
    name: "",
    phone: "",
    zipCode: "",
    address: "",
  });
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null); // برای انتخاب آدرس
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null); // آدرس برای حذف

  const [nationalCodeError, setNationalCodeError] = useState<string | null>(null);
  const [partners, setPartners] = useState<IPartner_User[] | null>(null);

  // اضافه کردن state های جدید فقط برای دو کارت اول
  const [isPersonalInfoHidden, setIsPersonalInfoHidden] = useState(false);
  const [isAddressesHidden, setIsAddressesHidden] = useState(false);

  // تابع برای تعیین کلاس استایل بر اساس خطا
  const getInputClass = (fieldName: string) => {
    switch (fieldName) {
      case "nationalCode":
        return nationalCodeError ? "danger" : "textinputbox";
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(formData.email) ? "textinputbox" : "danger";
      case "mobile":
        const mobileRegex = /^09\d{9}$/;
        return mobileRegex.test(formData.mobile) ? "textinputbox" : "danger";
      case "creditNumber":
        return formData.creditNumber.length === 16 ? "textinputbox" : "danger";
      default:
        return "textinputbox"; // کلاس پیش‌فرض
    }
  };

  // بررسی وضعیت فرم و فعال یا غیرفعال کردن دکمه
  useEffect(() => {
    const isEmailValid = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const isMobileValid = (mobile: string) => {
      const mobileRegex = /^09\d{9}$/; // شماره موبایل باید با 09 شروع شود و دقیقاً ۱۱ رقم باشد
      return mobileRegex.test(mobile);
    };

    const isValid =
      formData.name.trim() !== "" &&
      formData.instagramid.trim() !== "" &&
      formData.nationalCode.trim() !== "" &&
      formData.birthDay.trim() !== "" &&
      formData.mobile.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.creditNumber.trim() !== "" &&
      nationalCodeError === null && // کد ملی باید بدون خطا باشد
      isEmailValid(formData.email) && // فرمت ایمیل معتبر باشد
      formData.creditNumber.length === 16 && // شماره کارت ۱۶ رقم باشد
      isMobileValid(formData.mobile); // شماره موبایل معتبر باشد

    setIsFormValid(isValid);
  }, [formData, nationalCodeError]);

  // توابع onChange برای هر فیلد به صورت جداگانه
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleInstagramIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, instagramid: e.target.value });
  };

  const handleNationalCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setFormData({ ...formData, nationalCode: value });
      checkMelliCode(value);
    }
  };

  // شروع بررسی کد ملی
  const checkMelliCode = (meliCode: string) => {
    if (meliCode.length === 10) {
      if (
        meliCode === "1111111111" ||
        meliCode === "0000000000" ||
        meliCode === "2222222222" ||
        meliCode === "3333333333" ||
        meliCode === "4444444444" ||
        meliCode === "5555555555" ||
        meliCode === "6666666666" ||
        meliCode === "7777777777" ||
        meliCode === "8888888888" ||
        meliCode === "9999999999"
      ) {
        setNationalCodeError("کد ملی صحیح نمی باشد");
        return false;
      }

      let n = 0;
      for (let i = 0; i < 9; i++) {
        n += parseInt(meliCode.charAt(i)) * (10 - i);
      }

      const c = parseInt(meliCode.charAt(9));
      const r = n % 11;

      if ((r === 0 && r === c) || (r === 1 && c === 1) || (r > 1 && c === 11 - r)) {
        setNationalCodeError(null); // کد ملی صحیح است
        return true;
      } else {
        setNationalCodeError("کد ملی صحیح نمی باشد");
        return false;
      }
    } else {
      setNationalCodeError("کد ملی باید ۱۰ رقم باشد");
      return false;
    }
  };

  const handleBirthDayChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, birthDay: e.target.value });
  };

  const handleMobileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      // فقط عدد اجازه داده می‌شود
      setFormData({ ...formData, mobile: value });
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
  };

  const handleCreditNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setFormData({ ...formData, creditNumber: value });

      // بررسی پیش‌شماره کارت
      if (value.length >= 6) {
        const prefix = value.slice(0, 6);
        setBankName(banks[prefix] || "بانک نامشخص");
      } else {
        setBankName(""); // اگر کمتر از ۶ رقم باشد، نام بانک نمایش داده نمی‌شود
      }
    }
  };

  const handleAddressChange = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
    setNewAddress({ ...newAddress, [key]: e.target.value });
  };

  const togglePopup = (addressIndex: number | null = null) => {
    setPopupVisible((prevState) => !prevState);
    if (addressIndex !== null) {
      const selected = addresses[addressIndex];
      setNewAddress(selected);
      setSelectedAddress(addressIndex); // برای ویرایش آدرس
    } else {
      setNewAddress({
        subject: "",
        name: "",
        phone: "",
        zipCode: "",
        address: "",
      });
      setSelectedAddress(null); // برای آدرس جدید
    }
  };

  const validateForm = () => {
    return newAddress.name.trim() && newAddress.phone.trim() && newAddress.zipCode.trim() && newAddress.address.trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAddress !== null) {
      // اگر آدرس انتخاب شده داریم، اطلاعات آدرس را به روز کنیم
      const updatedAddresses = [...addresses];
      updatedAddresses[selectedAddress] = newAddress;
      setAddresses(updatedAddresses);
    } else {
      // اگر آدرس جدید است، آن را به لیست اضافه کنیم
      setAddresses([...addresses, newAddress]);
    }
    setPopupVisible(false); // بعد از ارسال فرم، پاپ‌آپ بسته می‌شود
  };

  const handleDelete = () => {
    if (addressToDelete !== null) {
      const updatedAddresses = addresses.filter((_, index) => index !== addressToDelete);
      setAddresses(updatedAddresses);
    }
    setDeletePopupVisible(false); // بعد از حذف آدرس، پاپ‌آپ حذف بسته می‌شود
  };

  const cancelDelete = () => {
    setDeletePopupVisible(false); // با cancel کردن، پاپ‌آپ بسته می‌شود
  };

  async function handleGetNextPartners(id: string) {
    try {
      const res = await GetServerResult<boolean, IPartner_User[]>(
        MethodType.get,
        session,
        "user/Session/GetPartners",
        null,
        [{ key: "nextMaxId", value: id }]
      );
      if (res.succeeded) {
        setPartners((prev) => [...prev!, ...res.value]);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function refreshToken(id: number) {
    try {
      const res = await GetServerResult<boolean, IRefreshToken>(MethodType.get, session, "user/RefreshToken");
      if (res.succeeded) {
        const instagramerIds = res.value.role.instagramerIds;
        const newCurrentIndex = instagramerIds.indexOf(id);
        await update({
          ...session,
          user: {
            // ...session?.user,
            expireTime: res.value.expireTime,
            id: res.value.id,
            instagramerIds: res.value.role.instagramerIds,
            accessToken: res.value.token,
            socketAccessToken: res.value.socketAccessToken,
            currentIndex: newCurrentIndex,
          },
        });
        console.log("newCurrentIndex", res.value);
        router.replace("/");
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleApprovePartner(id: number) {
    try {
      const res = await GetServerResult<boolean, boolean>(
        MethodType.get,
        session,
        "user/Session/ApprovePartnerRequest",
        null,
        [{ key: "instagramerId", value: id.toString() }]
      );
      if (res.succeeded) {
        setPartners((prev) => prev!.map((x) => (x.instagramerId === id ? { ...x, approved: true } : x)));
        await refreshToken(id);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleRejectPartner(id: number) {
    try {
      const res = await GetServerResult<boolean, boolean>(
        MethodType.get,
        session,
        "user/Session/RejectPartnerRequest",
        null,
        [{ key: "instagramerId", value: id.toString() }]
      );
      if (res.succeeded) {
        setPartners((prev) => prev!.filter((x) => x.instagramerId !== id));
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function fetchData() {
    try {
      const res = await GetServerResult<boolean, IPartner_User[]>(MethodType.get, session, "user/Session/GetPartners");
      if (res.succeeded) {
        setPartners(res.value);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  useEffect(() => {
    if (!session) return;
    fetchData();
  }, [session]);

  if (session && session.user.currentIndex !== -1) router.push("/");

  // اضافه کردن state های جدید برای کنترل نمایش کارت‌ها
  const [isSystemHidden, setIsSystemHidden] = useState(false);
  const [isPartnersHidden, setIsPartnersHidden] = useState(false);

  return (
    session?.user.currentIndex === -1 && (
      <>
        <div className="pinContainer">
          <div className="tooBigCard" style={{ gridRowEnd: isPersonalInfoHidden ? "span 10" : "" }}>
            <div
              className="headerChild"
              title="↕ Resize the Card"
              role="button"
              aria-label="Toggle settings visibility"
              onClick={() => setIsPersonalInfoHidden(!isPersonalInfoHidden)}
              aria-expanded={!isPersonalInfoHidden}>
              <div className="circle" aria-hidden="true"></div>
              <div className="Title" role="heading" aria-level={2} aria-label={t(LanguageKey.userpanel_PersonalInfo)}>
                {t(LanguageKey.userpanel_PersonalInfo)}
              </div>
            </div>

            <div
              className={`${styles.all} ${isPersonalInfoHidden ? "" : styles.show}`}
              aria-hidden={isPersonalInfoHidden}>
              <div className={styles.sectioncontent}>
                <div className="headerparent">
                  <img
                    loading="lazy"
                    decoding="async"
                    className={styles.profilepicture}
                    title="ℹ️ Profile Picture"
                    src={profileImage || "/no-profile.svg"}
                  />
                  <>
                    <input
                      type="file"
                      accept="image/* "
                      onChange={handleProfileImageChange}
                      style={{ display: "none" }}
                      id="profileImageInput"
                    />
                    <label className="cancelButton" htmlFor="profileImageInput" style={{ cursor: "pointer" }}>
                      {t(LanguageKey.userpanel_UploadNewPicture)}
                    </label>
                  </>
                </div>
                {/* فیلدهای اطلاعات */}
                <div className="headerandinput">
                  <div className="headertext">{t(LanguageKey.userpanel_Instagramid)}</div>
                  <div className="headerparent">
                    <InputText
                      placeHolder="Enter your instagram ID"
                      maxLength={200}
                      className="textinputbox"
                      handleInputChange={handleInstagramIdChange}
                      value={formData.instagramid}
                    />
                  </div>
                </div>

                {/* <div className="headerandinput">
                <div className="headertext">
                  {t(LanguageKey.userpanel_Nameandfamily)}
                </div>
                <div className="headerparent">
                  <InputText
                    placeHolder="Enter your name"
                    maxLength={200}
                    className="textinputbox"
                    handleInputChange={handleNameChange}
                    value={formData.name}
                  />
                </div>
              </div> */}

                <div className="headerandinput">
                  <div className="headertext">{t(LanguageKey.userpanel_NationalCode)}</div>
                  <div className="headerparent">
                    <InputText
                      placeHolder="Enter your national code"
                      maxLength={10}
                      className={getInputClass("nationalCode")} // تعیین کلاس بر اساس وضعیت
                      handleInputChange={handleNationalCodeChange}
                      value={formData.nationalCode}
                    />
                  </div>
                  {nationalCodeError && <div className={styles.error}>{nationalCodeError}</div>}
                </div>

                <div className="headerandinput">
                  <div className="headertext">{t(LanguageKey.userpanel_BirthDay)}</div>
                  <div className="headerparent">
                    <InputText
                      placeHolder="Enter your birth day"
                      maxLength={200}
                      className="textinputbox"
                      handleInputChange={handleBirthDayChange}
                      value={formData.birthDay}
                    />
                  </div>
                </div>

                <div className="headerandinput">
                  <div className="headertext">{t(LanguageKey.userpanel_MobileNumber)}</div>
                  <div className="headerparent">
                    <InputText
                      placeHolder="Enter your mobile number"
                      maxLength={11}
                      className={getInputClass("mobile")} // تعیین کلاس بر اساس وضعیت
                      handleInputChange={handleMobileChange}
                      value={formData.mobile}
                    />
                  </div>
                </div>

                <div className="headerandinput">
                  <div className="headertext">{t(LanguageKey.userpanel_Email)}</div>
                  <div className="headerparent">
                    <InputText
                      placeHolder="Enter your email"
                      maxLength={200}
                      className={getInputClass("email")} // تعیین کلاس بر اساس وضعیت
                      handleInputChange={handleEmailChange}
                      value={formData.email}
                    />
                  </div>
                </div>

                <div className="headerandinput">
                  <div className="headertext">{t(LanguageKey.userpanel_CreditNumber)}</div>
                  <div className="headerparent">
                    <InputText
                      placeHolder="Enter your credit number"
                      maxLength={16}
                      className={getInputClass("creditNumber")} // تعیین کلاس بر اساس وضعیت
                      handleInputChange={handleCreditNumberChange}
                      value={formData.creditNumber}
                    />
                  </div>
                  {bankName && (
                    <div className={bankName === "بانک نامشخص" ? styles.error : styles.success}>{bankName}</div>
                  )}
                </div>
              </div>
              <div className="ButtonContainer">
                <button className={isFormValid ? "saveButton" : "disableButton"} disabled={!isFormValid}>
                  {t(LanguageKey.save)}
                </button>
              </div>
            </div>
          </div>

          <div className="tooBigCard" style={{ gridRowEnd: isAddressesHidden ? "span 10" : "" }}>
            <div
              className="headerChild"
              title="↕ Resize the Card"
              role="button"
              aria-label="Toggle settings visibility"
              onClick={() => setIsAddressesHidden(!isAddressesHidden)}
              aria-expanded={!isAddressesHidden}>
              <div className="circle" aria-hidden="true"></div>
              <div className="Title" role="heading" aria-level={2} aria-label={t(LanguageKey.userpanel_Addresses)}>
                {t(LanguageKey.userpanel_Addresses)}
              </div>
            </div>

            <div className={`${styles.all} ${isAddressesHidden ? "" : styles.show}`} aria-hidden={isAddressesHidden}>
              <div className={styles.addaddress} onClick={() => togglePopup()}>
                <svg width="30px" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                  <path
                    opacity=".3"
                    d="M4.5 10.63a14.8 14.8 0 0 1 27 0c2.14 4.98.99 9.22-1.41 12.86-2 3.02-4.91 5.7-7.53 8.12l-1.36 1.26a4.67 4.67 0 0 1-6.4 0q-.69-.66-1.44-1.34c-2.6-2.4-5.47-5.06-7.44-8.04-2.4-3.63-3.56-7.88-1.42-12.86"
                    fill="var(--color-dark-blue)"
                  />
                  <path
                    d="M18 9.75c.83 0 1.5.67 1.5 1.5V15h3.75a1.5 1.5 0 1 1 0 3H19.5v3.75a1.5 1.5 0 1 1-3 0V18h-3.75a1.5 1.5 0 1 1 0-3h3.75v-3.75c0-.83.67-1.5 1.5-1.5"
                    fill="var(--color-dark-blue)"
                  />
                </svg>
                {t(LanguageKey.userpanel_AddNewAddress)}
              </div>

              {/* لیست آدرس‌ها */}
              <div className={styles.sectioncontent}>
                {addresses.map((address, index) => (
                  <div key={index} className="headerandinput">
                    <div className="headerparent">
                      <RadioButton
                        name={`address ${index}`}
                        id={address.subject || `address ${index + 1}`}
                        checked={selectedAddress === index}
                        handleOptionChanged={() => setSelectedAddress(index)}
                        textlabel={address.subject || `address ${index + 1}`}
                        title={"default"}
                      />
                      <div className={styles.moreicon}>
                        <img
                          style={{
                            cursor: "pointer",
                            width: "20px",
                            height: "20px",
                          }}
                          title="ℹ️ Edit this Address"
                          src="/edit-1.svg"
                          onClick={() => togglePopup(index)}
                        />
                        <img
                          style={{
                            cursor: "pointer",
                            width: "20px",
                            height: "20px",
                          }}
                          title="ℹ️ Delete Address"
                          src="/delete.svg"
                          onClick={() => {
                            setAddressToDelete(index);
                            setDeletePopupVisible(true);
                          }}
                        />
                      </div>
                    </div>
                    <div className={styles.address}>
                      <div className="headerparent" style={{ alignItems: "flex-start" }}>
                        <svg
                          className={styles.icon}
                          fill="none"
                          width="35px"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 36 36">
                          <path d="m26.71 22.256.633.363c1.07.603 2.686 1.515 3.793 2.6.693.677 1.35 1.57 1.47 2.664.127 1.164-.38 2.256-1.399 3.226-1.757 1.674-3.866 3.016-6.593 3.016H11.387c-2.728 0-4.837-1.342-6.594-3.016-1.018-.97-1.526-2.062-1.399-3.226.12-1.094.778-1.987 1.47-2.665 1.108-1.084 2.724-1.996 3.793-2.599l.634-.363c5.331-3.175 12.088-3.175 17.42 0" />
                          <path opacity=".4" d="M10.125 9.75a7.875 7.875 0 1 1 15.75 0 7.875 7.875 0 0 1-15.75 0" />
                        </svg>
                        <div className="headerandinput">
                          <div className="explain" style={{ gap: "var(--gap-5)" }}>
                            {t(LanguageKey.userpanel_Nameandfamily)}
                          </div>
                          <div className="title">{address.name}</div>
                        </div>
                      </div>
                      <div className="headerparent" style={{ alignItems: "flex-start" }}>
                        <svg className={styles.icon} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                          <path
                            d="M32.87 24.43c-.07-.87-.17-1.84-1.03-2.33s-6.75-2.24-8.3-2.24-2.04 1.76-2.84 2.26-6.4-6.13-6.78-6.84c-.4-.7 2.45-1.16 1.95-3.74C15.44 9.36 13.86 3 11.1 3H6.7c-4.9-.07-3.82 6.02-2.95 9.02C7.33 23.54 15.15 30.57 27 32.93c2.57.27 5.65-.13 5.9-3.28q.21-2.6 0-5.2"
                            fillOpacity=".4"
                            stroke="var(--color-gray)"
                            strokeWidth="2"
                          />
                        </svg>
                        <div className="headerandinput">
                          <div className="explain" style={{ gap: "var(--gap-5)" }}>
                            {t(LanguageKey.userpanel_MobileNumber)}
                          </div>
                          <div className="title">{address.phone}</div>
                        </div>
                      </div>
                      <div className="headerparent" style={{ alignItems: "flex-start" }}>
                        <svg className={styles.icon} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                          <path
                            opacity=".4"
                            d="M4.5 10.63a14.8 14.8 0 0 1 27 0c2.14 4.98.99 9.22-1.41 12.86-2 3.02-4.91 5.7-7.53 8.12l-1.36 1.26a4.67 4.67 0 0 1-6.4 0q-.69-.66-1.44-1.34c-2.6-2.4-5.47-5.06-7.44-8.04-2.4-3.63-3.56-7.88-1.42-12.86"
                          />
                          <path d="M25.1 19.5v-7.33c0-.65-.43-1.07-.85-1.36-.4-.28-1-.58-1.7-.92l-3.48-1.74c-.33-.16-.68-.34-1.07-.34-.4 0-.74.18-1.07.34L13.45 9.9l-1.7.92c-.42.3-.85.71-.85 1.36v7.33c0 .64.43 1.06.85 1.35.4.29 1 .58 1.7.93l3.48 1.73c.33.17.68.34 1.07.34.4 0 .74-.17 1.07-.34l3.48-1.73 1.7-.93c.42-.29.85-.7.85-1.35m-7.79-3.14v5.8l-3.2-1.59-1.58-.85c-.15-.1-.26-.23-.26-.23v-5.65l1.23.63 3.43 1.7zm5.24-1.91 1.18-.6-.01 5.65s-.1.12-.25.22c-.32.23-.82.48-1.58.86l-3.2 1.59v-5.8l.46-.23z" />
                        </svg>
                        <div className="headerandinput">
                          <div className="explain" style={{ gap: "var(--gap-5)" }}>
                            {t(LanguageKey.userpanel_ZipCode)}
                          </div>
                          <div className="title">{address.zipCode}</div>
                        </div>
                      </div>
                      <div className="headerparent" style={{ alignItems: "flex-start" }}>
                        <svg className={styles.icon} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                          <path d="M13.5 13.5a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0 M9 24.64c.68.47.85 1.4.38 2.09a18 18 0 0 0-1.7 2.78c-.25.61-.17.79-.15.83l.1.17c.05.08.25.32 1.37.47 1.1.14 2.65.15 4.92.15h8.16l4.92-.15c1.12-.15 1.32-.4 1.38-.47l.1-.17c.01-.04.1-.22-.16-.83-.28-.65-.82-1.52-1.7-2.78a1.5 1.5 0 0 1 2.47-1.7 20 20 0 0 1 1.99 3.31c.42 1.01.64 2.14.11 3.27q-.14.3-.33.57c-.8 1.2-2.15 1.6-3.47 1.77-1.32.18-3.07.18-5.2.18H13.8c-2.13 0-3.88 0-5.2-.18s-2.67-.57-3.47-1.77a4 4 0 0 1-.33-.57c-.52-1.13-.31-2.26.11-3.27.42-.97 1.13-2.07 1.99-3.32a1.5 1.5 0 0 1 2.1-.38" />
                          <path
                            opacity=".4"
                            d="M7.26 9.02A11.7 11.7 0 0 1 18 1.88a11.7 11.7 0 0 1 10.74 7.14c1.69 4.06.77 7.53-1.12 10.48-1.57 2.44-3.86 4.62-5.9 6.55l-1.05 1a3.84 3.84 0 0 1-5.34 0l-1.11-1.07c-2.02-1.92-4.28-4.07-5.83-6.48-1.9-2.95-2.82-6.4-1.13-10.48"
                          />
                        </svg>
                        <div className="headerandinput">
                          <div className="explain" style={{ gap: "var(--gap-5)" }}>
                            {t(LanguageKey.userpanel_Address)}
                          </div>
                          <div className="title">{address.address}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <System />
          <UserPartners
            partners={partners}
            handleApprovePartner={handleApprovePartner}
            handleRejectPartner={handleRejectPartner}
            handleGetNextPartners={handleGetNextPartners}
          />
        </div>

        {/* پاپ آپ فرم اضافه کردن یا ویرایش آدرس */}
        {popupVisible && (
          <>
            <div className="dialogBg" onClick={() => setPopupVisible(false)} />
            <div className="popup">
              <div className="headerandinput">
                <div className="title">
                  {selectedAddress !== null
                    ? t(LanguageKey.userpanel_EditAddress)
                    : t(LanguageKey.userpanel_AddNewAddress)}
                </div>
                <div className="explain">{t(LanguageKey.userpanel_AddNewAddressexplain)}</div>
              </div>
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.popupContent}>
                  <InputField
                    label={t(LanguageKey.SettingGeneral_Title)}
                    placeholder="Address 01"
                    maxLength={100}
                    value={newAddress.subject}
                    onChange={handleAddressChange("subject")}
                  />

                  <InputField
                    label={t(LanguageKey.userpanel_Nameandfamily)}
                    placeholder="John Doe"
                    maxLength={100}
                    value={newAddress.name}
                    onChange={handleAddressChange("name")}
                  />

                  <InputField
                    label={t(LanguageKey.userpanel_MobileNumber)}
                    placeholder="+123456789"
                    maxLength={15}
                    value={newAddress.phone}
                    onChange={handleAddressChange("phone")}
                  />

                  <InputField
                    label={t(LanguageKey.userpanel_ZipCode)}
                    placeholder="12345"
                    maxLength={10}
                    value={newAddress.zipCode}
                    onChange={handleAddressChange("zipCode")}
                  />

                  <InputField
                    label={t(LanguageKey.userpanel_Address)}
                    placeholder="8 North Street London NW39 1VG"
                    maxLength={200}
                    value={newAddress.address}
                    onChange={handleAddressChange("address")}
                  />
                </div>
                <div className="ButtonContainer">
                  <button type="button" className="cancelButton" onClick={() => setPopupVisible(false)}>
                    {t(LanguageKey.cancel)}
                  </button>
                  <button
                    type="submit"
                    className={validateForm() ? "saveButton" : "disableButton"}
                    disabled={!validateForm()}>
                    {t(LanguageKey.save)}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* پاپ‌آپ حذف آدرس */}
        {deletePopupVisible && (
          <>
            <div className="dialogBg" onClick={cancelDelete} />
            <div className={styles.popupdelete}>
              <div className="headerandinput">
                <img
                  onClick={cancelDelete}
                  style={{
                    cursor: "pointer",
                    width: "30px",
                    height: "30px",
                    alignSelf: "end",
                  }}
                  title="ℹ️ close"
                  src="/close-box.svg"
                />

                <svg fill="none" height="100px" viewBox="0 0 160 116">
                  <path
                    fill="var(--color-dark-blue60)"
                    d="M153.3 38a6.7 6.7 0 1 1 0 13.4H115a6.7 6.7 0 1 1 0 13.4h21a6.7 6.7 0 1 1 0 13.4h-9.7c-4.7 0-8.5 3-8.5 6.7q0 3.7 5.8 6.7a6.7 6.7 0 1 1 0 13.4H44a6.7 6.7 0 1 1 0-13.4H6.7a6.7 6.7 0 1 1 0-13.4H45a6.7 6.7 0 1 0 0-13.4H21a6.7 6.7 0 1 1 0-13.4h38.4a6.7 6.7 0 1 1 0-13.4zm0 26.8a6.7 6.7 0 1 1 0 13.4 6.7 6.7 0 0 1 0-13.4"></path>
                  <path fill="var(--background-root)" d="M82.5 110a41.5 41.5 0 1 0 0-83 41.5 41.5 0 0 0 0 83"></path>
                  <path
                    stroke="var(--color-dark-blue60)"
                    strokeWidth="2"
                    d="M111 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
                  <path
                    fill="var(--color-dark-blue60)"
                    d="M141 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6M39 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6"></path>
                  <path
                    fill="var(--color-dark-blue)"
                    d="M122.6 8q2-.1 3.8 1 2 1 2.5 3.3a4 4 0 0 1-1 3.7l-2.4 2.2-.7.6q-.7.7-.7 1.7-.2 1.2-1.4 1.4c-1.3.3-2.4-.5-2.4-1.7q-.1-1.6.7-2.8l1.5-1.7 1.7-1.5q.8-.6.4-1.7-.5-1-1.5-1H122q-.9 0-1.3.9l-.6 1.3q-.2.7-.8 1.2c-.7.5-2 .4-2.6-.2q-1-1-.6-2.4a6 6 0 0 1 3-3.5q1.8-.8 3.5-.8m0 1q-1.8-.1-3.5 1-1.5 1-2 2.6v1q0 .7 1 .7a1 1 0 0 0 .9-.5l.1-.3.5-1.2q.5-1.4 2.2-1.8 1.5-.2 3 .6 1 1 .8 2.6-.3.9-1 1.6l-2.2 1.9q-1.3 1.2-1.2 3 0 .5.5.7 1 .5 1.4-.6.3-1.6 1.6-2.7l2.2-2a3.4 3.4 0 0 0 .8-3.9q-.4-1.2-1.6-1.9-1.5-.9-3.4-.9M124 25a2 2 0 0 1-2 2c-1 0-2-.8-2-2s1-2 2-2a2 2 0 0 1 2 2m-1 0a1 1 0 0 0-1-1.1q-1 .1-1 1 0 1.2 1 1.2t1-1M24.6 25q2-.1 3.8 1 2 1 2.5 3.3a4 4 0 0 1-1 3.7l-2.4 2.2-.7.6q-.7.7-.7 1.7-.3 1.2-1.4 1.5c-1.3.2-2.4-.6-2.4-1.8q-.1-1.5.7-2.8l1.5-1.7 1.7-1.5q.8-.6.4-1.7-.4-1-1.5-1H24q-.9 0-1.3.9l-.6 1.3q-.2.7-.8 1.2c-.7.5-2 .4-2.6-.2q-1-1-.6-2.4a6 6 0 0 1 3-3.5q1.8-.9 3.5-.8m0 1q-1.8-.1-3.5 1-1.5 1-2 2.6v1q0 .6 1 .7a1 1 0 0 0 .9-.5l.1-.3.5-1.2q.5-1.4 2.2-1.8 1.5-.2 3 .6 1 1 .8 2.6-.3.9-1 1.6l-2.2 1.9q-1.3 1.2-1.2 3 0 .5.5.7 1 .5 1.4-.6.3-1.6 1.6-2.7l2.2-2a3.4 3.4 0 0 0 .8-3.9q-.4-1.2-1.6-1.9-1.5-.9-3.4-.9M26 42a2 2 0 0 1-2 2c-1 0-2-.8-2-2s1-2 2-2a2 2 0 0 1 2 2m-1 0a1 1 0 0 0-1-1.1q-1 .1-1 1 0 1.2 1 1.2t1-1M83.8 38q5.2-.1 9.6 2.3 5.2 3 6.4 8.7 1 5.5-2.7 9.5-2.9 3-6.1 5.8l-1.6 1.5C88.2 67 88 68.6 87.6 70q-.6 3.2-3.6 4c-3.3.7-6-1.4-6.2-4.6q-.1-4 1.8-7.1 1.6-2.5 4-4.3 2.2-1.9 4.2-3.9 2-1.9 1-4.3-1-2.5-3.7-2.9h-2.9q-2.2.4-3.3 2.4l-1.5 3.4a7 7 0 0 1-2 3 5.4 5.4 0 0 1-6.6-.2c-2-1.9-2-4-1.4-6.3q1.8-6.2 7.7-9.1a18 18 0 0 1 8.7-2m.1 2.4q-5-.1-9 2.6-4.1 2.5-5.2 7a5 5 0 0 0 0 2.2q.4 1.8 2.4 2 1.6 0 2.4-1.3l.4-.9 1.2-2.9c1.2-2.4 2.8-4.2 5.7-4.7 2.6-.4 5.2-.2 7.3 1.7q3.1 2.6 2.3 6.4a8 8 0 0 1-2.8 4.2l-5.3 4.9a9 9 0 0 0-3 7.7q0 1.3 1.3 2c1.3.5 3.2.4 3.5-1.7a11 11 0 0 1 4-7q2.9-2.4 5.5-4.9a9 9 0 0 0 2.2-10 10 10 0 0 0-4.1-5 16 16 0 0 0-8.8-2.3"></path>
                  <path
                    fill="var(--color-dark-blue)"
                    d="m127 55.8.1-.3.7 2.5a47 47 0 0 1-9.1 39.8q-.9.9-1.7.3t0-1.7q1.6-2 3-4.2a45 45 0 0 0-1.3-49 44.3 44.3 0 1 0-15.6 64.6l1-.6q1-.3 1.5.6a1 1 0 0 1-.5 1.4q-3 1.8-6.4 2.9l-6 1.8a47 47 0 0 1-48.9-19.6l-2.7-4.8a40 40 0 0 1-5-18.2 48 48 0 0 1 1-13.3 43 43 0 0 1 11.5-21.5 46 46 0 0 1 43-13.6A47 47 0 0 1 127 54.7zM88 85c0 2.9-2.1 5-5 5-2.7 0-5-2-5-5s2.4-5 5-5c2.9 0 5 2 5 5m-2.3 0c0-1.5-1-2.7-2.5-2.7a3 3 0 0 0-3 2.6c0 2 1.4 2.8 2.8 2.8s2.8-.8 2.7-2.6m22.5 22.9q-1 0-1.1-.8t.4-1.4l2.4-2 4.1-4.3q1-1 1.7-.2t0 1.9q-3.1 3.8-7 6.6z"></path>
                </svg>
              </div>
              <div className="headerandinput" style={{ textAlign: "center", alignItems: "center" }}>
                <div className="title">{t(LanguageKey.areyousure)}</div>
                <div className="explain translate">you are attempting to delete this address</div>
              </div>
              <div className="ButtonContainer">
                <button className="stopButton" type="button" onClick={handleDelete}>
                  {t(LanguageKey.delete)}
                </button>
              </div>
            </div>
          </>
        )}
      </>
    )
  );
}

export default Setting;
