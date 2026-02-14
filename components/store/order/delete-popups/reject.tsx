const RejectePopup = (props: {
  data: { message: string };
  removeMask: () => void;
}) => {
  return (
    <>
      <div onClick={props.removeMask} className="dialogBg" />
      <div className="popup">Rejected message</div>
    </>
  );
};

export default RejectePopup;
