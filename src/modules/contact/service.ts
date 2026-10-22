import { createHmac } from "node:crypto";
export const enquiryTypes = ["Business Partnership", "Course Enquiry", "AI Video Generation Solution", "General Enquiry"] as const;
export type Enquiry = { full_name:string; email:string; phone:string|null; enquiry_type:string; message:string; consent_version:string };
export type ContactConfig = { enabled:boolean; origins:string[]; hashSecret:string; clientIp:string|null };
export type Persist = (args:{requestId:string; fingerprint:string; ipHash:string; emailHash:string; enquiry:Enquiry})=>Promise<string>;
const reply=(status:number,error?:string)=>Response.json(error?{error}:{ok:true},{status,headers:{"Cache-Control":"no-store"}});
export function validateEnquiry(input:unknown):Enquiry|null {
 if(!input||typeof input!=="object"||Array.isArray(input))return null;
 const value=input as Record<string,unknown>;
 if(Object.keys(value).some(key=>!["full_name","email","phone","enquiry_type","message","website","consent"].includes(key)))return null;
 if(value.website!==""||value.consent!==true)return null;
 for(const key of ["full_name","email","enquiry_type","message"])if(typeof value[key]!=="string")return null;
 if(value.phone!==undefined&&typeof value.phone!=="string")return null;
 const full_name=(value.full_name as string).trim(),email=(value.email as string).trim().toLowerCase(),message=(value.message as string).trim(),phone=typeof value.phone==="string"?value.phone.trim():"";
 if(full_name.length<2||full_name.length>120||email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||phone.length>40||message.length<10||message.length>5000||!enquiryTypes.includes(value.enquiry_type as typeof enquiryTypes[number]))return null;
 if(/[\u0000-\u001f\u007f]/.test(full_name+email+phone)||/[\u0000\u000b\u000c]/.test(message))return null;
 return {full_name,email,phone:phone||null,enquiry_type:value.enquiry_type as string,message,consent_version:"contact-2026-10-review-1"};
}
export async function handleContact(request:Request,config:ContactConfig,persist:Persist):Promise<Response>{
 if(!config.enabled)return reply(503,"Enquiries are not enabled yet.");
 if(!config.origins.includes(request.headers.get("origin")||""))return reply(403,"Request not permitted.");
 if(request.headers.get("content-type")?.split(";")[0].trim()!=="application/json")return reply(415,"Use JSON.");
 if(!config.clientIp||config.hashSecret.length<32)return reply(503,"Enquiries are temporarily unavailable.");
 const requestId=request.headers.get("idempotency-key")||"";
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId))return reply(400,"Invalid request identifier.");
 let input:unknown;
 try{
  const reader=request.body?.getReader();if(!reader)return reply(400,"Invalid enquiry.");
  let size=0;const chunks:Uint8Array[]=[];
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>32768){await reader.cancel();return reply(413,"Enquiry is too large.");}chunks.push(value);}
  input=JSON.parse(Buffer.concat(chunks).toString("utf8"));
 }catch{return reply(400,"Invalid enquiry.");}
 const enquiry=validateEnquiry(input);if(!enquiry)return reply(400,"Check the enquiry fields and privacy acknowledgement.");
 const hash=(value:string)=>createHmac("sha256",config.hashSecret).update(value).digest("hex");
 try{
  const result=await persist({requestId:requestId.toLowerCase(),fingerprint:hash(JSON.stringify(enquiry)),ipHash:hash("ip:"+config.clientIp),emailHash:hash("email:"+enquiry.email),enquiry});
  if(result==="rate_limited")return new Response(JSON.stringify({error:"Too many enquiries. Please try again later."}),{status:429,headers:{"Content-Type":"application/json","Cache-Control":"no-store","Retry-After":"900"}});
  if(result==="conflict")return reply(409,"Start a new enquiry before changing submitted details.");
  if(result!=="saved"&&result!=="duplicate")throw new Error("Persistence not confirmed");
  return reply(200);
 }catch{return reply(503,"We could not save your enquiry. Please retry with the same request.");}
}
