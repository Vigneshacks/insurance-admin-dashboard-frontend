

const DocumentIcon = ({ width = 24, height = 24, className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15 5.6665H9.66667C8.19333 5.6665 7 6.85984 7 8.33317V18.9998C7 20.4732 8.19333 21.6665 9.66667 21.6665H17.6667C19.14 21.6665 20.3333 20.4732 20.3333 18.9998V10.9998H16.3333C15.5973 10.9998 15 10.4025 15 9.6665V5.6665Z"
        fill="white"
      />
      <path
        d="M7 17.6665H5.66667C4.19333 17.6665 3 16.4732 3 14.9998V4.33317C3 2.85984 4.19333 1.6665 5.66667 1.6665H12.3333C13.8067 1.6665 15 2.85984 15 4.33317V5.73584"
        stroke="#1E4477"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 18.9998V8.33317C7 6.85984 8.19333 5.6665 9.66667 5.6665H15.1147C15.468 5.6665 15.808 5.8065 16.0573 6.05717L19.9427 9.9425C20.1933 10.1932 20.3333 10.5318 20.3333 10.8852V18.9998C20.3333 20.4732 19.14 21.6665 17.6667 21.6665H9.66667C8.19333 21.6665 7 20.4732 7 18.9998Z"
        stroke="#1E4477"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.3333 10.9998H16.3333C15.5973 10.9998 15 10.4025 15 9.6665V5.6665"
        stroke="#1E4477"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DocumentIcon;