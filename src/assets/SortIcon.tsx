import React, { SVGProps } from 'react';

interface ArrowIconProps extends SVGProps<SVGSVGElement> {}

const ArrowIcon: React.FC<ArrowIconProps> = (props) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            {...props}
        >
            <path
                d="M7.63214 2.66799L5.54503 5.75066C5.34503 6.04577 5.55659 6.44399 5.91303 6.44399H10.0873C10.4437 6.44399 10.6553 6.04577 10.4553 5.75066L8.36814 2.66799C8.19214 2.40755 7.80814 2.40755 7.63214 2.66799Z"
                fill="white"
                stroke="#334155"
                strokeWidth="1.33333"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M7.63214 13.3326L5.54503 10.25C5.34503 9.95486 5.55659 9.55664 5.91303 9.55664H10.0873C10.4437 9.55664 10.6553 9.95486 10.4553 10.25L8.36814 13.3326C8.19214 13.5931 7.80814 13.5931 7.63214 13.3326Z"
                fill="white"
                stroke="#334155"
                strokeWidth="1.33333"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
  
  export default ArrowIcon;
  