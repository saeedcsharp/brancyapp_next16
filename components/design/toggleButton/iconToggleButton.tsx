import React from "react";
import styles from "brancy/components/design/toggleButton/iconToggleButton.module.css";
import { ToggleOrder } from "brancy/components/design/toggleButton/types";

const IconToggleButton = (props: {
  data: { firstToggle: string; secondToggle: string };
  values: { firstToggle: string; secondToggle: string };
  dataIcon: {
    firstIcon: { active: string | React.JSX.Element; diactive: string | React.JSX.Element };
    secondIcon: {
      active: string | React.JSX.Element;
      diactive: string | React.JSX.Element;
    };
  };
  setChangeToggle: (order: ToggleOrder) => void;
  toggleValue: ToggleOrder;
}) => {
  return (
    <div className={styles.switchTab2x}>
      <div
        onClick={() => props.setChangeToggle(ToggleOrder.FirstToggle)}
        className={props.toggleValue === ToggleOrder.FirstToggle ? styles.active : styles.deactive}>
        {props.toggleValue === ToggleOrder.FirstToggle ? (
          <div className={styles.buttonContainer}>
            {typeof props.dataIcon.firstIcon.active === "string" ? (
              <img
                loading="lazy"
                decoding="async"
                className={styles.icon}
                src={props.dataIcon.firstIcon.active}
                alt="follower icon"
              />
            ) : (
              props.dataIcon.firstIcon.active
            )}
            <b style={{ minWidth: "90px" }}>{props.values.firstToggle}</b>
          </div>
        ) : (
          <div className={styles.buttonContainer}>
            {typeof props.dataIcon.firstIcon.diactive === "string" ? (
              <img
                loading="lazy"
                decoding="async"
                className={styles.icon}
                src={props.dataIcon.firstIcon.diactive}
                alt="nonfollower icon"
              />
            ) : (
              props.dataIcon.firstIcon.diactive
            )}
            <b style={{ minWidth: "90px" }}>{props.data.firstToggle}</b>
          </div>
        )}
      </div>

      <div
        onClick={() => props.setChangeToggle(ToggleOrder.SecondToggle)}
        className={props.toggleValue === ToggleOrder.SecondToggle ? styles.active : styles.deactive}>
        {props.toggleValue === ToggleOrder.SecondToggle ? (
          <div className={styles.buttonContainer}>
            {typeof props.dataIcon.secondIcon.active === "string" ? (
              <img
                loading="lazy"
                decoding="async"
                className={styles.icon}
                src={props.dataIcon.secondIcon.active}
                alt="follower icon"
              />
            ) : (
              props.dataIcon.secondIcon.active
            )}
            <b style={{ minWidth: "90px" }}>{props.values.secondToggle}</b>
          </div>
        ) : (
          <div className={styles.buttonContainer}>
            {typeof props.dataIcon.secondIcon.diactive === "string" ? (
              <img
                loading="lazy"
                decoding="async"
                className={styles.icon}
                src={props.dataIcon.secondIcon.diactive}
                alt="nonfollower icon"
              />
            ) : (
              props.dataIcon.secondIcon.diactive
            )}
            <b style={{ minWidth: "90px" }}>{props.data.secondToggle}</b>
          </div>
        )}
      </div>
    </div>
  );
};

export default IconToggleButton;
