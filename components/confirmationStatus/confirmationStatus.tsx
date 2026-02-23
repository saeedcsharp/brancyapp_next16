import styles from "brancy/components/confirmationStatus/confirmationStatus.module.css";
var adTypeName: string = "Post";
var cssStatus: string = "activestatus";
const ConfirmationStatus = (props: { statusType: StatusType }) => {
  const specifyStatusTypeName = (adType: StatusType) => {
    switch (adType) {
      case StatusType.Active:
        adTypeName = "Active";
        cssStatus = "activestatus";
        break;
      case StatusType.Confirmed:
        adTypeName = "Confirmed";
        cssStatus = "activestatus";
        break;
      case StatusType.Canceled:
        adTypeName = "Canceled";
        cssStatus = "canceledstatus";
        break;
      case StatusType.Rejected:
        adTypeName = "Rejected";
        cssStatus = "canceledstatus";
        break;
      case StatusType.Fisnished:
        adTypeName = "Finished";
        cssStatus = "finishedstatus";
        break;
      case StatusType.Delivered:
        adTypeName = "Delivered";
        cssStatus = "finishedstatus";
        break;
      case StatusType.Preparing:
        adTypeName = "Preparing";
        cssStatus = "preparingStatus";
        break;
      case StatusType.Pending:
        adTypeName = "Pending";
        cssStatus = "preparingStatus";
        break;
    }
    return adTypeName;
  };
  return (
    <>
      <div className={styles[cssStatus]}>{specifyStatusTypeName(props.statusType)}</div>
    </>
  );
};

export default ConfirmationStatus;
export enum StatusType {
  Active = 0,
  Fisnished = 1,
  Canceled = 2,
  Confirmed = 3,
  Delivered = 4,
  Rejected = 5,
  Pending = 6,
  Preparing = 7,
}
