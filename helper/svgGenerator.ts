import { FontWeight } from "next/dist/compiled/@vercel/og/satori";
import { TermsType } from "../models/page/tools/tools";
import satori from "satori";

export async function SvgGenerator(htmldata: React.ReactNode, width: number, height: number, fontWeight: FontWeight) {
  const response = await fetch("/fonts/Montserrat-Regular.ttf");
  const robotoFontBuffer = await response.arrayBuffer();
  const response2 = await fetch("/fonts/Montserrat-Bold.ttf");
  const robotoFontBuffer2 = await response2.arrayBuffer();

  // Load Persian fonts
  const persianRegular = await fetch("/fonts/YekanBakhNoEn-Regular.woff");
  const persianRegularBuffer = await persianRegular.arrayBuffer();
  const persianBold = await fetch("/fonts/YekanBakhNoEn-Bold.woff");
  const persianBoldBuffer = await persianBold.arrayBuffer();

  const s = await satori(htmldata, {
    width: width,
    height: height,
    fonts: [
      {
        name: "Montserrat",
        data: robotoFontBuffer,
        weight: 400,
        style: "normal",
      },
      {
        name: "Montserrat",
        data: robotoFontBuffer2,
        weight: 700,
        style: "normal",
      },
      {
        name: "YekanBakh",
        data: persianRegularBuffer,
        weight: 400,
        style: "normal",
      },
      {
        name: "YekanBakh",
        data: persianBoldBuffer,
        weight: 700,
        style: "normal",
      },
    ],
  });
  return s;
}

export function BackgrounCssTodStr(
  type: TermsType,
  reverseThumb: boolean,
  firstHexBackgroung: string,
  secondHexBackgroung: string,
  firstPercentageColor: number,
  secondPercentageColor: number,
  deg: number
) {
  let background: string = "";
  if (type === TermsType.Linear) {
    background = `linear-gradient(${deg}deg, ${!reverseThumb ? firstHexBackgroung : secondHexBackgroung} ${
      !reverseThumb ? firstPercentageColor : secondPercentageColor
    }%, ${!reverseThumb ? secondHexBackgroung : firstHexBackgroung} ${
      !reverseThumb ? secondPercentageColor : firstPercentageColor
    }%)`;
  } else if (type === TermsType.Radial) {
    background = `radial-gradient(circle, ${!reverseThumb ? firstHexBackgroung : secondHexBackgroung} ${
      !reverseThumb ? firstPercentageColor : secondPercentageColor
    }%, ${!reverseThumb ? secondHexBackgroung : firstHexBackgroung} ${
      !reverseThumb ? secondPercentageColor : firstPercentageColor
    }%)`;
  } else {
    background = `${firstHexBackgroung}`;
  }

  return background;
}

export function countLeadingSpaces(inputString: string) {
  // Use a regular expression to match leading spaces
  const leadingSpaces = inputString.match(/^\s*/);
  // Check if leadingSpaces is not null, and return the length of the matched spaces
  return leadingSpaces ? leadingSpaces[0].length : 0;
}
