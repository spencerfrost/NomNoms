export default function BackgroundGradient() {
  return (
    <div className="absolute -z-10 w-full h-full top-0 left-0 overflow-hidden">
      <svg
        className="w-full h-full absolute"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1728 1117"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base background - uses your theme background color */}
        <rect width="1728" height="1117" className="fill-background" />

        <g clipPath="url(#clip0_922_15)">
          {/* First set of blurred circles */}
          <g filter="url(#filter0_f_922_15)">
            <path
              d="M1445 -930C1798.46 -930 2085 -643.462 2085 -290C2085 63.4622 1798.46 350 1445 350C1091.54 350 805 63.4622 805 -290C805 -643.462 1091.54 -930 1445 -930ZM167 -241C286.846 -241 384 -143.846 384 -24C384 95.8458 286.846 193 167 193C47.1542 193 -50 95.8458 -50 -24C-50 -143.846 47.1542 -241 167 -241Z"
              className="fill-primary/20 dark:fill-primary/30"
            />
          </g>

          {/* Second set of blurred circles */}
          <g filter="url(#filter1_f_922_15)">
            <path
              d="M1288.5 966C1531.23 966 1728 1162.77 1728 1405.5C1728 1648.23 1531.23 1845 1288.5 1845C1045.77 1845 849 1648.23 849 1405.5C849 1162.77 1045.77 966 1288.5 966ZM-99 662C20.8458 662 118 759.154 118 879C118 998.846 20.8458 1096 -99 1096C-218.846 1096 -316 998.846 -316 879C-316 759.154 -218.846 662 -99 662ZM620.5 497C671.586 497 713 538.414 713 589.5C713 640.586 671.586 682 620.5 682C569.414 682 528 640.586 528 589.5C528 538.414 569.414 497 620.5 497Z"
              className="fill-secondary/15 dark:fill-secondary/25"
            />
          </g>
        </g>

        <defs>
          {/* Blur filters */}
          <filter
            id="filter0_f_922_15"
            x="-434"
            y="-1314"
            width="2903"
            height="2048"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="192" result="effect1_foregroundBlur_922_15" />
          </filter>

          <filter
            id="filter1_f_922_15"
            x="-700"
            y="113"
            width="2812"
            height="2116"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="192" result="effect1_foregroundBlur_922_15" />
          </filter>

          {/* Clipping path */}
          <clipPath id="clip0_922_15">
            <rect width="1728" height="1117" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
