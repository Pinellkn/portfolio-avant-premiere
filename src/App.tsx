import { useEffect, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { EXPS, FORMS, ME, PROJECTS, SKILLS } from "./data";

/* ---------- utilitaires ---------- */
function useClock() {
  const f = () =>
    new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ME.tz }).format(new Date());
  const [t, setT] = useState(f());
  useEffect(() => {
    const id = setInterval(() => setT(f()), 15000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setV(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, v] as const;
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const [ref, v] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`rv ${v ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Label({ children }: { children: string }) {
  const [ref, v] = useInView<HTMLSpanElement>();
  return (
    <span ref={ref} className={`mono label ${v ? "in" : ""}`}>
      {"( "}
      {[...children].map((c, i) => (
        <span key={i} style={{ transitionDelay: `${i * 30}ms` }}>
          {c}
        </span>
      ))}
      {" )"}
    </span>
  );
}

/* ---------- données de présentation ---------- */
const YEAR: Record<string, string> = {
  acadpay: "2026", fripay: "2026", allopharm: "2026", edugest: "2026", lbc: "2026", klebe: "2026",
  veloce: "2025", ong: "2025", beta2: "2025", "cool-cariba": "2025",
};
const DESC: Record<string, string> = {
  acadpay: "plateforme de gestion académique",
  fripay: "application de mobile money",
  allopharm: "réservation de médicaments en pharmacie",
  edugest: "application de gestion scolaire",
  lbc: "annuaire numérique du Bénin",
  klebe: "assistant WhatsApp de rendez-vous",
  veloce: "marketplace de véhicules",
  ong: "site de dons en ligne",
  beta2: "site institutionnel",
  "cool-cariba": "site de restaurant",
};
const FEATURED = ["acadpay", "fripay", "allopharm", "edugest"];
const STEPS: [string, string, string][] = [
  ["01", "Écouter", "Je comprends le business, ses utilisateurs et ce qui ne fonctionne pas encore."],
  ["02", "Concevoir", "L'architecture, les maquettes et la stack technique sont validées tôt avec tout le monde."],
  ["03", "Développer", "Front-end, back-end, mobile et base de données forment un seul système."],
  ["04", "Tester", "Retours, optimisation des performances, tests sur de vrais appareils."],
  ["05", "Lancer", "Déploiement, documentation et maintenance pour que le produit grandisse sereinement."],
];
const CAST = ["React", "TanStack", "TypeScript", "Node.js", "Flutter", "Laravel", "PHP", "MySQL", "PostgreSQL", "SQLite", "Supabase", "FedaPay", "Git"];
const LINKS: [string, string, string][] = [
  ["01", "Le travail", "#work"],
  ["02", "Le processus", "#process"],
  ["03", "À propos", "#about"],
  ["04", "Contact", "#contact"],
];

/* ---------- barre du haut + menu ---------- */
function Top() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);
  return (
    <>
      <div className="util mono">
        <span>
          <a href={`mailto:${ME.email}`}>{ME.email}</a>
          <a href={ME.waUrl} target="_blank" rel="noreferrer">
            {ME.whatsapp}
          </a>
        </span>
        <span className="ur">Développeur Full-Stack, Abomey-Calavi</span>
      </div>
      <nav className="fmenu">
        <a href={`mailto:${ME.email}`} aria-label="Écrire un email">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
            <rect x="3" y="5" width="18" height="14" />
            <path d="M3 6l9 7 9-7" />
          </svg>
        </a>
        <a href="#top" className="mono-it" aria-label="Haut de page">
          PL
        </a>
        <button onClick={() => setOpen(true)} aria-label="Ouvrir le menu">
          <svg width="22" height="14" viewBox="0 0 22 14" stroke="currentColor" strokeWidth="1.3">
            <path d="M0 2h22M0 12h22" />
          </svg>
        </button>
      </nav>
      <div className={"ovl" + (open ? " open" : "")} aria-hidden={!open}>
        <button className="mono close" onClick={() => setOpen(false)}>
          FERMER ✕
        </button>
        {LINKS.map(([n, t, h]) => (
          <a key={h} href={h} className="ol" onClick={() => setOpen(false)}>
            <span className="mono">{n}</span>
            {t}
          </a>
        ))}
      </div>
    </>
  );
}

/* ---------- hero ---------- */
function Hero() {
  const time = useClock();
  return (
    <section id="top" className="hero wine">
      <div className="hin">
        <Label>NOW SHOWING</Label>
        <h1 className="name">
          <span className="ml">
            <span style={{ animationDelay: "0.1s" }}>Pinel</span>
          </span>
          <span className="ml">
            <span style={{ animationDelay: "0.25s" }}>LOKONON</span>
          </span>
        </h1>
        <p className="tag fin" style={{ animationDelay: "0.7s" }}>
          Un développeur full-stack qui construit des expériences web et mobiles intentionnelles.
        </p>
        <a className="btn mono fin" style={{ animationDelay: "0.82s" }} href={`mailto:${ME.email}`}>
          <span>REACH OUT</span>
          <i>→</i>
        </a>
      </div>
      <div className="acts mono">
        <a href="#work">
          <span className="dim">ACT I</span> LE TRAVAIL
        </a>
        <a href="#process">
          <span className="dim">ACT II</span> LE PROCESSUS
        </a>
        <span>
          <span className="dim">{ME.city}</span> {time}
        </span>
      </div>
      <a href="#prologue" className="badge mono">
        TAKE YOUR SEAT ↓
      </a>
    </section>
  );
}

/* ---------- prologue ---------- */
function Prologue() {
  return (
    <section id="about" className="sec wine">
      <div id="prologue" className="anchor" />
      <Label>PROLOGUE</Label>
      <div className="two">
        <Reveal>
          <p className="big serif">
            Je suis Pinel, développeur full-stack web et mobile basé à Abomey-Calavi. Je conçois des applications solides et
            soignées pour des entreprises qui veulent être prises au sérieux. Chaque projet est une petite production, et
            j'aime régler chaque détail avant que le rideau se lève.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <figure className="ph">
            <img src={ME.portrait} alt={`Portrait de ${ME.name}`} />
            <figcaption className="mono">{ME.name}, Abomey-Calavi</figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- programme ---------- */
function Programme() {
  const [act, setAct] = useState<string | null>(null);
  const fl = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mv = (e: MouseEvent) => {
      if (fl.current) fl.current.style.transform = `translate(${e.clientX + 18}px,${e.clientY + 18}px) rotate(-3deg)`;
    };
    window.addEventListener("mousemove", mv);
    return () => window.removeEventListener("mousemove", mv);
  }, []);
  const cur = PROJECTS.find((p) => p.id === act);
  const coarse = () => window.matchMedia("(pointer: coarse)").matches;
  return (
    <section className="sec wine">
      <Label>THE PROGRAMME</Label>
      <Reveal>
        <p className="big serif">
          Je crée des produits qui donnent aux entreprises une façon claire d'exister en ligne : de l'architecture back-end à
          l'interface mobile, chaque détail est connecté.
        </p>
      </Reveal>
      <p className="mono hint">SURVOLEZ / TOUCHEZ LES MOTS SOULIGNÉS POUR VOIR LE TRAVAIL</p>
      <Reveal>
        <p className="sentence serif">
          {PROJECTS.map((p, i) => (
            <span key={p.id}>
              <button
                className="ul"
                onMouseEnter={() => setAct(p.id)}
                onMouseLeave={() => setAct(null)}
                onClick={() => coarse() && setAct((a) => (a === p.id ? null : p.id))}
              >
                {p.name}
              </button>
              , {DESC[p.id]}
              {p.status === "wip" && <em> — En cours</em>}
              {i < PROJECTS.length - 1 ? " — " : "."}{" "}
            </span>
          ))}
        </p>
      </Reveal>
      {cur && (
        <div className="inl">
          <img src={cur.images[0]} alt={cur.name} />
        </div>
      )}
      <div ref={fl} className={"float" + (cur ? " on" : "")}>
        {cur && <img src={cur.images[0]} alt="" />}
      </div>
    </section>
  );
}

/* ---------- acte I : le travail ---------- */
function Work() {
  const [all, setAll] = useState(false);
  const list = all ? PROJECTS : PROJECTS.filter((p) => FEATURED.includes(p.id));
  return (
    <section id="work" className="sec wine">
      <Label>ACT I — THE WORK</Label>
      <div className="whead">
        <Reveal>
          <h2 className="h2 serif">Des applications et des plateformes, conçues pour des gens pleins d'idées.</h2>
        </Reveal>
        <button className="mono lk" onClick={() => setAll((v) => !v)}>
          {all ? "VOIR MOINS ↑" : "VOIR TOUT LE TRAVAIL →"}
        </button>
      </div>
      <div className="pgrid">
        {list.map((p) => {
          const inner = (
            <>
              <div className="pimg">
                <img src={p.images[0]} alt={p.name} loading="lazy" />
                <i>→</i>
              </div>
              <h3 className="pn serif">{p.name}</h3>
              <p className="mono pm">
                {YEAR[p.id]} — {p.cats.join(" · ").toUpperCase()}
                {p.status === "live" ? " · EN LIGNE" : " · EN COURS"}
              </p>
              <p className="pd">{p.tagline}</p>
              <p className="mono pm dim">{p.stack.join(" · ").toUpperCase()}</p>
            </>
          );
          return (
            <Reveal key={p.id}>
              {p.liveUrl ? (
                <a className="pj" href={p.liveUrl} target="_blank" rel="noreferrer">
                  {inner}
                </a>
              ) : (
                <div className="pj">{inner}</div>
              )}
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- acte II : le processus ---------- */
function Process() {
  return (
    <section id="process" className="sec cream">
      <Label>ACT II — THE PROCESS</Label>
      <Reveal>
        <h2 className="h2 serif">Que ce soit pour un fondateur ou une équipe interne, le processus reste le même.</h2>
      </Reveal>
      <div className="steps">
        {STEPS.map(([n, v, d]) => (
          <Reveal key={n} className="step">
            <span className="mono">{n}</span>
            <span className="verb serif">{v}</span>
            <span className="sd">{d}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- the cast ---------- */
function Cast() {
  const row = [...CAST, ...CAST];
  return (
    <section className="sec wine cast">
      <Label>THE CAST</Label>
      <div className="marq">
        <div className="mtrack serif">
          {[0, 1].map((k) => (
            <div key={k} className="mgrp">
              {row.map((c, i) => (
                <span key={`${k}-${i}`}>
                  {c}
                  <b> · </b>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- backstage (parcours) ---------- */
function Backstage() {
  const Item = ({ e }: { e: { role: string; org: string; period: string; points: string[] } }) => (
    <div className="bi">
      <span className="mono">{e.period}</span>
      <h4 className="serif">{e.role}</h4>
      <p className="bo">{e.org}</p>
      {e.points.map((x) => (
        <p key={x} className="bp">
          — {x}
        </p>
      ))}
    </div>
  );
  return (
    <section className="sec cream">
      <Label>BACKSTAGE</Label>
      <Reveal>
        <h2 className="h2 serif sm">{ME.bio}</h2>
      </Reveal>
      <div className="bgrid">
        <div>
          <p className="mono bh">PARCOURS</p>
          {EXPS.map((e) => (
            <Item key={e.role + e.period} e={e} />
          ))}
        </div>
        <div>
          <p className="mono bh">FORMATIONS</p>
          {FORMS.map((e) => (
            <Item key={e.role} e={e} />
          ))}
          <p className="mono bh">COMPÉTENCES</p>
          {SKILLS.map(([t, it]) => (
            <div key={t} className="bi">
              <span className="mono">{t}</span>
              <p className="bp">{it.join(" · ")}</p>
            </div>
          ))}
          <p className="mono bh">LANGUES</p>
          <p className="bp">{ME.languages}</p>
          <p className="mono bh">CENTRES D'INTÉRÊT</p>
          <p className="bp">{ME.interests}</p>
          <a className="btn mono dark" href={ME.cv} target="_blank" rel="noreferrer">
            <span>VOIR LE CV</span>
            <i>→</i>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- curtain call ---------- */
function Curtain() {
  const time = useClock();
  return (
    <section id="contact" className="sec wine curtain">
      <Label>CURTAIN CALL</Label>
      <Reveal>
        <h2 className="h2 serif center">Votre projet mérite une avant-première.</h2>
      </Reveal>
      <Reveal>
        <a className="mail serif" href={`mailto:${ME.email}`}>
          {ME.email}
        </a>
      </Reveal>
      <div className="cgrid mono">
        <div>
          <p className="dim">CONTACT</p>
          <a className="lk" href={`mailto:${ME.email}`}>
            {ME.email}
          </a>
          <a className="lk" href={ME.waUrl} target="_blank" rel="noreferrer">
            WhatsApp {ME.whatsapp}
          </a>
          <a className="lk" href={ME.telUrl}>
            {ME.tel}
          </a>
        </div>
        <div>
          <p className="dim">RÉSEAUX</p>
          <a className="lk" href={ME.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="lk" href={ME.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
        <div>
          <p className="dim">LOCALISATION</p>
          <span>{ME.place}</span>
          <span>{time}</span>
        </div>
      </div>
      <div className="fin-line mono">
        <span>© 2026 {ME.name} — Tous droits réservés</span>
        <button className="lk" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          FIN ↑
        </button>
      </div>
    </section>
  );
}

export default function App() {
  useEffect(() => {
    const l = new Lenis({ anchors: true });
    let raf = 0;
    const f = (t: number) => {
      l.raf(t);
      raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => {
      cancelAnimationFrame(raf);
      l.destroy();
    };
  }, []);
  return (
    <>
      <Top />
      <main>
        <Hero />
        <Prologue />
        <Programme />
        <Work />
        <Process />
        <Cast />
        <Backstage />
        <Curtain />
      </main>
    </>
  );
}
