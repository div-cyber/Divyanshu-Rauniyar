import React, { useEffect, useState } from "react";

export default function Loader({ exiting }: { exiting?: boolean } = {}) {
  const fullName = "Divyanshu";
  const [text, setText] = useState("");

  useEffect(() => {
    let mounted = true;
    let i = 0;
    const interval = setInterval(() => {
      if (!mounted) return;
      i += 1;
      setText(fullName.slice(0, i));
      if (i >= fullName.length) {
        clearInterval(interval);
      }
    }, 120);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`loader-root ${exiting ? "loader-exit" : ""}`}>
      <div className="loader-center">
        <div className="loader-name" aria-hidden>
          {text}
          <span className="loader-cursor">|</span>
        </div>
        <div className="loader-spinner" aria-hidden>
          <svg className="loader-ring" viewBox="0 0 50 50">
            <circle className="loader-ring-bg" cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
            <circle className="loader-ring-fg" cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
