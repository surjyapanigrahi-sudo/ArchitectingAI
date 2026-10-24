"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArchitectingAiLogo } from "@/components/brand/architecting-ai-logo";
import styles from "./marketing-header.module.css";

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const coursesRef = useRef<HTMLDivElement>(null);
  const coursesButtonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  function closeNavigation() {
    setCoursesOpen(false);
    setMobileOpen(false);
  }

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!(event.target instanceof Node)) return;
      if (!coursesRef.current?.contains(event.target)) setCoursesOpen(false);
      if (!headerRef.current?.contains(event.target)) setMobileOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (coursesOpen) {
        setCoursesOpen(false);
        coursesButtonRef.current?.focus();
      } else if (mobileOpen) {
        setMobileOpen(false);
        mobileButtonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [coursesOpen, mobileOpen]);

  return (
    <header ref={headerRef} className={styles.header} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) closeNavigation();
    }}>
      <Link className={styles.brand} href="/" aria-label="Architecting AI home" onClick={closeNavigation}>
        <ArchitectingAiLogo priority />
      </Link>
      <button ref={mobileButtonRef} className={styles.mobileToggle} type="button" aria-expanded={mobileOpen} aria-controls="marketing-navigation" onClick={() => {
        setMobileOpen(!mobileOpen);
        setCoursesOpen(false);
      }}>Menu</button>
      <nav id="marketing-navigation" className={`${styles.navigation} ${mobileOpen ? styles.open : ""}`} aria-label="Primary navigation" onClick={(event) => {
        if (event.target instanceof Element && event.target.closest("a")) closeNavigation();
      }}>
        <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>Home</Link>
        <div ref={coursesRef} className={styles.courses} onMouseLeave={() => setCoursesOpen(false)} onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setCoursesOpen(false);
        }}>
          <button ref={coursesButtonRef} type="button" aria-expanded={coursesOpen} aria-controls="marketing-courses" onClick={() => setCoursesOpen(!coursesOpen)}>Courses</button>
          <div id="marketing-courses" className={styles.dropdown} hidden={!coursesOpen}>
            <Link href="/courses/ai-for-kids"><strong>AI for Students</strong><small>Classes 7-9</small></Link>
            <Link href="/courses/ai-architect"><strong>Architecting AI</strong><small>Professional</small></Link>
            <span aria-disabled="true"><strong>AI Agents &amp; Automation</strong><small>Coming soon</small></span>
            <span aria-disabled="true"><strong>Cybersecurity Essentials</strong><small>Coming soon</small></span>
          </div>
        </div>
        <Link href="/learning-paths" aria-current={pathname === "/learning-paths" ? "page" : undefined}>Learning Paths</Link>
        <Link href="/about" aria-current={pathname === "/about" ? "page" : undefined}>About Us</Link>
        <Link href="/contact" aria-current={pathname === "/contact" ? "page" : undefined}>Contact Us</Link>
      </nav>
      <Link className={styles.signin} href="/login" onClick={closeNavigation}>Sign In</Link>
    </header>
  );
}

export function MarketingFooter(){return <footer className="academy-footer"><div><ArchitectingAiLogo/><p>Practical AI learning for students and professionals.</p></div><nav aria-label="Footer navigation"><Link href="/courses">Courses</Link><Link href="/learning-paths">Learning Paths</Link><Link href="/about">About Us</Link><Link href="/contact">Contact Us</Link><Link href="/login">Sign In</Link><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Use</Link></nav><p>{new Date().getFullYear()} Architecting AI</p></footer>}
