import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/sections/Hero";
import CaseStudies from "./components/sections/CaseStudies";
import Timeline from "./components/sections/Timeline";
import Projects from "./components/sections/Projects";
import Skills from "./components/sections/Skills";
import Contact from "./components/sections/Contact";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";

const json = (r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)));

export default function App() {
  const [data, setData] = useState({
    profile: null,
    timeline: [],
    projects: [],
    skills: [],
    social: [],
    caseStudies: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const val = (r, d) => (r.status === "fulfilled" ? r.value : d);
    Promise.allSettled([
      fetch("/api/profile").then(json),
      fetch("/api/timeline").then(json),
      fetch("/api/portfolio").then(json), // vrais repos GitHub synchronisés
      fetch("/api/skills").then(json),
      fetch("/api/social-links").then(json),
      fetch("/api/case-studies").then(json),
    ]).then(([profile, timeline, projects, skills, social, caseStudies]) => {
      setData({
        profile: val(profile, null),
        timeline: val(timeline, []),
        projects: val(projects, []),
        skills: val(skills, []),
        social: val(social, []),
        caseStudies: val(caseStudies, []),
      });
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar name={data.profile?.full_name} social={data.social} />
      <main>
        <Hero profile={data.profile} social={data.social} loading={loading} />
        <CaseStudies studies={data.caseStudies} />
        <Projects projects={data.projects} />
        <Timeline events={data.timeline} />
        <Skills skills={data.skills} />
        <Contact profile={data.profile} social={data.social} />
      </main>
      <Footer profile={data.profile} social={data.social} />
      <ChatWidget />
    </div>
  );
}
