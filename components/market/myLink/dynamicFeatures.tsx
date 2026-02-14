import { ReactNode } from "react";
const DynamicFeatures = (prop: { reactNodes: ReactNode[] }) => {
  return <>{prop.reactNodes.map((v) => v)}</>;
};

export default DynamicFeatures;
