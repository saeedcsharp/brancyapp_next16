import { FeatureType } from "saeed/models/market/enums";
import { ISaveLink } from "saeed/models/market/properties";
import AddNewLink from "./addNewLink";
import Announcement from "./announcement";
import Banner from "./banner";
import ContactForm from "./contactForm";
import FeatureBox from "./featureBox";
import OnlineStream from "./onlineStream";
import QAndABox from "./qAndABox";
import VideoAndMusic from "./videoAndMusic";

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
