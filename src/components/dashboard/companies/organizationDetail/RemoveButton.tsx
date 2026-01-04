import React from 'react';

const RemoveButton = () => (
  <div className="flex flex-col items-start">
    <div className="flex flex-col justify-center items-center gap-2 h-10 w-[158px] rounded-[0.3125rem] border border-[#d8dadc] bg-white">
      <div className="state-layer flex justify-center items-center gap-2 self-stretch py-2 px-6">
        <svg
          width={18}
          height={18}
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <mask id="path-1-inside-1_54877_9000" fill="white">
            <path d="M13.6049 4.75L13.0989 14.355C13.0429 15.417 12.1649 16.25 11.1019 16.25H6.89692C5.83292 16.25 4.95592 15.417 4.89992 14.355L4.39392 4.75" />
          </mask>
          <path
            d="M13.6049 4.75L13.0989 14.355C13.0429 15.417 12.1649 16.25 11.1019 16.25H6.89692C5.83292 16.25 4.95592 15.417 4.89992 14.355L4.39392 4.75"
            fill="white"
          />
          <path
            d="M13.0989 14.355L14.0976 14.4077L14.0976 14.4076L13.0989 14.355ZM4.89992 14.355L3.90131 14.4076L3.90131 14.4077L4.89992 14.355ZM12.6063 4.69739L12.1003 14.3024L14.0976 14.4076L14.6036 4.80261L12.6063 4.69739ZM12.1003 14.3023C12.0723 14.8335 11.6329 15.25 11.1019 15.25V17.25C12.697 17.25 14.0136 16.0005 14.0976 14.4077L12.1003 14.3023ZM11.1019 15.25H6.89692V17.25H11.1019V15.25ZM6.89692 15.25C6.36527 15.25 5.92656 14.8338 5.89853 14.3023L3.90131 14.4077C3.98529 16.0002 5.30058 17.25 6.89692 17.25V15.25ZM5.89854 14.3024L5.39254 4.69739L3.39531 4.80261L3.90131 14.4076L5.89854 14.3024Z"
            fill="#1E4477"
            mask="url(#path-1-inside-1_54877_9000)"
          />
          <path
            d="M13.6049 4.75L13.0989 14.355C13.0429 15.417 12.1649 16.25 11.1019 16.25H6.89692C5.83292 16.25 4.95592 15.417 4.89992 14.355L4.39392 4.75"
            stroke="#1E4477"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.75 4.75H15.25"
            stroke="#1E4477"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.75 4.75V2.75C6.75 2.198 7.198 1.75 7.75 1.75H10.25C10.802 1.75 11.25 2.198 11.25 2.75V4.75"
            stroke="#1E4477"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.375 8L7.625 13"
            stroke="#1E4477"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.625 8L10.375 13"
            stroke="#1E4477"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="label-text text-[#1e4477] text-center font-medium text-sm leading-5">
          Remove
        </div>
      </div>
    </div>
  </div>
);

export default RemoveButton;