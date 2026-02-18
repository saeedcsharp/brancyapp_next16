import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "saeed/i18n";
import styles from "./navbar.module.css";

interface INavbar {
  id: string;
  items: string[];
  indexValue: string;
  initialSlide: number;
}

const svgMapping: { [key: string]: React.JSX.Element } = {
  posts: (
    <svg width="18" height="18" fill="none" viewBox="0 0 20 20" role="img" aria-label="Posts icon">
      <path d="M14.2 1H5.8C2.8 1 1 3 1 6v8c0 3 1.8 5 4.8 5h8.4c3 0 4.8-2 4.8-5V6c0-3-1.8-5-4.8-5" />
    </svg>
  ),
  stories: (
    <svg width="15" height="20" fill="none" viewBox="0 0 15 20">
      <path d="M9.32 1H5.68C2.8 1 1 3.08 1 6.03v7.94C1 16.92 2.8 19 5.68 19h3.64C12.2 19 14 16.92 14 13.97V6.03C14 3.08 12.2 1 9.32 1" />
    </svg>
  ),
  ai: (
    <svg strokeLinecap="round" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path
        strokeWidth="1.5"
        d="M21 9.67C21 6.54 18.76 4 16 4H8C5.24 4 3 6.54 3 9.67v10.2c0 .62.45 1.13 1 1.13h12c2.76 0 5-2.54 5-5.67z"
        strokeOpacity=".4"
      />
      <path
        strokeWidth="1.2"
        d="m14.57 15.26.13-.38a5.1 5.1 0 0 1 2.94-3.1l.36-.15-.36-.14a5.1 5.1 0 0 1-2.94-3.1L14.57 8l-.13.38a5.1 5.1 0 0 1-2.94 3.11l-.36.14.36.14a5.1 5.1 0 0 1 2.94 3.11zM7.55 17c.23-.79.81-1.4 1.56-1.65a2.4 2.4 0 0 1-1.56-1.64A2.4 2.4 0 0 1 6 15.35 2.4 2.4 0 0 1 7.55 17"
      />
    </svg>
  ),
  statistics: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path strokeWidth="2" d="M7.48 10.27v6.7m4.56-9.9v9.9m4.48-3.16v3.15" />
      <path
        opacity=".3"
        strokeWidth="1.5"
        d="M2.3 12.05c0-7.3 2.44-9.74 9.74-9.74s9.73 2.44 9.73 9.74-2.43 9.73-9.73 9.73-9.74-2.43-9.74-9.73"
      />
    </svg>
  ),
  tools: (
    <svg width="18" height="18" fill="none" viewBox="0 0 20 20">
      <path
        opacity=".6"
        strokeWidth="0.8"
        d="M11.14 7.32 9.35 8.43a1.6 1.6 0 0 1-1.7 0l-.27.43.27-.43-1.79-1.11a1.7 1.7 0 0 1-.78-1.44V.64c.29.17.5.48.5.9v4.34c0 .4.2.77.54.98l1.79 1.11c.36.23.82.23 1.18 0l1.79-1.11c.34-.21.54-.58.54-.98V1.54c0-.42.21-.73.5-.9v5.24c0 .6-.3 1.14-.78 1.44ZM4.26 1.16 2.09 2.93a3 3 0 0 0-1.08 2.31V9.6c0 .78.3 1.54.86 2.1l3.32 3.35c.25.25.4.6.4.96v3.22c0 .16-.13.27-.26.27a.26.26 0 0 1-.25-.27v-3.21a.8.8 0 0 0-.24-.58l-3.32-3.35A3.5 3.5 0 0 1 .5 9.59V5.25c0-1.06.47-2.07 1.28-2.73L3.95.73A1 1 0 0 1 4.96.58zm8.48 0-.7-.58c.32-.13.7-.1 1 .15l2.18 1.78c.8.66 1.28 1.67 1.28 2.73V9.6c0 .93-.37 1.83-1.02 2.49l-3.32 3.34a.8.8 0 0 0-.24.59v3.21c0 .16-.12.27-.25.27a.26.26 0 0 1-.25-.27v-3.21c0-.37.14-.72.4-.97l3.3-3.35c.56-.56.87-1.32.87-2.1V5.24c0-.9-.4-1.74-1.08-2.3z"
      />
    </svg>
  ),
  direct: (
    <svg strokeWidth="1.5" width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M11.74 12.43S-.23 9.95 3.93 7.55c3.51-2.03 15.62-5.51 17.3-4.61.9 1.69-2.58 13.8-4.6 17.3-2.4 4.17-4.89-7.81-4.89-7.81" />
      <path opacity=".6" d="m11.74 12.43 9.5-9.5" />
    </svg>
  ),
  comments: (
    <svg strokeWidth="1.5" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path
        opacity=".4"
        d="M9.32 20.9H4.58a.79.79 0 0 1-.65-1.24l.65-.93a.9.9 0 0 0 .04-.95l-.87-1.6a8.2 8.2 0 0 1 1.63-9.22 8.12 8.12 0 0 1 12.15.73"
      />
      <path d="M15.86 20.9a5.2 5.2 0 0 1-3.97-1.85 5.2 5.2 0 0 1-.12-6.53 5.15 5.15 0 0 1 7.72-.47 5.2 5.2 0 0 1 1.03 5.85c-.07.18-.36.69-.55 1.02a.6.6 0 0 0 .03.6l.41.6a.5.5 0 0 1-.41.77z" />{" "}
    </svg>
  ),
  ticket: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path
        opacity=".4"
        strokeWidth="1.5"
        d="M15.16 9.6v.12M8.84 9.6v.12M12 9.6v.12m-.49 11.25c2.33 0 3.97.48 5.64-2.63m-1.5-8.71a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-6.31 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m3.16 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"
      />
      <path
        strokeWidth="1.2"
        d="M19.35 12.2v-1.85a7.35 7.35 0 0 0-14.7 0v1.85m14.31-.26a3.43 3.43 0 0 1-1.56 6.4 1.4 1.4 0 0 1-1.38-1.72l.91-3.8a1.4 1.4 0 0 1 2.03-.88m-13.92 0a3.43 3.43 0 0 0 1.55 6.4 1.4 1.4 0 0 0 1.39-1.72l-.91-3.8a1.4 1.4 0 0 0-2.03-.88"
      />
    </svg>
  ),
  AIAndFlow: (
    <svg strokeLinecap="round" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path
        strokeWidth="1.5"
        d="M21 9.67C21 6.54 18.76 4 16 4H8C5.24 4 3 6.54 3 9.67v10.2c0 .62.45 1.13 1 1.13h12c2.76 0 5-2.54 5-5.67z"
        strokeOpacity=".4"
      />
      <path
        strokeWidth="1.2"
        d="m14.57 15.26.13-.38a5.1 5.1 0 0 1 2.94-3.1l.36-.15-.36-.14a5.1 5.1 0 0 1-2.94-3.1L14.57 8l-.13.38a5.1 5.1 0 0 1-2.94 3.11l-.36.14.36.14a5.1 5.1 0 0 1 2.94 3.11zM7.55 17c.23-.79.81-1.4 1.56-1.65a2.4 2.4 0 0 1-1.56-1.64A2.4 2.4 0 0 1 6 15.35 2.4 2.4 0 0 1 7.55 17"
      />
    </svg>
  ),

  Properties: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path
        opacity=".4"
        strokeWidth="1.5"
        d="m10.06 20.73 1.1-.83q.38-.27.84-.26h0q.46 0 .84.26l1.1.83c.36.27.83.33 1.25.18q.45-.15.86-.35c.4-.2.7-.58.76-1.02l.2-1.37q.07-.44.37-.75l.04-.04q.31-.32.76-.38l1.37-.2c.44-.06.82-.35 1.01-.76q.21-.42.36-.86c.15-.42.09-.9-.18-1.25l-.83-1.11q-.26-.35-.27-.8v-.06q0-.45.27-.8l.83-1.1c.27-.37.33-.84.18-1.26q-.15-.45-.35-.86c-.2-.4-.58-.7-1.02-.76l-1.36-.2q-.46-.06-.78-.4h0a1.4 1.4 0 0 1-.4-.78l-.2-1.36a1.3 1.3 0 0 0-.76-1.01 10 10 0 0 0-.86-.36c-.42-.15-.9-.09-1.25.18l-1.1.83q-.38.26-.83.26h-.02q-.46 0-.83-.26l-1.1-.83a1.3 1.3 0 0 0-1.25-.18q-.45.15-.86.36c-.4.19-.7.57-.76 1.01L7 5.8q-.06.46-.4.78 0 0 0 0-.32.34-.78.4l-1.36.2c-.44.06-.82.35-1.02.76q-.2.42-.35.86c-.15.42-.09.9.18 1.25l.83 1.11a1.3 1.3 0 0 1 .27.86q0 .45-.27.8l-.83 1.1"
        strokeLinecap="round"
      />
      <path d="M10.37 15.92a4.01 4.01 0 0 0 5.12-5.3l-1.96 2.03a.8.8 0 0 1-.69.22l-.95-.17a.8.8 0 0 1-.6-.6l-.2-.94a.8.8 0 0 1 .19-.69l1.97-2.03a4 4 0 0 0-5.14 5.3l-3.46 3.49c-.62.64-.59 1.67.1 2.27.63.57 1.63.47 2.22-.15z" />{" "}
    </svg>
  ),
  payment: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M9.8 15.1a2.2 2.2 0 1 1 4.4 0 2.2 2.2 0 0 1-4.4 0 M17.6 9.18H6.4c-1.9 0-3.08 1.34-3.08 3.23v5.36C3.32 19.67 4.5 21 6.4 21h11.2c1.9 0 3.08-1.34 3.08-3.23v-5.36c0-1.89-1.19-3.23-3.08-3.23" />
      <path opacity=".6" strokeWidth="2" d="M8.12 6.34v-1.5m7.76 1.5v-1.5M12 6.34V3 M6.42 11.84h1.35m9.81 6.5h-1.36" />
    </svg>
  ),
  title: (
    <svg width="15" height="18" fill="none" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-5h2v5h-2zm0-7v-2h2v2h-2z" />
    </svg>
  ),
  home: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="m21 11.09-7.7-6.31a2.06 2.06 0 0 0-2.6 0L3 11.08m1.49-1.22 2.4 8.35a2.5 2.5 0 0 0 2.46 2.08h5.3a2.5 2.5 0 0 0 2.46-2.08l2.4-8.35" />
      <path
        opacity=".6"
        strokeWidth="1.5"
        d="M12 13.23a2.31 2.31 0 1 0 0-4.63 2.31 2.31 0 0 0 0 4.63m0 3.34v-.05m0-.14a.2.2 0 1 0 0 .4.2.2 0 0 0 0-.4"
      />
    </svg>
  ),
  mylink: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path
        opacity=".4"
        strokeWidth="2"
        d="M18.1 22H5.9A3.9 3.9 0 0 1 2 18.12V9.76c0-1.04.47-2.03 1.28-2.69l6.53-5.3a3.5 3.5 0 0 1 4.38 0l6.53 5.3A3.5 3.5 0 0 1 22 9.76v8.36A3.9 3.9 0 0 1 18.1 22"
      />
      <path
        strokeWidth="1.5"
        d="m9.48 11.65-.53.52c-1.05 1.06-.9 2.46.15 3.52 1.05 1.05 2.63 1.37 3.68.31l.53-.52m1.17-1.46.52-.52c1.05-1.06 1.03-2.47-.02-3.52a2.7 2.7 0 0 0-3.81-.03l-.52.53m2.3 1.36-2.14 2.14"
      />
    </svg>
  ),
  properties: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path
        opacity=".4"
        strokeWidth="1.5"
        d="m10.06 20.73 1.1-.83q.38-.27.84-.26h0q.46 0 .84.26l1.1.83c.36.27.83.33 1.25.18q.45-.15.86-.35c.4-.2.7-.58.76-1.02l.2-1.37q.07-.44.37-.75l.04-.04q.31-.32.76-.38l1.37-.2c.44-.06.82-.35 1.01-.76q.21-.42.36-.86c.15-.42.09-.9-.18-1.25l-.83-1.11q-.26-.35-.27-.8v-.06q0-.45.27-.8l.83-1.1c.27-.37.33-.84.18-1.26q-.15-.45-.35-.86c-.2-.4-.58-.7-1.02-.76l-1.36-.2q-.46-.06-.78-.4h0a1.4 1.4 0 0 1-.4-.78l-.2-1.36a1.3 1.3 0 0 0-.76-1.01 10 10 0 0 0-.86-.36c-.42-.15-.9-.09-1.25.18l-1.1.83q-.38.26-.83.26h-.02q-.46 0-.83-.26l-1.1-.83a1.3 1.3 0 0 0-1.25-.18q-.45.15-.86.36c-.4.19-.7.57-.76 1.01L7 5.8q-.06.46-.4.78 0 0 0 0-.32.34-.78.4l-1.36.2c-.44.06-.82.35-1.02.76q-.2.42-.35.86c-.15.42-.09.9.18 1.25l.83 1.11a1.3 1.3 0 0 1 .27.86q0 .45-.27.8l-.83 1.1"
        strokeLinecap="round"
      />
      <path d="M10.37 15.92a4.01 4.01 0 0 0 5.12-5.3l-1.96 2.03a.8.8 0 0 1-.69.22l-.95-.17a.8.8 0 0 1-.6-.6l-.2-.94a.8.8 0 0 1 .19-.69l1.97-2.03a4 4 0 0 0-5.14 5.3l-3.46 3.49c-.62.64-.59 1.67.1 2.27.63.57 1.63.47 2.22-.15z" />{" "}
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path opacity=".6" d="M4 9h16" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M15.89 2v3.26M8.12 2v3.26M3 12.73c0-6.96 2.25-9.28 9-9.28s9 2.32 9 9.28S18.75 22 12 22s-9-2.32-9-9.27"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        strokeWidth="1.2"
        opacity=".6"
        d="M8.5 13a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm0 4a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm-4 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm-4 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"
      />
    </svg>
  ),
  general: (
    <svg width="20" height="20" fill="none" viewBox="0 0 36 36">
      <path d="M28.67 4.29c.44-.27 1.01-.2 1.38.16l1.5 1.5c.36.37.43.94.16 1.38l-2.25 3.75a1.12 1.12 0 0 1-1.76.22l-3-3a1.13 1.13 0 0 1 .22-1.76z M8.84 3.44a6.37 6.37 0 0 1 7.09 7.9l8.73 8.73a6.37 6.37 0 0 1 7.9 7.09 1.13 1.13 0 0 1-1.9.64l-2.11-2.1h-2.68v3.03l1.93 1.92a1.12 1.12 0 0 1-.64 1.91 6.37 6.37 0 0 1-7.09-7.9l-8.74-8.73a6.37 6.37 0 0 1-7.89-7.09 1.12 1.12 0 0 1 1.9-.64l1.93 1.92h3.04V7.45l-2.1-2.1a1.13 1.13 0 0 1 .63-1.91" />
      <path
        opacity=".6"
        d="m11.55 18.8-6.5 6.5a3.15 3.15 0 0 0 0 4.46l1.19 1.2a3.15 3.15 0 0 0 4.45 0l6.51-6.52zm9.27-5.22 1.6 1.6 5.37-5.4L26.2 8.2z"
      />
    </svg>
  ),
  subAdmin: (
    <svg
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="22"
      height="22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 22">
      <path
        opacity=".4"
        d="M12.07 3.16h2.14c2.82 0 4.56 1.57 4.55 4.43v8.72c0 2.87-1.74 4.44-4.56 4.44H6.13c-2.8 0-4.56-1.6-4.56-4.52V7.6c0-2.86 1.76-4.43 4.56-4.43h2.12m2.85 2.12H9.23a.97.97 0 0 1-.97-.98V2.23c0-.54.43-.98.97-.98h1.87c.54 0 .98.44.98.98V4.3c0 .54-.44.98-.98.98"
      />
      <path d="M6.62 17.23c0-1.16.91-2.6 3.55-2.6s3.55 1.43 3.55 2.59m-1.29-7.24a2.27 2.27 0 1 1-4.53 0 2.27 2.27 0 0 1 4.53 0" />
    </svg>
  ),
  helpcenter: (
    <svg
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="22"
      height="22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 21 18">
      <path d="M10.4658 11.9512v.0145m-.0011-2.0183c-.0077-.6351.5692-.9047.9988-1.15.5236-.289.8795-.7486.8795-1.3867 0-.9444-.7651-1.7037-1.7037-1.7037a1.6986 1.6986 0 0 0-1.7038 1.7037m-5.2668 8.7217c.5197.9018 1.6736 1.2102 2.5744.6895.8999-.5208 1.2082-1.6718.6885-2.5716l-1.5825-2.7432c-.5197-.9008-1.6707-1.2102-2.5716-.6904l-.222.127c-.5653.3268-.8504.9978-.6574 1.6213.3432 1.1112.9318 2.3068 1.7706 3.5674m13.669 0c-.5197.9018-1.6736 1.2102-2.5745.6895-.8998-.5208-1.2082-1.6718-.6884-2.5716l1.5825-2.7432c.5197-.9008 1.6707-1.2102 2.5725-.6904l.2211.127c.5653.3268.8504.9978.6574 1.6213-.3432 1.1112-.9318 2.3068-1.7706 3.5674" />
      <path
        opacity=".4"
        d="M18.7272 13.5703A8.97 8.97 0 0 0 19.5 9.9224c0-4.9696-4.0348-8.9966-9.0044-8.9966C5.5338.9258 1.5 4.9528 1.5 9.9224c0 1.1277.2085 2.2108.5876 3.1999"
      />
    </svg>
  ),
  products: (
    <svg width="22" height="22" fill="none" viewBox="0 0 21 20">
      <path
        strokeWidth="1.5"
        opacity=".4"
        d="M6.11 1.02 14.54 1c2.95 0 4.78 2.07 4.79 5.01l.02 7.94c0 2.94-1.82 5.02-4.77 5.03L6.16 19c-2.95 0-4.79-2.07-4.8-5.01l-.01-7.94c0-2.94 1.83-5.02 4.76-5.03"
      />
      <path
        strokeWidth="1.2"
        d="m6.1 7.52 4.25 2.46 4.24-2.46m-4.24 7.4V9.98 M14.78 8.2v3.6c0 .47-.25.9-.65 1.13L11 14.73c-.4.24-.9.24-1.3 0l-3.13-1.8a1.3 1.3 0 0 1-.65-1.13V8.2c0-.48.25-.9.65-1.14l3.13-1.8c.4-.24.9-.24 1.3 0l3.13 1.8c.4.23.65.66.65 1.13"
      />
    </svg>
  ),
  orders: (
    <svg width="20" height="20" fill="none" viewBox="0 0 17 20">
      <path
        strokeWidth="1.2"
        opacity=".8"
        d="M12.18 2.6a3.75 3.75 0 0 1 3.75 3.75v8.9A3.75 3.75 0 0 1 12.18 19H4.82a3.75 3.75 0 0 1-3.75-3.75v-8.9a3.75 3.75 0 0 1 3.75-3.76 M10.65 16h1.7c.36 0 .65-.3.65-.65v-1.7c0-.36-.3-.65-.66-.65h-1.69c-.36 0-.65.3-.65.65v1.7c0 .36.3.65.65.65"
      />
      <path
        strokeWidth="1.5"
        opacity=".4"
        d="M5 10.84h3M5 8h1.2 M10.82 4.29H6.18c-.75 0-1.36-.61-1.36-1.36v-.57c0-.75.6-1.36 1.36-1.36h4.64c.75 0 1.36.6 1.36 1.36v.57c0 .75-.6 1.36-1.36 1.36"
      />
    </svg>
  ),
  adlist: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path opacity=".6" strokeWidth="2" d="M18 7a6.6 6.6 0 0 1 0 7m3-9a8.56 8.56 0 0 1 0 11" />
      <path
        strokeWidth="1.5"
        d="m4.86 22-1.27-5.05M1 11.5c0 1.56 0 3.4 1.2 4.5s2.17.64 3.72 1.2c1.56.54 3.75 3.94 6.16 2.4 1.3-.99 1.92-2.86 1.92-8.1s-.59-7.1-1.92-8.1c-2.41-1.54-4.6 1.86-6.16 2.4-1.55.56-2.51.1-3.72 1.2C1 8.1 1 9.94 1 11.5"
      />
    </svg>
  ),
};

const NavbarTabs = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const newRoute = router.route.replaceAll("/", "");

  const navbarMapping: { [key: string]: INavbar } = {
    pageposts: {
      id: "posts",
      indexValue: "page",
      items: ["posts", "stories", "ai", "statistics", "tools"],
      initialSlide: 0,
    },
    pagestories: {
      id: "stories",
      indexValue: "page",
      items: ["posts", "stories", "ai", "statistics", "tools"],
      initialSlide: 1,
    },
    pageai: {
      id: "ai",
      indexValue: "page",
      items: ["posts", "stories", "ai", "statistics", "tools"],
      initialSlide: 2,
    },
    pagestatistics: {
      id: "statistics",
      indexValue: "page",
      items: ["posts", "stories", "ai", "statistics", "tools"],
      initialSlide: 3,
    },
    pagetools: {
      id: "tools",
      indexValue: "page",
      items: ["posts", "stories", "ai", "statistics", "tools"],
      initialSlide: 4,
    },
    messagedirect: {
      id: "direct",
      items: ["direct", "comments", "ticket", "AIAndFlow", "Properties"],
      indexValue: "message",
      initialSlide: 0,
    },
    messagecomments: {
      id: "comments",
      items: ["direct", "comments", "ticket", "AIAndFlow", "Properties"],
      indexValue: "message",
      initialSlide: 1,
    },
    messageticket: {
      id: "ticket",
      items: ["direct", "comments", "ticket", "AIAndFlow", "Properties"],
      indexValue: "message",
      initialSlide: 2,
    },
    messageAIAndFlow: {
      id: "AIAndFlow",
      items: ["direct", "comments", "ticket", "AIAndFlow", "Properties"],
      indexValue: "message",
      initialSlide: 3,
    },
    messageAIAndFlowflowGraph: {
      id: "AIAndFlow",
      items: ["direct", "comments", "ticket", "AIAndFlow", "Properties"],
      indexValue: "message",
      initialSlide: 3,
    },
    messageProperties: {
      id: "Properties",
      items: ["direct", "comments", "ticket", "AIAndFlow", "Properties"],
      indexValue: "message",
      initialSlide: 4,
    },
    walletstatistics: {
      id: "statistics",
      items: ["statistics", "payment"],
      indexValue: "wallet",
      initialSlide: 0,
    },
    walletpayment: {
      id: "payment",
      items: ["statistics", "payment"],
      indexValue: "wallet",
      initialSlide: 1,
    },
    wallettitle: {
      id: "title",
      items: ["statistics", "payment"],
      indexValue: "wallet",
      initialSlide: 1,
    },
    // markethome: {
    //   id: "home",
    //   items: ["statistics", "mylink", "properties"],
    //   indexValue: "market",
    //   initialSlide: 0,
    // },
    marketstatistics: {
      id: "statistics",
      items: ["statistics", "mylink", "properties"],
      indexValue: "market",
      initialSlide: 0,
    },
    marketmylink: {
      id: "mylink",
      items: ["statistics", "mylink", "properties"],
      indexValue: "market",
      initialSlide: 0,
    },
    marketproperties: {
      id: "properties",
      items: ["statistics", "mylink", "properties"],
      indexValue: "market",
      initialSlide: 0,
    },

    advertisecalendar: {
      id: "calendar",
      items: ["calendar", "adlist", "statistics", "Properties"],
      indexValue: "advertise",
      initialSlide: 0,
    },
    advertisestatistics: {
      id: "statistics",
      items: ["calendar", "adlist", "statistics", "Properties"],
      indexValue: "advertise",
      initialSlide: 0,
    },
    advertiseadlist: {
      id: "adlist",
      items: ["calendar", "adlist", "statistics", "Properties"],
      indexValue: "advertise",
      initialSlide: 0,
    },
    advertiseProperties: {
      id: "Properties",
      items: ["calendar", "adlist", "statistics", "Properties"],
      indexValue: "advertise",
      initialSlide: 0,
    },

    storeproducts: {
      id: "products",
      items: ["products", "orders", "statistics", "properties"],
      indexValue: "store",
      initialSlide: 0,
    },
    storeorders: {
      id: "orders",
      items: ["products", "orders", "statistics", "properties"],
      indexValue: "store",
      initialSlide: 0,
    },
    storestatistics: {
      id: "statistics",
      items: ["products", "orders", "statistics", "properties"],
      indexValue: "store",
      initialSlide: 0,
    },
    storeproperties: {
      id: "properties",
      items: ["products", "orders", "statistics", "properties"],
      indexValue: "store",
      initialSlide: 0,
    },
    settinggeneral: {
      id: "general",
      items: ["general", "subAdmin", "helpcenter"],
      indexValue: "setting",
      initialSlide: 0,
    },
    settingsubAdmin: {
      id: "subAdmin",
      items: ["general", "subAdmin", "helpcenter"],
      indexValue: "setting",
      initialSlide: 0,
    },
    settinghelpcenter: {
      id: "helpcenter",
      items: ["general", "subAdmin", "helpcenter"],
      indexValue: "setting",
      initialSlide: 0,
    },
  };

  const navbar2 = navbarMapping[newRoute] || null;

  const labelMapping: { [key: string]: string } = {
    posts: t(LanguageKey.navbar_Post),
    stories: t(LanguageKey.navbar_Story),
    ai: t(LanguageKey.navbar_AI),
    statistics: t(LanguageKey.navbar_Statistics),
    direct: t(LanguageKey.navbar_Direct),
    comments: t(LanguageKey.navbar_Comments),
    ticket: t(LanguageKey.navbar_Ticket),
    Properties: t(LanguageKey.navbar_Properties),
    AIAndFlow: t(LanguageKey.navbar_AIAndFlow),
    payment: t(LanguageKey.navbar_Payment),
    title: t(LanguageKey.navbar_Title),
    home: t(LanguageKey.navbar_Home),
    mylink: t(LanguageKey.navbar_MyLink),
    properties: t(LanguageKey.navbar_Properties),
    calendar: t(LanguageKey.navbar_Calendar),
    general: t(LanguageKey.navbar_General),
    subAdmin: t(LanguageKey.navbar_SubAdmin),
    helpcenter: t(LanguageKey.navbar_HelpCenter),
    products: t(LanguageKey.navbar_Products),
    orders: t(LanguageKey.navbar_Orders),
    adlist: t(LanguageKey.navbar_AdList),
    tools: t(LanguageKey.navbarTools),
  };

  useEffect(() => {
    const element = document.getElementById("section-1");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const isEmpty = !navbar2 || !navbar2.items || navbar2.items.length === 0;

  return (
    <>
      <nav className={`${styles.pageTitleSet} ${isEmpty ? styles.empty : ""}`} aria-label="Main navigation">
        {navbar2 &&
          navbar2.items.map((v, i) => (
            <Link
              href={`/${navbar2.indexValue}/${v}`}
              id={v}
              key={i}
              className={styles.pageTitle}
              aria-current={v === navbar2.id ? "page" : undefined}
              title={labelMapping[v]}>
              {v === navbar2.id ? (
                <>
                  <b className={styles.title1}>
                    {svgMapping[v]}
                    <span>{labelMapping[v]}</span>
                  </b>
                </>
              ) : (
                <>
                  <div className={styles.title2}>
                    {svgMapping[v]}
                    <span>{labelMapping[v]}</span>
                  </div>
                </>
              )}
            </Link>
          ))}
      </nav>
    </>
  );
};

export default NavbarTabs;
