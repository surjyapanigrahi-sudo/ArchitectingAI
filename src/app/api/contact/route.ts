import { parseBoolean } from "@/config/boolean";
import { getContactClientIp } from "@/modules/contact/client-ip";
import { handleContact } from "@/modules/contact/service";
import { createContactClient } from "@/lib/supabase/contact-server";
export const runtime="nodejs";
export async function POST(request:Request){
 const clientIp=getContactClientIp();
 return handleContact(request,{enabled:parseBoolean(process.env.CONTACT_ENABLED),origins:(process.env.CONTACT_ALLOWED_ORIGINS||"").split(",").map(s=>s.trim()).filter(Boolean),hashSecret:process.env.CONTACT_HASH_SECRET||"",clientIp},async args=>{
 const {data,error}=await createContactClient().rpc("submit_contact_enquiry",{p_request_id:args.requestId,p_fingerprint:args.fingerprint,p_ip_hash:args.ipHash,p_email_hash:args.emailHash,p_enquiry:args.enquiry});
 if(error)throw new Error("Persistence failed");return data;
 });
}
