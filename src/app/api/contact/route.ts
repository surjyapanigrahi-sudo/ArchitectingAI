import { isIP } from "node:net";
import { handleContact } from "@/modules/contact/service";
import { createContactClient } from "@/lib/supabase/contact-server";
export const runtime="nodejs";
export async function POST(request:Request){
 const production=process.env.NODE_ENV==="production";
 const candidateIp=process.env.NETLIFY==="true"?request.headers.get("x-nf-client-connection-ip"):production?null:"local-development";
 const clientIp=candidateIp&&(candidateIp==="local-development"||isIP(candidateIp))?candidateIp:null;
 return handleContact(request,{enabled:process.env.CONTACT_ENABLED==="true",origins:(process.env.CONTACT_ALLOWED_ORIGINS||"").split(",").map(s=>s.trim()).filter(Boolean),hashSecret:process.env.CONTACT_HASH_SECRET||"",clientIp},async args=>{
 const {data,error}=await createContactClient().rpc("submit_contact_enquiry",{p_request_id:args.requestId,p_fingerprint:args.fingerprint,p_ip_hash:args.ipHash,p_email_hash:args.emailHash,p_enquiry:args.enquiry});
 if(error)throw new Error("Persistence failed");return data;
 });
}
