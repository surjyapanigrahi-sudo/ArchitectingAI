"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function PrivacyContactReturn() {
  const router = useRouter();
  return <Link href="/contact" onClick={event => {
    // A policy opened from Contact has its own tab. Reveal the original draft
    // without sharing enquiry data or granting the new tab access to its opener.
    if (new URLSearchParams(window.location.search).get("from") !== "contact") return;
    if (window.history.length > 1) return;
    event.preventDefault();
    window.close();
    // Browsers that disallow closing still have a working Contact destination.
    window.setTimeout(() => { router.replace("/contact"); }, 150);
  }}>← Back to Contact Us</Link>;
}
