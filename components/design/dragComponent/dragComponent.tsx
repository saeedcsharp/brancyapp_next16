import { useEffect, useRef, useState } from "react";
import Draggable, { DraggableBounds, DraggableData } from "react-draggable";
import styles from "brancy/components/design/dragComponent/dragComponent.module.css";

export type positionType = {
  x: number;
  y: number;
};

const DragComponent = (props: {
  handleStopDrag: (username: string, position: positionType, deltax: number, deltaY: number) => void;
  handleDeleteTag: (username: string) => void;
  username: string;
  x: number;
  y: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}) => {
  const [position, setPosition] = useState<positionType>({
    x: props.x,
    y: props.y,
  });

  const [lastClickTime, setLastClickTime] = useState<number>(0);

  const track = (data: DraggableData) => {
    console.log("width", divRef.current?.clientWidth);
    setPosition({ x: data.x, y: data.y });
    console.log("x", data.x, "y", data.y);
  };

  const handleClick = () => {
    const currentTime = new Date().getTime();
    const clickDuration = currentTime - lastClickTime;

    if (clickDuration < 300) {
      // Double click occurred
      props.handleDeleteTag(props.username);
    }

    setLastClickTime(currentTime);
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.handleDeleteTag(props.username);
  };

  const boxRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<DraggableBounds>({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  });

  useEffect(() => {
    if (boxRef.current) {
      const cardPostBounds = boxRef.current.getBoundingClientRect();
      setBounds({
        left: props.minX - 0.5 * (divRef.current?.clientWidth ?? 0),
        top: props.minY + 8,
        right: props.maxX - 0.5 * (divRef.current?.clientWidth ?? 0),
        bottom: props.maxY + 8,
      });
      setPosition({ x: props.x, y: props.y });
    }
  }, []);

  return (
    <div ref={boxRef} className={styles.draglimit}>
      {/* ... other content ... */}
      <Draggable
        onStop={() => {
          let p = position;
          console.log("P", p);
          // p.x = p.x + 0.5 * (divRef.current?.clientWidth ?? 0);
          console.log("P2", p);
          props.handleStopDrag(props.username, p, 0.5 * (divRef.current?.clientWidth ?? 0), -8);
        }}
        handle="#m"
        onDrag={(e, data) => track(data)}
        bounds={bounds}
        position={position}>
        <div
          ref={divRef}
          id="m"
          className={styles.box}
          onClick={handleClick}
          onDoubleClick={handleClick}
          onTouchStart={handleClick}>
          <div className={styles.text}>{props.username}</div>
          <img className={styles.icon} alt="icon" src="/iconbox-close.svg" onClick={handleIconClick}></img>
        </div>
      </Draggable>
    </div>
  );
};

export default DragComponent;
