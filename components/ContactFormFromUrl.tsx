"use client";

import { useSearchParams } from "next/navigation";
import ContactForm from "@/components/ContactForm";

/** The contact form, preselecting the founder named in ?to=<slug>. */
function ContactFormFromUrl() {
  return <ContactForm to={useSearchParams().get("to") ?? ""} />;
}

export default ContactFormFromUrl;
