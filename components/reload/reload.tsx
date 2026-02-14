import { useEffect, useState } from "react";
let interval = 0;
const Reload = (props: { data: number }) => {
  const [couner, setCouner] = useState(props.data);

  useEffect(() => {
    interval = window.setInterval(() => setCouner(couner - 1), 1000);
    return () => window.clearInterval(interval);
  });

  return <>{couner}</>;
};

export default Reload;
