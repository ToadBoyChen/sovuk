import Link from "next/link";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}

const VARIANTS = {
  primary: "bg-sovereign text-paper hover:bg-ink",
  secondary: "border border-ink text-ink hover:bg-ink hover:text-paper",
  ghost: "text-ink hover:text-sovereign",
};

/** Link styled as a button, with an arrow that nudges on hover. */
function Button({ href, children, variant = "primary", className = "" }: ButtonProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 px-6 py-4 text-base font-medium md:px-7 md:text-lg transition-colors duration-300 ${VARIANTS[variant]} ${className}`}
    >
      {children}
      <span
        aria-hidden
        className="transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}

export default Button;
