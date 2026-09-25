"use client";

import Arrow from "@/components/ui/Arrow";

/**
 * Saves the page as a PDF through the browser's print dialog, which the
 * print stylesheet turns into a clean document (see globals.css).
 */
function PdfButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="group inline-flex items-center gap-3 border border-ink px-5 py-3 text-base font-medium transition-colors duration-300 hover:bg-ink hover:text-paper print:hidden"
    >
      Download PDF
      <Arrow direction="down" />
    </button>
  );
}

export default PdfButton;
