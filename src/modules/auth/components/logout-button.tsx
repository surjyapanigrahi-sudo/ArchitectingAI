"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export function LogoutButton({compact=false}:{compact?:boolean}){const[busy,setBusy]=useState(false);const[failed,setFailed]=useState(false);return <><button className={compact?"profile-menu-signout":"secondary-button"} type="button" disabled={busy} onClick={async()=>{setBusy(true);setFailed(false);try{const{error}=await createClient().auth.signOut();if(error)throw error;window.location.assign("/");}catch{setFailed(true);setBusy(false);}}}>{busy?"Signing out...":"Sign out"}</button>{failed&&<p role="alert">Sign out failed. Please try again.</p>}</>}
