// This component are converted to SVG using Satori. So there are restrictions on the CSS that can be used.
// ref: https://github.com/vercel/satori?tab=readme-ov-file#css
export const scoreboard = ({
  score,
  filledCellsNumber,
}: {
  score: number;
  filledCellsNumber: number;
}) => (
  <div
    style={{
      display: "flex",
      width: "100%",
      height: "100%",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "1rem",
      borderRadius: "0.25rem",
      border: "1px solid #e5e5e5",
      backgroundColor: "#ffffff",
    }}
  >
    <div
      style={{
        marginBottom: "2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.25rem",
      }}
    >
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative icon */}
      <svg
        width="40"
        height="40"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
        <path d="M5 21h14" />
      </svg>
    </div>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
      }}
    >
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
        <circle cx="12" cy="8" r="6" />
      </svg>
      <span
        style={{
          fontWeight: "900",
          fontSize: "2.25rem",
        }}
      >
        {score}
      </span>
    </div>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
      }}
    >
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
      <span
        style={{
          fontWeight: "900",
          fontSize: "2.25rem",
        }}
      >
        {filledCellsNumber}
      </span>
    </div>
  </div>
);
