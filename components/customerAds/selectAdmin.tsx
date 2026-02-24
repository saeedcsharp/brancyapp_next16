import { useState } from "react";
import { IAdvertiseSummary } from "brancy/models/customerAds/customerAd";
import styles from "./customerAds.module.css";
function SelectAdmin(props: {
  selectedAds: IAdvertiseSummary[];
  handleUpdateSelectedAds: (adId: number) => void;
  handleSelectAdvertisers: () => void;
}) {
  const [selectedAds, setSelectedAds] = useState(props.selectedAds);
  const handleDeleteAd = (adId: number) => {
    const newSelectedAds = selectedAds.filter((x) => x.asvertiseId !== adId);
    setSelectedAds(newSelectedAds);
    props.handleUpdateSelectedAds(adId);
  };
  const handleSelectAdvertisers = () => {
    if (selectedAds.length > 1 && selectedAds.length < 5) return;
    props.handleSelectAdvertisers();
  };
  return (
    <div className={styles.cartsummary}>
      <div className={styles.selectedlist}>
        {selectedAds.map((v) => (
          <div key={v.asvertiseId} className={styles.selectedpage}>
            <div
              key={v.asvertiseId}
              className={styles.summaryrow}
              style={{
                paddingBottom: "20px",
                borderBottom: "1px solid var(--color-gray60)",
              }}>
              <div className="instagramprofile">
                <img
                  className="instagramimage"
                  alt="profile image"
                  src={v.profileUrl}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/no-profile.svg";
                  }}
                />

                <div className="instagramprofiledetail">
                  <div className="instagramusername">{v.fullName}</div>
                  <div className="instagramid">{v.username}</div>
                </div>
              </div>

              <svg onClick={() => handleDeleteAd(v.asvertiseId)} className={styles.delete} viewBox="0 0 21 24">
                <path d="M20 4h-4.8v-.7A2.7 2.7 0 0 0 12.5.6H7.8a2.7 2.7 0 0 0-2.7 2.7v.8H.2a.8.8 0 0 0 0 1.5h1.1V21A3.6 3.6 0 0 0 5 24.6h10.4A3.6 3.6 0 0 0 19 21V5.6h1A.8.8 0 1 0 20 4M6.7 3.4a1.2 1.2 0 0 1 1.2-1.2h4.7a1.2 1.2 0 0 1 1.2 1.2v.8H6.6ZM17.5 21a2 2 0 0 1-2.1 2.1H5A2 2 0 0 1 2.8 21V5.6h14.7ZM6.7 18.4V9.9a.8.8 0 1 1 1.5 0v8.5a1 1 0 0 1-.8.7 1 1 0 0 1-.7-.7m5.6.5-.2-.5V9.9a.8.8 0 1 1 1.5 0v8.5a1 1 0 0 1-.8.7z" />
              </svg>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.bottom}>
        {selectedAds.length > 1 && selectedAds.length < 5 && (
          <div className={styles.alert}>
            <svg className={styles.alertsvg} width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 16a8 8 0 1 1 8-8 8 8 0 0 1-8 8m-1.6-4.9-.3.1-.1.4a.4.4 0 0 0 .4.4h3.2a.5.5 0 0 0 0-.9L9 11V7H6.4a.5.5 0 0 0 0 .9L7 8v3zM7 4v2h2V4H8Z" />
            </svg>

            <div className={styles.alerttext}>
              To create a campaign, your cart must contain at least 
              <strong>5</strong> items
            </div>
          </div>
        )}

        {selectedAds.length === 1 && (
          <div onClick={handleSelectAdvertisers} className="saveButton">
            Start Advertise
          </div>
        )}
        {selectedAds.length >= 5 && (
          <div onClick={handleSelectAdvertisers} className="saveButton">
            Start Campaign
          </div>
        )}
        {selectedAds.length >= 2 && selectedAds.length <= 4 && (
          <div className="disableButton">
            Need <strong> {5 - selectedAds.length}</strong> item to continue
          </div>
        )}
      </div>
    </div>
  );
}

export default SelectAdmin;
