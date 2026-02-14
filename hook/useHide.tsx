import { CSSProperties, useState } from "react";
function useHideDiv(hideDiv: boolean, span: number) {
  const [hidePage, setHidePage] = useState<boolean>(hideDiv);
  const [gridSpan, setGridSpan] = useState<CSSProperties>({
    gridRowEnd: `span ${span}`,
  });
  const toggle = () => {
    setHidePage((preState) => !preState);
    setGridSpan(hidePage ? { gridRowEnd: "span 10" } : { gridRowEnd: `span ${span}` });
  };
  return { hidePage, gridSpan, toggle };
}

export default useHideDiv;
