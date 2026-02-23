import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import InputText from "../../../design/inputText";
import RingLoader from "../../../design/loader/ringLoder";
import { NotifType, notify, ResponseType } from "../../../notifications/notificationBox";
import { LanguageKey } from "../../../../i18n";
import { MethodType, UploadFile } from "../../../../helper/api";
import { ICreateSystemTicket, ITicket, ITicketMediaType } from "../../../../models/userPanel/message";
import { clientFetchApi } from "../../../../helper/clientFetchApi";
interface State {
  selectedImage: string | null;
  imageId: string | null;
  subject: string;
  text: string | null;
}
type Action =
  | {
      type: "SET_SELECTED_IMAGE";
      payload: string | null;
    }
  | { type: "SET_IMAGE_ID"; payload: string | null }
  | { type: "SET_SUBJECT"; payload: string }
  | { type: "SET_TEXT"; payload: string | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SELECTED_IMAGE":
      return { ...state, selectedImage: action.payload };
    case "SET_IMAGE_ID":
      return { ...state, imageId: action.payload };
    case "SET_SUBJECT":
      return { ...state, subject: action.payload };
    case "SET_TEXT":
      return { ...state, text: action.payload };
    default:
      return state;
  }
}
export default function TicketTitle({ removeMask, orderId }: { removeMask: () => void; orderId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [state, dispatch] = useReducer(reducer, {
    selectedImage: null,
    imageId: null,
    subject: "",
    text: null,
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        dispatch({
          type: "SET_SELECTED_IMAGE",
          payload: file ? URL.createObjectURL(file) : null,
        });
        setIsUploadingImage(true);
        const res = await UploadFile(session, file);
        dispatch({ payload: res.fileName, type: "SET_IMAGE_ID" });
        setIsUploadingImage(false);
        // else notify(ResponseType.Unexpected, NotifType.Error, t(LanguageKey.uploadFailed));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageFrameClick = () => {
    document.getElementById("imageInput")?.click();
  };

  const handleDeleteImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the frame click
    dispatch({ type: "SET_SELECTED_IMAGE", payload: null });
    dispatch({ type: "SET_IMAGE_ID", payload: null });
    // Reset the file input
    const fileInput = document.getElementById("imageInput") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
    setIsUploadingImage(false);
  };

  async function handleCreateTicket() {
    const createSystemTicket: ICreateSystemTicket = {
      text: state.text && state.text.length > 0 ? state.text : null,
      imageUrl: state.selectedImage ? state.imageId : null,
      itemType: state.imageId ? ITicketMediaType.Image : ITicketMediaType.Text,
    };
    try {
      console.log("Creating ticket with data:", createSystemTicket);
      const res = await clientFetchApi<ICreateSystemTicket, ITicket>(
        "/api/systemticket/CreateSystemTicketBaseOrderId",
        {
          methodType: MethodType.post,
          session: session,
          data: createSystemTicket,
          queries: [
            { key: "orderId", value: orderId },
            { key: "subject", value: state.subject },
          ],
          onUploadProgress: undefined,
        },
      );
      if (res.succeeded) {
        console.log("Ticket created successfully:", res);
        router.push(`/user/message?id=${res.value.ticketId}`);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  function checkSaveCreateTicket(): boolean {
    return (
      state.subject.length > 0 && ((state.text && state.text.length > 0) || !!state.selectedImage) && !isUploadingImage
    );
  }
  return (
    <>
      <div onClick={removeMask} className="dialogBg" />
      <div className="popup">
        <div className="headerandinput">
          <div className="title">{"Ticket Title"}</div>
        </div>
        <InputText
          className={"textinputbox"}
          handleInputChange={(e) => dispatch({ type: "SET_SUBJECT", payload: e.target.value })}
          value={state.subject}
        />

        <div className="headerandinput">
          <div className="title">{"Description"}</div>
        </div>
        <InputText
          className={"textinputbox"}
          handleInputChange={(e) => dispatch({ type: "SET_TEXT", payload: e.target.value })}
          value={state.text ?? ""}
        />

        <div className="headerandinput">
          <div className="title">{"Add Image"}</div>
        </div>
        <div
          className="imageUploadFrame"
          onClick={handleImageFrameClick}
          style={{
            border: "2px dashed #ccc",
            borderRadius: "8px",
            padding: "20px",
            textAlign: "center",
            cursor: "pointer",
            marginBottom: "20px",
            minHeight: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}>
          {state.selectedImage ? (
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <img
                src={state.selectedImage}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "150px",
                  objectFit: "contain",
                }}
              />
              <button
                onClick={handleDeleteImage}
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  background: "rgba(255, 0, 0, 0.7)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "25px",
                  height: "25px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
                title="Delete image">
                ×
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>📷</div>
              <div>Click to add image</div>
            </div>
          )}
        </div>
        {isUploadingImage && <RingLoader />}

        <input id="imageInput" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />

        <div className="ButtonContainer">
          <button onClick={removeMask} className="cancelButton">
            {t(LanguageKey.cancel)}
          </button>
          <button
            onClick={handleCreateTicket}
            disabled={!checkSaveCreateTicket()}
            className={checkSaveCreateTicket() ? "saveButton" : "disableButton"}>
            {t(LanguageKey.save)}
          </button>
        </div>
      </div>
    </>
  );
}
