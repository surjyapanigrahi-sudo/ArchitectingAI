import { createHmac } from "node:crypto";
import { validateEnquiry, getEnquiryFieldErrors, type Enquiry } from "./validation.ts";
export { validateEnquiry, enquiryTypes } from "./validation.ts";
export type ContactConfig = { enabled:boolean; origins:string[]; hashSecret:string; clientIp:string|null };
export type Persist = (args:{requestId:string; fingerprint:string; ipHash:string; emailHash:string; enquiry:Enquiry})=>Promise<string>;
const reply=(status:number,error?:string)=>Response.json(error?{error}:{ok:true},{status,headers:{"Cache-Control":"no-store"}});
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
 const enquiry=validateEnquiry(input);if(!enquiry)return Response.json({error:"Check the enquiry fields and privacy acknowledgement.",fields:input&&typeof input==="object"&&!Array.isArray(input)?getEnquiryFieldErrors(input as Record<string,unknown>):{}},{status:400,headers:{"Cache-Control":"no-store"}});
 const hash=(value:string)=>createHmac("sha256",config.hashSecret).update(value).digest("hex");
 try{
  const result=await persist({requestId:requestId.toLowerCase(),fingerprint:hash(JSON.stringify(enquiry)),ipHash:hash("ip:"+config.clientIp),emailHash:hash("email:"+enquiry.email),enquiry});
  if(result==="rate_limited")return new Response(JSON.stringify({error:"Too many enquiries. Please try again later."}),{status:429,headers:{"Content-Type":"application/json","Cache-Control":"no-store","Retry-After":"900"}});
  if(result==="conflict")return reply(409,"Start a new enquiry before changing submitted details.");
  if(result!=="saved"&&result!=="duplicate")throw new Error("Persistence not confirmed");
  return reply(200);
 }catch{return reply(503,"We could not save your enquiry. Please retry with the same request.");}
}
