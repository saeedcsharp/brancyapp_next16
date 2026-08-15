import AddNewLink from "brancy/components/market/myLink/popups/addNewLink";
import Announcement from "brancy/components/market/myLink/popups/announcement";
import Banner from "brancy/components/market/myLink/popups/banner";
import ContactForm from "brancy/components/market/myLink/popups/contactForm";
import OnlineStream from "brancy/components/market/myLink/popups/onlineStream";
import QAndABox from "brancy/components/market/myLink/popups/qAndABox";
import VideoAndMusic from "brancy/components/market/myLink/popups/videoAndMusic";
import { FeatureType } from "brancy/models/enums";
import { ISaveLink } from "brancy/models/interfaces";
import ProductPopup from "./product";
import FeaturesBoxPopup from "./featureBox";

const FeaturePopUp = (props: {
  featureId: number;
  removeMask: () => void;
  handleAddNewLink: (newLink: ISaveLink) => void;
}) => {
  return (
    <>
      {props.featureId === FeatureType.Banner && <Banner removeMask={props.removeMask} />}
      {props.featureId === FeatureType.Announcements && <Announcement removeMask={props.removeMask} />}
      {props.featureId === FeatureType.OnlineStream && <OnlineStream removeMask={props.removeMask} />}
      {props.featureId === FeatureType.LastVideo && <VideoAndMusic removeMask={props.removeMask} />}
      {props.featureId === FeatureType.QandABox && <QAndABox removeMask={props.removeMask} />}
      {props.featureId === FeatureType.ContactAndMap && <ContactForm removeMask={props.removeMask} />}
      {props.featureId === FeatureType.Products && <ProductPopup removeMask={props.removeMask} />}
      {props.featureId === FeatureType.LinkShortcut && (
        <AddNewLink removeMask={props.removeMask} handleAddNewLink={props.handleAddNewLink} />
      )}
      {props.featureId === FeatureType.FeaturesBox && <FeaturesBoxPopup removeMask={props.removeMask} />}
    </>
  );
};

export default FeaturePopUp;
