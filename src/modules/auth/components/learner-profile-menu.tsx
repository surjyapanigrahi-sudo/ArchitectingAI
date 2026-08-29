"use client";

import Link from "next/link";
import { LogoutButton } from "./logout-button";

export function LearnerProfileMenu({ learnerName }: { learnerName: string }) {
  return <details className="learner-profile-menu">
    <summary aria-label={`Open account menu for ${learnerName}`}>{learnerName}</summary>
    <nav aria-label="Learner account">
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/dashboard#my-learning">My Learning</Link>
      <LogoutButton compact />
    </nav>
  </details>;
}
