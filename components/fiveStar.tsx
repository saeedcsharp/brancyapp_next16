import { useState } from "react";
import { Rating } from "react-simple-star-rating";
function FiveStar(prop: { rating: number }) {
  const [rating, setRating] = useState<number>(prop.rating);
  const handleRating = (rate: number) => {
    setRating(rate);

    // other logic
  };
  const onPointerEnter = () => console.log("Enter");
  const onPointerLeave = () => console.log("Leave");
  const onPointerMove = (value: number, index: number) => console.log(value, index);
  return (
    <Rating
      onClick={handleRating}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
      allowFraction={true}
      initialValue={rating}
      readonly={false}
      size={20}
      SVGstorkeWidth={2}
      SVGstrokeColor="var(--color-light-yellow)"
      emptyColor="transparent"
      transition={true}
      SVGstyle={{ strokeLinejoin: "bevel" }}
    />
  );
}

export default FiveStar;
