import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/sections/Hero";
import CaseStudies from "./components/sections/CaseStudies";
import Timeline from "./components/sections/Timeline";
import Projects from "./components/sections/Projects";
import Skills from "./components/sections/Skills";
import Testimonials from "./components/sections/Testimonials";
import Contact from "./components/sections/Contact";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import { useLang } from "./i18n.jsx";

const json = (r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)));

export default function App() {
  const { lang } = useLang();
  const [data, setData] = useState({
    profile: null,
    timeline: [],
    projects: [],
    skills: [],
    social: [],
    caseStudies: [],
    testimonials: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = `?lang=${lang}`;
    const val = (r, d) => (r.status === "fulfilled" ? r.value : d);
    Promise.allSettled([
      fetch(`/api/profile${q}`).then(json),
      fetch(`/api/timeline${q}`).then(json),
      fetch(`/api/portfolio${q}`).then(json), // vrais repos GitHub synchronisés
      fetch(`/api/skills${q}`).then(json),
      fetch("/api/social-links").then(json),
      fetch(`/api/case-studies${q}`).then(json),
      fetch("/api/testimonials").then(json),
    ]).then(([profile, timeline, projects, skills, social, caseStudies, testimonials]) => {
      setData({
        profile: val(profile, null),
        timeline: val(timeline, []),
        projects: val(projects, []),
        skills: val(skills, []),
        social: val(social, []),
        caseStudies: val(caseStudies, []),
        testimonials: val(testimonials, []),
      });
      setLoading(false);
    });
  }, [lang]);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar name={data.profile?.full_name} social={data.social} />
      <main>
        <Hero profile={data.profile} social={data.social} loading={loading} />
        <CaseStudies studies={data.caseStudies} />
        <Projects projects={data.projects} />
        <Timeline events={data.timeline} />
        <Skills skills={data.skills} />
        <Testimonials testimonials={data.testimonials} />
        <Contact profile={data.profile} social={data.social} />
      </main>
      <Footer profile={data.profile} social={data.social} />
      <ChatWidget />
    </div>
  );
}
