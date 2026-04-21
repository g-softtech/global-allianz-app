import { useState, useEffect, useRef } from "react";

export default function useActiveSection(sectionIds, options = {}) {
  const [activeSection, setActiveSection] = useState(sectionIds[0]);
  const observer = useRef(null);

  useEffect(() => {
    const { rootMargin = "-20% 0px -60% 0px", threshold = 0 } = options;

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin, threshold }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.current.observe(el);
    });

    return () => observer.current?.disconnect();
  }, [sectionIds.join(",")]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 120; // account for sticky nav height
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return { activeSection, scrollToSection };
}
