export type CbseStatus = "live" | "soon";
export interface CbseSubject { name: string; status: CbseStatus; href?: string }
export interface CbseClass { id: "class-10" | "class-11" | "class-12"; label: string; subjects: CbseSubject[] }
export const cbseClasses: CbseClass[] = [
  { id: "class-12", label: "Class 12", subjects: [{ name: "Physics", status: "live", href: "/courses" }, { name: "Chemistry", status: "soon" }, { name: "Maths", status: "soon" }] },
  { id: "class-11", label: "Class 11", subjects: [{ name: "Physics", status: "soon" }, { name: "Chemistry", status: "soon" }, { name: "Maths", status: "soon" }] },
  { id: "class-10", label: "Class 10", subjects: [{ name: "Science (Physics & Chemistry)", status: "soon" }, { name: "Maths", status: "soon" }] }
];
export const cbseSubjectHref = (cls: CbseClass, subject: CbseSubject) => subject.status === "live" && subject.href ? subject.href : `/courses/cbse#${cls.id}`;
