"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type EnquiryDraft = {
  fullName: string;
  email: string;
  phone: string;
  enquiryType: string;
  message: string;
  consent: boolean;
};

const emptyDraft: EnquiryDraft = {
  fullName: "",
  email: "",
  phone: "",
  enquiryType: "Business Partnership",
  message: "",
  consent: false,
};

const EnquiryDraftContext = createContext<{
  draft: EnquiryDraft;
  updateDraft: (changes: Partial<EnquiryDraft>) => void;
  clearDraft: () => void;
} | null>(null);

// The shared marketing layout survives client-side navigation to the policy.
// Drafts stay in this tab's memory only; nothing is written to browser storage.
export function EnquiryDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState(emptyDraft);
  return <EnquiryDraftContext.Provider value={{
    draft,
    updateDraft: changes => setDraft(current => ({ ...current, ...changes })),
    clearDraft: () => setDraft(emptyDraft),
  }}>{children}</EnquiryDraftContext.Provider>;
}

export function useEnquiryDraft() {
  const context = useContext(EnquiryDraftContext);
  if (!context) throw new Error("EnquiryForm requires EnquiryDraftProvider");
  return context;
}
