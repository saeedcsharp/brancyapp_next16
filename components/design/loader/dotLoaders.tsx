import style from "./DotLoaders.module.css";
export default function DotLoaders() {
  return (
    <div className={style.loaderparent}>
      <div className={style.loader} />
    </div>
  );
}
