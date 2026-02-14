import FeatureList from "../website/landing/featurelist";

const FeatureListModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        zIndex: 9999,
      }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          background: "rgba(0,0,0,0.5)",
        }}>
        <FeatureList isPopupOpen={open} isAnimatingOut={false} onClose={onClose} />
      </div>
    </div>
  );
};

export default FeatureListModal;
