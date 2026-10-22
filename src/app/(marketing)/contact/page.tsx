export const dynamic="force-dynamic";
import type { Metadata } from "next";
import { EnquiryForm } from "@/components/contact/enquiry-form";
export const metadata:Metadata={title:"Contact Architecting AI",description:"Enquiries about AI courses, learning solutions and education partnerships."};
export default function Contact(){return <div className="academy-inner-page"><header className="inner-hero"><p className="academy-kicker">Contact us</p><h1>Contact Architecting AI</h1><p>Have a question about our courses, AI learning solutions or business partnerships? Share your details and we&apos;ll get back to you.</p></header><EnquiryForm enabled={process.env.CONTACT_ENABLED==="true"}/></div>}
