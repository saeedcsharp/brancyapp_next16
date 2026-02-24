import { useEffect, useState } from "react";
import styles from "./components/customerAds/customerAds.module.css";
import HeaderTitle from "brancy/components/headerTitle/headerTitle";
import { IFullAdvertiser, SelectedCardContent } from "brancy/models/customerAds/customerAd";
import Terms from "brancy/components/customerAds/card/terms";
import UserProfile from "brancy/components/customerAds/card/userProfile";

export function card(props: { advertiserId: number; removeMask: () => void }) {
  const [selectedTabIndex, setSelectedTabIndex] = useState<SelectedCardContent>(SelectedCardContent.UserProfile);
  const [advertiser, setAdvertiser] = useState<IFullAdvertiser>({
    userProfile: {
      asvertiseId: 0,
      engage: 0,
      follower: 0,
      following: 0,
      postCount: 0,
      fullName: "",
      price: 0,
      profileUrl: "",
      rating: 0,
      reach: 0,
      terms: "",
      username: "",
    },
    businessHour: [],
    posts: [],
    reviews: [],
    terms: [],
  });
  useEffect(() => {
    //Api to get full advertiser
    var response: IFullAdvertiser = {
      userProfile: {
        asvertiseId: 0,
        engage: 2872872,
        follower: 827828,
        following: 5454547,
        postCount: 125,
        fullName: "a",
        price: 8287287287,
        profileUrl: "/no-profile.svg",
        rating: 4.5,
        reach: 525252,
        terms:
          " Bio -- Sed at nulla non felis ullamcorper facilisis sit amet ac turpis. In eget dui maximus, facilisis massa a, see more",
        username: "@a",
      },
      businessHour: [],
      posts: [],
      reviews: [],
      terms: [],
    };
    setAdvertiser(response);
  }, []);
  return (
    <div className={styles.popupandbg}>
      <div onClick={props.removeMask} className="dialogBg"></div>
      <div className={styles.popup}>
        <HeaderTitle
          titles={["user profile", "Terms & Conditions", "bussiness hours", "reviews", "posts"]}
          handleSelectIndexItem={(marketType: SelectedCardContent) => {
            setSelectedTabIndex(marketType);
          }}
          indexItem={selectedTabIndex}
        />
        <div className={styles.popupcontent}>
          {selectedTabIndex === SelectedCardContent.UserProfile && <UserProfile data={advertiser.userProfile} />}
          {selectedTabIndex === SelectedCardContent.Terms && <Terms terms={[]} />}
          {selectedTabIndex === SelectedCardContent.BusinessHours && <div>Bussiness Hours Content</div>}
          {selectedTabIndex === SelectedCardContent.Reviews && <div>Reviews Content</div>}
          {selectedTabIndex === SelectedCardContent.UserProfile && <div>Posts Content</div>}
        </div>
        <div className="ButtonContainer">
          <div className="cancelButton" onClick={props.removeMask}>
            Close
          </div>
          <div className="saveButton">Add to Cart</div>
        </div>
      </div>
    </div>
  );
}
