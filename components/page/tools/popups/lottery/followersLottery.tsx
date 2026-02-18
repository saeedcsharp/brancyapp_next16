// import { useEffect, useState } from "react";
// import RadioButton from "saeed/components/design/radioButton";
// import { useSession } from "next-auth/react";
// import { useTranslation } from "react-i18next";
// import {
//   internalNotify,
//   InternalResponseType,
//   NotifType,
//   ResponseType,
// } from "saeed/components/notifications/notificationBox";
// import Loading from "saeed/components/notOk/loading";
// import NotBasePackage from "saeed/components/notOk/notBasePackage";
// import NotFeature from "saeed/components/notOk/notFeature";
// import NotPassword from "saeed/components/notOk/notPassword";
// import { LanguageKey } from "saeed/i18n";
// import { ILoadingStatus } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
// import { LoginStatus } from "saeed/models/_AccountInfo/LoginStatus";
// import { GetServerResult, MethodType } from "saeed/helper/api";
// import { FollowerLotteryType, IFollowerLottery } from "saeed/models/page/tools/tools";
// import styles from "./followerLottery.module.css";
// const FollowersLottery = (props: {
//   removeMask: () => void;
//   data: IFollowerLottery;
//   saveNormalWinnerPicker: (lottery: IFollowerLottery) => void;
// }) => {
//   const { data: session } = useSession();
//   const { t } = useTranslation();
//   const [winnerCount, setWinnerCount] = useState(props.data.winnerCount ? props.data.winnerCount : 1);
//   const [followerType, setFollowerType] = useState(
//     session?.user.isVerified && session?.user.loginStatus != LoginStatus.Success
//       ? FollowerLotteryType.BestEngagment
//       : props.data.followerLotteryType
//   );
//   const [loadinStatus, setLoadinStatus] = useState<ILoadingStatus>({
//     notBasePackage: false,
//     notFeature: false,
//     loading: true,
//     notPassword: false,
//     ok: false,
//     notBusiness: false,
//     notShopper: false,
//   });
//   function handleNextStep() {
//     props.saveNormalWinnerPicker({
//       followerLotteryType: followerType,
//       winnerCount: winnerCount,
//     });
//   }
//   async function checkAvailability() {
//     let instagramerId = session?.user.instagramerIds[session.user.currentIndex];
//     try {
//       var res = await GetServerResult<boolean, boolean>(
//         MethodType.get,
//         session?.user.accessToken,
//         "Instagramer/" + instagramerId + "/lottery/GetFollowerLotteryAvailability"
//       );
//       if (res.succeeded) setLoadinStatus((prev) => ({ ...prev, ok: true, loading: false }));
//       else if (res.info.responseType === ResponseType.FeatureRequiredInThisTime)
//         setLoadinStatus((prev) => ({
//           ...prev,
//           notFeature: true,
//           loading: false,
//         }));
//       else if (res.info.responseType === ResponseType.PackageRequiredInThisTime)
//         setLoadinStatus((prev) => ({
//           ...prev,
//           notBasePackage: true,
//           loading: false,
//         }));
//       else if (res.info.responseType === ResponseType.PasswordRequired)
//         setLoadinStatus((prev) => ({
//           ...prev,
//           notPassword: true,
//           loading: false,
//         }));
//     } catch (error) {
//       internalNotify(InternalResponseType.UnexpectedError, NotifType.Error);
//     }
//   }
//   useEffect(() => {
//     checkAvailability();
//   }, []);
//   return (
//     <>
//       <div onClick={props.removeMask} className="dialogBg"></div>
//       <div className={styles.followerLottery}>
//         <div className={styles.all}>
//           {loadinStatus.loading && <Loading />}
//           {loadinStatus.notBasePackage && <NotBasePackage />}
//           {loadinStatus.notFeature && <NotFeature />}
//           {loadinStatus.notPassword && <NotPassword />}
//           {loadinStatus.ok && (
//             <>
//               <div className="frameParent">
//                 <div className="title">{t(LanguageKey.pageLottery_RandomFollowersWinners)}</div>
//                 <b className={styles.step}>{t(LanguageKey.pageLottery_Step)} 1/2</b>
//               </div>
//               <div className={styles.Section}>
//                 <div className="headerandinput">
//                   <b className="title">{t(LanguageKey.pageTools_Accepttype)}</b>
//                 </div>
//                 <div className={styles.Section}>
//                   <div className="headerandinput">
//                     <RadioButton
//                       name="followerType"
//                       value={t(LanguageKey.pageTools_randomly)}
//                       checked={FollowerLotteryType.Randomly === followerType}
//                       handleOptionChanged={() => {
//                         if (session?.user.isVerified)
//                           internalNotify(InternalResponseType.InstagramLoginRequiredForVerifedAccount, NotifType.Error);
//                         else {
//                           setFollowerType(FollowerLotteryType.Randomly), console.log(followerType);
//                         }
//                       }}
//                     />
//                     <div className="explain">{t(LanguageKey.pageTools_fromFollowersexplain)}</div>
//                   </div>
//                   <div className="headerandinput">
//                     <RadioButton
//                       name="followerType"
//                       value={t(LanguageKey.pageTools_BestEngagement)}
//                       checked={FollowerLotteryType.BestEngagment === followerType}
//                       handleOptionChanged={() => {
//                         setFollowerType(FollowerLotteryType.BestEngagment), console.log(followerType);
//                       }}
//                     />
//                     <div className="explain">{t(LanguageKey.pageTools_BestEngagementexplain)}</div>
//                   </div>
//                 </div>
//               </div>
//               <div className={styles.Section} style={{ height: "100%" }}>
//                 <b className="title">{t(LanguageKey.pageLottery_NumberofWinners)}</b>
//                 <div className={styles.options}>
//                   <div className={styles.number}>
//                     <RadioButton
//                       name="winnerCount"
//                       value={"1"}
//                       checked={1 === winnerCount}
//                       handleOptionChanged={() => setWinnerCount(1)}
//                     />
//                   </div>
//                   <div className={styles.number}>
//                     <RadioButton
//                       name="winnerCount"
//                       value={"2"}
//                       checked={2 === winnerCount}
//                       handleOptionChanged={() => setWinnerCount(2)}
//                     />
//                   </div>
//                   <div className={styles.number}>
//                     <RadioButton
//                       name="winnerCount"
//                       value={"3"}
//                       checked={3 === winnerCount}
//                       handleOptionChanged={() => setWinnerCount(3)}
//                     />
//                   </div>
//                   <div className={styles.number}>
//                     <RadioButton
//                       name="winnerCount"
//                       value={"4 "}
//                       checked={4 === winnerCount}
//                       handleOptionChanged={() => setWinnerCount(4)}
//                     />
//                   </div>
//                   <div className={styles.number}>
//                     <RadioButton
//                       name="winnerCount"
//                       value={"5 "}
//                       checked={5 === winnerCount}
//                       handleOptionChanged={() => setWinnerCount(5)}
//                     />
//                   </div>
//                   <div className={styles.number}>
//                     <RadioButton
//                       name="winnerCount"
//                       value={"6 "}
//                       checked={6 === winnerCount}
//                       handleOptionChanged={() => setWinnerCount(6)}
//                     />
//                   </div>
//                   <div className={styles.number}>
//                     <RadioButton
//                       name="winnerCount"
//                       value={"7"}
//                       checked={7 === winnerCount}
//                       handleOptionChanged={() => setWinnerCount(7)}
//                     />
//                   </div>
//                   <div className={styles.number}>
//                     <RadioButton
//                       name="winnerCount"
//                       value={"8"}
//                       checked={8 === winnerCount}
//                       handleOptionChanged={() => setWinnerCount(8)}
//                     />
//                   </div>
//                   <div className={styles.number}>
//                     <RadioButton
//                       name="winnerCount"
//                       value={"9"}
//                       checked={9 === winnerCount}
//                       handleOptionChanged={() => setWinnerCount(9)}
//                     />
//                   </div>
//                   <div className={styles.number}>
//                     <RadioButton
//                       name="winnerCount"
//                       value={"10"}
//                       checked={10 === winnerCount}
//                       handleOptionChanged={() => setWinnerCount(10)}
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="ButtonContainer">
//                 <button onClick={props.removeMask} className="cancelButton">
//                   {t(LanguageKey.discard)}
//                 </button>
//                 <button onClick={handleNextStep} className={"saveButton"}>
//                   {t(LanguageKey.next)}
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default FollowersLottery;
