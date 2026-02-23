import { FeatureType } from "brancy/models/market/enums";
import { ISaveLink } from "brancy/models/market/properties";
import AddNewLink from "brancy/components/market/properties/popups/addNewLink";
import Announcement from "brancy/components/market/properties/popups/announcement";
import Banner from "brancy/components/market/properties/popups/banner";
import ContactForm from "brancy/components/market/properties/popups/contactForm";
import FeatureBox from "brancy/components/market/properties/popups/featureBox";
import OnlineStream from "brancy/components/market/properties/popups/onlineStream";
import QAndABox from "brancy/components/market/properties/popups/qAndABox";
import VideoAndMusic from "brancy/components/market/properties/popups/videoAndMusic";

const FeaturePopUp = (props: {
  featureId: number;
  removeMask: () => void;
  handleAddNewLink: (newLink: ISaveLink) => void;
}) => {
  return (
    <>
      {props.featureId === FeatureType.Banner && <Banner removeMask={props.removeMask} />}
      {props.featureId === FeatureType.Announcements && <Announcement removeMask={props.removeMask} />}
      {props.featureId === FeatureType.FeaturesBox && <FeatureBox removeMask={props.removeMask} />}
      {props.featureId === FeatureType.OnlineStream && <OnlineStream removeMask={props.removeMask} />}
      {props.featureId === FeatureType.LastVideo && <VideoAndMusic removeMask={props.removeMask} />}
      {props.featureId === FeatureType.QandABox && <QAndABox removeMask={props.removeMask} />}
      {props.featureId === FeatureType.ContactAndMap && <ContactForm removeMask={props.removeMask} />}
      {props.featureId === FeatureType.LinkShortcut && (
        <AddNewLink removeMask={props.removeMask} handleAddNewLink={props.handleAddNewLink} />
      )}
    </>
  );
};

export default FeaturePopUp;
