import React from "react";

type Props = {
  heading: string | null;
  children: React.ReactNode;
  tag: string | null;
  className?: string;
};

const DashboardLayout = (props: Props) => {
  return (
    <div className="flex h-full w-full flex-col gap-1 bg-gray-100 px-10 pt-6 pb-2">
      <div className="flex flex-row items-center justify-start gap-3">
        {props.heading && (
          <h1 className={props.className || "text-2xl"}>{props.heading}</h1>
        )}
        {props.tag && (
          <div
            className="flex items-center"
            style={{
              display: "flex",
              height: "28px",
              padding: "5px 10px",
              alignItems: "center",
              gap: "10px",
              borderRadius: "1000px",
              background: "var(--Secondary-Night, #122947)",
            }}
          >
            <span
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 1,
                overflow: "hidden",
                color: "var(--White, #FFF)",
                textOverflow: "ellipsis",
                fontSize: "11px",
                lineHeight: "16px",
                letterSpacing: "0.5px",
              }}
            >
              {props.tag}
            </span>
          </div>
        )}
      </div>
      {props.children}
    </div>
  );
};

export default DashboardLayout;
