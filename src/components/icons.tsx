import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g transform="translate(0, 2)">
        <path
          d="M17.6569 2H6.34315C4.42417 2 2.85929 3.5293 2.85929 5.4V18.6C2.85929 20.4707 4.42417 22 6.34315 22H17.6569C19.5758 22 21.1407 20.4707 21.1407 18.6V5.4C21.1407 3.5293 19.5758 2 17.6569 2Z"
          className="fill-primary/20 stroke-primary/50"
          transform="rotate(-15 12 12)"
        />
        <path
          d="M17.6569 2H6.34315C4.42417 2 2.85929 3.5293 2.85929 5.4V18.6C2.85929 20.4707 4.42417 22 6.34315 22H17.6569C19.5758 22 21.1407 20.4707 21.1407 18.6V5.4C21.1407 3.5293 19.5758 2 17.6569 2Z"
          className="fill-primary/20 stroke-primary/50"
          transform="rotate(15 12 12)"
        />
        <path
          d="M17.6569 2H6.34315C4.42417 2 2.85929 3.5293 2.85929 5.4V18.6C2.85929 20.4707 4.42417 22 6.34315 22H17.6569C19.5758 22 21.1407 20.4707 21.1407 18.6V5.4C21.1407 3.5293 19.5758 2 17.6569 2Z"
          className="fill-card stroke-primary"
        />
        <path
          d="M12.0003 8.24316C13.4393 6.48316 16.0003 6.48316 17.4393 8.24316C18.8793 10.0032 17.4393 12.8572 12.0003 16.9712C6.56129 12.8572 5.12129 10.0032 6.56129 8.24316C7.99429 6.48316 10.5613 6.48316 12.0003 8.24316Z"
          className="fill-primary stroke-primary"
        />
      </g>
    </svg>
  );
}
