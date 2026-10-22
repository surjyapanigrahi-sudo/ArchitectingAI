import {createClient} from '@supabase/supabase-js';
import {processOneNotification} from '../src/modules/contact/notifications.ts';
if(process.env.CONTACT_NOTIFICATION_ENABLED!=='true'){console.log('Notifications disabled; no work performed.');process.exit(0);}
if(!process.argv.includes('--approved-send')){console.error('Explicit --approved-send is required after live-email approval.');process.exit(1);}
try{
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY;
if(!url||!key)throw new Error('Missing configuration');
const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const result=await processOneNotification({claim:async()=>{const {data,error}=await client.rpc('claim_contact_notification');if(error)throw new Error('Storage failed');return data;},finish:async(job,providerId,errorCode)=>{const {data,error}=await client.rpc('finish_contact_notification',{p_job_id:job.job_id,p_lease_token:job.lease_token,p_provider_id:providerId,p_error_code:errorCode});if(error)throw new Error('Storage failed');return data===true;}},{enabled:true,apiKey:process.env.RESEND_API_KEY||'',from:process.env.CONTACT_NOTIFICATION_FROM||'',to:process.env.CONTACT_NOTIFICATION_TO||''});
console.log('Notification worker: '+result);
}catch{console.error('Notification processing failed. Inspect private delivery state through an authorized operator.');process.exitCode=1;}
