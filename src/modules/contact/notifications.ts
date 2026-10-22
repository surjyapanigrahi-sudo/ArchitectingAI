export type NotificationJob={job_id:string;lease_token:string;enquiry_id:string;full_name:string;email:string;phone:string|null;enquiry_type:string;message:string;created_at:string;attempts:number};
export type NotificationStore={claim:()=>Promise<NotificationJob|null>;finish:(job:NotificationJob,providerId:string|null,errorCode:string|null)=>Promise<boolean>};
const categories = ["Business Partnership", "Course Enquiry", "AI Video Generation Solution", "General Enquiry"];
function headerText(value:string,limit:number){
 return value.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029|]/g," ").replace(/\s+/g," ").trim().slice(0,limit).trim();
}
function validatedReplyTo(value:string){
 const email=value.trim();
 if(email.length>254||/[\u0000-\u0020\u007f-\u009f\u2028\u2029<>(),;:\[\]\\"]/.test(email)||! /^[^@]+@[^@]+\.[^@]+$/.test(email))throw new Error("Invalid notification address");
 return email;
}
export function formatEnquiryNotification(job:NotificationJob){
 const name=headerText(job.full_name,120),category=headerText(job.enquiry_type,80);
 if(!name||!categories.includes(category))throw new Error("Invalid notification details");
 const timestamp=new Date(job.created_at);
 if(!Number.isFinite(timestamp.getTime()))throw new Error("Invalid enquiry timestamp");
 const submittedAt=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).format(timestamp)+" IST (UTC+05:30)";
 const replyTo=validatedReplyTo(job.email);
 return {
 subject:"[Architecting AI] New Enquiry | "+category+" | "+name,
 reply_to:replyTo,
 text:["ARCHITECTING AI - NEW ENQUIRY","","Enquiry ID: "+job.enquiry_id,"Submitted: "+submittedAt,"","Visitor name: "+job.full_name,"Visitor email: "+replyTo,...(job.phone?["Phone: "+job.phone]:[]),"Enquiry category: "+category,"","MESSAGE", "-------",job.message,"","This enquiry has been saved in Architecting AI. Reply to this email to contact the visitor."].join("\n")
 };
}
export async function processOneNotification(store:NotificationStore,config:{enabled:boolean;apiKey:string;from:string;to:string},send:typeof fetch=fetch){
 if(!config.enabled)return "disabled";
 if(!config.apiKey||!config.from||/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/.test(config.from)||config.to!=="surjya.panigrahi@gmail.com")throw new Error("Notification configuration unavailable");
 const job=await store.claim();if(!job)return "empty";
 let providerId:string|null=null,errorCode:string|null=null;
 try{
 const response=await send("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+config.apiKey,"Content-Type":"application/json","Idempotency-Key":"contact-enquiry/"+job.enquiry_id},body:JSON.stringify({from:config.from,to:[config.to],...formatEnquiryNotification(job)}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)errorCode=response.status===429?"provider_rate_limited":response.status>=500||response.status===408||response.status===409?"outcome_unknown":"provider_rejected";
 else {const data=await response.json();if(typeof data.id!=="string"||!data.id)errorCode="outcome_unknown";else providerId=data.id;}
 }catch{errorCode="outcome_unknown";}
 // Never remove the saved enquiry, even if sending or status acknowledgement fails.
 if(!await store.finish(job,providerId,errorCode))throw new Error("Notification acknowledgement unavailable");
 return errorCode==="outcome_unknown"||errorCode==="provider_unavailable"?"manual_review":errorCode==="provider_rate_limited"?"retry_pending":errorCode?"exhausted":"accepted";
}
