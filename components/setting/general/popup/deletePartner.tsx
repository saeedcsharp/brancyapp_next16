import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import { IPartner } from "brancy/models/_AccountInfo/InstagramerAccountInfo";
const DeletePartner = (props: {
  partner: IPartner;
  removeMask: () => void;
  handleDeletePartner: (userId: number) => void;
}) => {
  useEffect(() => {}, []);
  const { t } = useTranslation();
  return (
    <>
      <div className="headerparent">
        <div className="headertext">Phonenumber</div>
        <div className="Title">{props.partner.phoneNumber}</div>
      </div>
      {props.partner.name && (
        <div className="headerparent">
          <div className="headertext">name</div>
          <div className="Title">{props.partner.name}</div>
        </div>
      )}

      {props.partner.name && (
        <div className="headerparent">
          <div className="headertext">Title</div>
          <div className="Title">{props.partner.name}</div>
        </div>
      )}

      <div className="ButtonContainer">
        <button onClick={props.removeMask} className="cancelButton">
          {t(LanguageKey.cancel)}
        </button>
        {
          <button
            onClick={() => {
              props.handleDeletePartner(props.partner.userId);
            }}
            className={`saveButton`}>
            {t(LanguageKey.delete)}
          </button>
        }
      </div>
    </>
  );
};

export default DeletePartner;
