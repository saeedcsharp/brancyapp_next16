import styles from "./counterDown.module.css";

const SVGCircle = (prob: { radius: number; constRadius: number; color: string }) => {
  return (
    <>
      <svg className={styles.countdownSvg}>
        <path fill="none" stroke={prob.color} strokeWidth="1" d={describeArc(22, 22, 20, 0, prob.constRadius)} />
      </svg>
      <svg className={styles.countdownSvg}>
        <path fill="none" stroke={prob.color} strokeWidth="2.75" d={describeArc(22, 22, 20, 0, prob.radius)} />
      </svg>
    </>
  );
};

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);

  var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  var d = ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");

  return d;
}

// From stackoverflow: https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export default SVGCircle;
