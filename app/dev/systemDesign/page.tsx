"use client";

import { ChangeEvent, useState } from "react";
import InputBox from "brancy/components/design/inputBox/inputBox";
import TextArea from "brancy/components/design/textArea/textArea";
import CheckBoxButton from "brancy/components/design/checkBoxButton/checkBoxButton";
import RadioButton from "brancy/components/design/radioButton/radioButton";
import SwitchButton from "brancy/components/design/switchButton/switchButton";
import IncrementStepper from "brancy/components/design/incrementStepper/incrementStepper";
import ProgressBar from "brancy/components/design/progressBar/progressBar";
import Slider, { SliderSlide } from "brancy/components/design/slider/slider";
import ToggleButton from "brancy/components/design/toggleButton/ToggleButton";
import { ToggleOrder } from "brancy/components/design/toggleButton/types";
import DotMenu from "brancy/components/design/dotMenu/dotMenu";
import DragDrop from "brancy/components/design/dragDrop/dragDrop";
import DragComponent from "brancy/components/design/dragComponent/dragComponent";
import PhoneInput, { PhoneValue } from "brancy/components/design/phoneInput/PhoneInput";
import DotLoaders from "brancy/components/design/loader/dotLoaders";
import RingLoader from "brancy/components/design/loader/ringLoder";
import Typing from "brancy/components/design/loader/typing";
import AIButton from "brancy/components/design/ai/AIButton";
import Tooltip from "brancy/components/design/tooltip/tooltip";
import Modal from "brancy/components/design/modal";
import CircularCountdown from "brancy/components/design/counterDown/circularCounterDown";
import CountdownTimerForLink from "brancy/components/design/counterDown/counterDownForLink";
import BrushLineChart from "brancy/components/design/chart/brushLineChart";
import InlineBarChart from "brancy/components/design/chart/inlineBarChart";
import RadarChart from "brancy/components/design/chart/radarChart";
import TextEditor from "brancy/components/design/textEditor/TextEditor";
import styles from "./systemDesign.module.css";

const inputModels = [
  "initial",
  "hover",
  "disable",
  "filled",
  "success",
  "info",
  "warning",
  "danger",
  "num",
  "numAndPercentage",
  "search",
  "textinputbox",
  "serachMenuBar",
];
const inputUnits = ["gram", "Kg", "CM", "MM", "$", "%"];
const chartSeries = [
  {
    id: "sales",
    name: "فروش",
    color: "#0ea5a8",
    items: [1, 2, 3, 4, 5, 6].map((day, index) => ({
      date: `2026-08-${String(day).padStart(2, "0")}`,
      count: [12, 28, 19, 42, 35, 56][index],
    })),
  },
  {
    id: "visits",
    name: "بازدید",
    color: "#f97316",
    items: [1, 2, 3, 4, 5, 6].map((day, index) => ({
      date: `2026-08-${String(day).padStart(2, "0")}`,
      count: [20, 16, 34, 25, 48, 39][index],
    })),
  },
];

function Section({
  title,
  folder,
  children,
  className = "",
}: {
  title: string;
  folder: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`${styles.section} ${className}`}>
      <div className={styles.sectionHeading}>
        <span>{folder}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function DemoCard({
  name,
  note,
  children,
  className = "",
}: {
  name: string;
  note?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={`${styles.demoCard} ${className}`}>
      <header>
        <strong>{name}</strong>
        {note && <small>{note}</small>}
      </header>
      <div className={styles.demoBody}>{children}</div>
    </article>
  );
}

export default function SystemDesignPage() {
  const [inputValues, setInputValues] = useState<Record<string, string>>({
    textinputbox: "نمونه‌ی پرشده",
    success: "تأیید شده",
    num: "۱۲۳۴",
    numAndPercentage: "۹۵",
    search: "",
  });
  const [text, setText] = useState("یک متن نمایشی برای تست راست‌چین و تغییر اندازه.");
  const [checked, setChecked] = useState(true);
  const [radio, setRadio] = useState("a");
  const [switched, setSwitched] = useState(true);
  const [count, setCount] = useState(3);
  const [toggle, setToggle] = useState(1);
  const [iconToggle, setIconToggle] = useState<ToggleOrder>(ToggleOrder.FirstToggle);
  const [phone, setPhone] = useState<PhoneValue | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dragLabel, setDragLabel] = useState("قابل جابه‌جایی");
  const setInput = (model: string) => (event: ChangeEvent<HTMLInputElement>) =>
    setInputValues((current) => ({ ...current, [model]: event.target.value }));
  const future = Date.now() + 86_400_000;
  const dropdownItems = ["انتخاب اول", "انتخاب دوم", "گزینه‌ی طولانی نمایشی"].map((label, index) => (
    <span key={label} id={String(index + 1)}>
      {label}
    </span>
  ));

  return (
    <main className={styles.root} dir="rtl">
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>SYSTEM DESIGN LAB / MOCK DATA</span>
          <h1>آزمایشگاه طراحی Brancy</h1>
          <p>تمام نمونه‌ها نمایشی‌اند. هر کارت را باز کن، تغییر بده و رفتار مدل را در حالت‌های مختلف ببین.</p>
        </div>
        <a className={styles.backLink} href="/dev">
          بازگشت به پنل
        </a>
      </header>

      <div className={styles.legend}>
        <span>مجموعه‌ی نمایشی</span>
        <span>{inputModels.length} مدل InputBox</span>
        <span>بدون درخواست شبکه</span>
      </div>

      <Section title="ورودی‌ها و فرم‌ها" folder="inputBox / textArea / phoneInput" className={styles.inputSection}>
        <div className={styles.inputGrid}>
          {inputModels.map((model) => (
            <DemoCard key={model} name={model} note={model === "disable" ? "disabled" : undefined}>
              <InputBox
                className={model}
                placeHolder={model === "search" || model === "serachMenuBar" ? "جستجو کنید" : `مدل ${model}`}
                value={inputValues[model] ?? (model === "disable" ? "غیرفعال" : "")}
                handleInputChange={setInput(model)}
                disabled={model === "disable"}
                numberType={model === "num" || model === "numAndPercentage"}
                dangerOnEmpty={model === "danger"}
                pasteIcon={model === "initial"}
              />
            </DemoCard>
          ))}
        </div>
        <div className={styles.inputGrid}>
          {inputUnits.map((unit, index) => (
            <DemoCard key={unit} name={`unit / ${unit}`} note={index === 0 ? "custom unit" : undefined}>
              <InputBox
                className="textinputbox"
                value={inputValues[`unit-${unit}`] ?? (index === 0 ? "۱۲۵۰" : index === 4 ? "۲۹۹" : "۱۲")}
                handleInputChange={setInput(`unit-${unit}`)}
                unit={unit}
                unitStyle={index === 4 ? { color: "var(--color-dark-green)", fontWeight: 700 } : undefined}
                numberType
                inputMode="numeric"
                placeHolder={`مقدار ${unit}`}
              />
            </DemoCard>
          ))}
        </div>
        <div className={styles.twoColumn}>
          <DemoCard name="TextArea / normal + autoResize">
            <TextArea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="متن چندخطی"
              autoResize
              minHeight={56}
              maxHeight={150}
            />
          </DemoCard>
          <DemoCard name="PhoneInput / selector + formatting">
            <PhoneInput
              defaultCountry="ir"
              locale="fa"
              value={phone?.e164 ?? ""}
              onChange={setPhone}
              label="شماره تماس"
              preferredCountries={["ir", "gb"]}
              suggestedCountries={["ir"]}
            />
            <output className={styles.output}>{phone?.international ?? "مقدار انتخاب نشده"}</output>
          </DemoCard>
        </div>
      </Section>

      <Section
        title="کنترل‌های تعاملی"
        folder="checkBox / radio / switch / stepper / toggle"
        className={styles.controlsSection}>
        <div className={styles.controlGrid}>
          <DemoCard name="CheckBoxButton / checked + disabled">
            <CheckBoxButton
              value={checked}
              handleToggle={(event) => setChecked(event.target.checked)}
              textlabel="گزینه‌ی فعال"
            />
            <CheckBoxButton value={false} handleToggle={() => undefined} textlabel="گزینه‌ی قفل‌شده" disabled />
          </DemoCard>
          <DemoCard name="RadioButton / group">
            <RadioButton
              id="radio-a"
              name="demo-radio"
              checked={radio === "a"}
              onChange={() => setRadio("a")}
              label="انتخاب A"
            />
            <RadioButton
              id="radio-b"
              name="demo-radio"
              checked={radio === "b"}
              onChange={() => setRadio("b")}
              label="انتخاب B"
            />
          </DemoCard>
          <DemoCard name="SwitchButton / on + disabled">
            <SwitchButton
              name="demo-switch"
              checked={switched}
              handleToggle={(event) => setSwitched(event.target.checked)}
            />
            <SwitchButton name="demo-switch-disabled" checked={false} handleToggle={() => undefined} disabled />
          </DemoCard>
          <DemoCard name="IncrementStepper / min-max">
            <IncrementStepper
              data={count}
              min={0}
              max={9}
              increment={() => setCount((value) => Math.min(9, value + 1))}
              decrement={() => setCount((value) => Math.max(0, value - 1))}
              onValueChange={setCount}
              aria-label="تعداد نمایشی"
            />
          </DemoCard>
          <DemoCard name="ToggleButton / 2, 3 و 4 گزینه">
            <ToggleButton
              options={[
                { id: 0, label: "روز" },
                { id: 1, label: "ماه", unreadCount: 1 },
                { id: 2, label: "سال" },
              ]}
              selectedValue={toggle}
              onChange={setToggle}
              ariaLabel="بازه"
            />
          </DemoCard>
          <DemoCard name="ToggleButton / legacy labels">
            <ToggleButton
              data={{ firstToggle: "اول", secondToggle: "دوم" }}
              values={{ firstToggle: "اول", secondToggle: "دوم" }}
              dataIcon={{ firstIcon: { active: "✓", diactive: "○" }, secondIcon: { active: "✓", diactive: "○" } }}
              toggleValue={iconToggle}
              setChangeToggle={setIconToggle}
            />
          </DemoCard>
        </div>
      </Section>

      <Section title="وضعیت، بارگذاری و زمان" folder="loader / progressBar / counterDown">
        <div className={styles.controlGrid}>
          <DemoCard name="Loaders / dot, ring, typing">
            <div className={styles.loaderRow}>
              <DotLoaders />
              <RingLoader />
              <RingLoader color="white" />
              <Typing />
            </div>
          </DemoCard>
          <DemoCard name="ProgressBar / default, orange, red">
            <ProgressBar
              width={72}
              role="progressbar"
              aria-valuenow={72}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="پیشرفت"
            />
            <ProgressBar width={48} color="orange" />
            <ProgressBar width={28} color="red" />
          </DemoCard>
          <DemoCard name="Countdown / circular + link">
            <div className={styles.loaderRow}>
              <CircularCountdown unixTime={future} />
              <CountdownTimerForLink expireTime={Math.floor(future / 1000)} />
            </div>
          </DemoCard>
        </div>
      </Section>

      <Section title="نمودارها و اسلایدر" folder="chart / slider" className={styles.chartSection}>
        <div className={styles.chartGrid}>
          <DemoCard name="BrushLineChart / multi-series" className={styles.wideCard}>
            <BrushLineChart chartId="system-design-brush" series={chartSeries} height="300px" />
          </DemoCard>
          <DemoCard name="InlineBarChart / mock">
            <InlineBarChart
              chartId="system-design-bars"
              height="220px"
              items={[
                { month: 1, year: 2026, totalCount: 72 },
                { month: 2, year: 2026, totalCount: 44 },
                { month: 3, year: 2026, totalCount: 28 },
              ]}
            />
          </DemoCard>
          <DemoCard name="RadarChart / mock">
            <RadarChart
              chartId="system-design-radar"
              height="260px"
              categories={["کیفیت", "سرعت", "دسترسی", "سادگی"]}
              platformsData={[{ name: "نمونه", color: "#0ea5a8", data: [80, 62, 74, 68] }]}
            />
          </DemoCard>
          <DemoCard name="Slider / navigation + pagination" className={styles.wideCard}>
            <Slider slidesPerView={2} navigation pagination={{ clickable: true }}>
              <SliderSlide>
                <div className={styles.slide}>کارت اول</div>
              </SliderSlide>
              <SliderSlide>
                <div className={styles.slide}>کارت دوم</div>
              </SliderSlide>
              <SliderSlide>
                <div className={styles.slide}>کارت سوم</div>
              </SliderSlide>
            </Slider>
          </DemoCard>
        </div>
      </Section>

      <Section title="تعاملات و ابزارها" folder="dotMenu / dragDrop / dragComponent / tooltip / modal / ai">
        <div className={styles.controlGrid}>
          <DemoCard name="DotMenu / keyboard menu">
            <DotMenu
              options={[
                { icon: "✎", value: "ویرایش" },
                { icon: "⌫", value: "حذف" },
                { icon: "⋯", value: "بیشتر" },
              ]}
              placement="bottomLeft"
            />
          </DemoCard>
          <DemoCard name="DragDrop / search + selection">
            <DragDrop data={dropdownItems} handleOptionSelect={() => undefined} searchMod />
          </DemoCard>
          <DemoCard name="DragComponent / bounded">
            <DragComponent
              username={dragLabel}
              x={30}
              y={10}
              minX={0}
              minY={0}
              maxX={210}
              maxY={80}
              handleStopDrag={(_, position) => setDragLabel(`${position.x}, ${position.y}`)}
              handleDeleteTag={() => setDragLabel("حذف شد")}
            />
          </DemoCard>
          <DemoCard name="Tooltip / hover + click">
            <Tooltip tooltipValue="این توضیح از portal رندر می‌شود" position="top" onHover>
              <button type="button" className={styles.action}>
                روی من برو
              </button>
            </Tooltip>
            <Tooltip tooltipValue="Tooltip کلیکی" position="bottom" onClick>
              <button type="button" className={styles.action}>
                کلیک کن
              </button>
            </Tooltip>
          </DemoCard>
          <DemoCard name="AIButton / normal + loading">
            <AIButton onClick={() => undefined} size="small">
              AI
            </AIButton>
            <AIButton onClick={() => undefined} loading size="small">
              AI
            </AIButton>
          </DemoCard>
          <DemoCard name="Modal / open + close">
            <button type="button" className={styles.action} onClick={() => setShowModal(true)}>
              نمایش Modal
            </button>
            <Modal closePopup={() => setShowModal(false)} classNamePopup="popupMini" showContent={showModal}>
              <h3 id="modal-title">Modal نمایشی</h3>
              <p>این محتوا فقط برای تست حالت باز و بسته شدن است.</p>
              <button type="button" className={styles.action} onClick={() => setShowModal(false)}>
                بستن
              </button>
            </Modal>
          </DemoCard>
        </div>
      </Section>

      <Section title="ویرایشگر" folder="textEditor" className={styles.editorSection}>
        <DemoCard name="TextEditor / toolbar + blocks" className={styles.wideCard}>
          <TextEditor value="<h2>نمونه‌ی ویرایشگر</h2><p>این متن را ویرایش کن، Enter بزن و toolbar را امتحان کن.</p>" />
        </DemoCard>
      </Section>
    </main>
  );
}
