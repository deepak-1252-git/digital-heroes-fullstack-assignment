import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  Trophy,
  Target,
  Sparkles,
  Users,
  ShieldCheck,
} from "lucide-react";
import "./Home.css";

const features = [
  {
    icon: Heart,
    title: "Play with purpose",
    description:
      "Every subscription helps support a charity you care about.",
  },
  {
    icon: Trophy,
    title: "Your scores become your entry",
    description:
      "Your latest five Stableford scores create your monthly draw combination.",
  },
  {
    icon: Target,
    title: "A chance to win",
    description:
      "Match 3, 4 or 5 numbers and take a share of the monthly prize pool.",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose your plan",
    description: "Pick a monthly or yearly subscription that works for you.",
  },
  {
    number: "02",
    title: "Track your scores",
    description:
      "Add your latest Stableford scores and keep your five-score entry up to date.",
  },
  {
    number: "03",
    title: "Give & participate",
    description:
      "Choose a charity and decide how much of your contribution goes toward it.",
  },
  {
    number: "04",
    title: "Check the draw",
    description:
      "Each month, numbers are drawn and matching entries share the relevant prize tier.",
  },
];

export default function Home() {
  return (
    <main className="home-page">
      {/* HERO */}
      <section className="home-hero">
        <div className="home-container hero-grid">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <Sparkles size={15} />
              Golf with a greater purpose
            </div>

            <h1>
              Your game can do
              <span> more.</span>
            </h1>

            <p>
              Turn your golf performance into an opportunity to win while
              supporting causes that matter to you.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="home-btn home-btn-primary">
                Get started
                <ArrowRight size={18} />
              </Link>

              <Link to="/how-it-works" className="home-btn home-btn-secondary">
                How it works
              </Link>
            </div>

            <div className="hero-trust">
              <div className="trust-item">
                <ShieldCheck size={17} />
                Secure subscription
              </div>

              <div className="trust-item">
                <Heart size={17} />
                Charity focused
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card hero-card-main">
              <div className="hero-card-top">
                <span>Your monthly entry</span>
                <span className="hero-live">
                  <i />
                  ACTIVE
                </span>
              </div>

              <div className="hero-numbers">
                {[8, 17, 24, 31, 42].map((number) => (
                  <div className="hero-number" key={number}>
                    {number}
                  </div>
                ))}
              </div>

              <div className="hero-card-footer">
                <div>
                  <small>Latest scores</small>
                  <strong>5 entries</strong>
                </div>

                <div>
                  <small>Charity contribution</small>
                  <strong>10%</strong>
                </div>
              </div>
            </div>

            <div className="floating-card floating-card-charity">
              <Heart size={18} />
              <div>
                <small>Your impact</small>
                <strong>Making a difference</strong>
              </div>
            </div>

            <div className="floating-card floating-card-win">
              <Trophy size={18} />
              <div>
                <small>Monthly draw</small>
                <strong>5 numbers</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="home-section">
        <div className="home-container">
          <div className="section-heading">
            <span>WHY IT MATTERS</span>
            <h2>More than just a monthly draw.</h2>
            <p>
              A simple way to combine performance, participation and positive
              impact.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article className="feature-card" key={feature.title}>
                  <div className="feature-icon">
                    <Icon size={21} />
                  </div>

                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="home-section home-section-dark">
        <div className="home-container">
          <div className="section-heading section-heading-row">
            <div>
              <span>HOW IT WORKS</span>
              <h2>Simple to join. Easy to follow.</h2>
            </div>

            <Link to="/how-it-works" className="section-link">
              Explore the process
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="steps-grid">
            {steps.map((step) => (
              <article className="step-card" key={step.number}>
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CHARITY CTA */}
      <section className="home-section">
        <div className="home-container">
          <div className="impact-banner">
            <div className="impact-content">
              <div className="impact-icon">
                <Heart size={25} />
              </div>

              <div>
                <span>YOUR CHOICE, YOUR IMPACT</span>
                <h2>Choose a cause you believe in.</h2>
                <p>
                  Select your charity and set your contribution percentage
                  during your membership.
                </p>
              </div>
            </div>

            <Link to="/charities" className="home-btn home-btn-light">
              Explore charities
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="home-cta">
        <div className="home-container">
          <Users size={28} />

          <h2>Ready to make your game count?</h2>

          <p>
            Join the community and turn your next round into something bigger.
          </p>

          <Link to="/register" className="home-btn home-btn-primary">
            Start your journey
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}