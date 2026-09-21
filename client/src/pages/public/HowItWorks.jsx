import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Heart,
  Trophy,
  Target,
  CreditCard,
  BarChart3,
  Gift,
  ShieldCheck,
} from "lucide-react";
import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    icon: CreditCard,
    title: "Choose your membership",
    text: "Choose between a monthly or yearly membership and become part of the Digital Heroes community.",
  },
  {
    number: "02",
    icon: BarChart3,
    title: "Add your golf scores",
    text: "Enter your latest Stableford scores. Your five latest eligible scores form your draw entry.",
  },
  {
    number: "03",
    icon: Heart,
    title: "Choose your charity",
    text: "Select a charity you care about and decide how much of your contribution you want to dedicate to it.",
  },
  {
    number: "04",
    icon: Gift,
    title: "Take part in the draw",
    text: "Each month a five-number draw takes place and eligible entries are checked for matches.",
  },
];

const prizes = [
  {
    match: "5 Match",
    percentage: "40%",
    description: "The jackpot tier. If there is no winner, the jackpot rolls over.",
  },
  {
    match: "4 Match",
    percentage: "35%",
    description: "The second prize tier shared equally between qualifying winners.",
  },
  {
    match: "3 Match",
    percentage: "25%",
    description: "The third prize tier shared equally between qualifying winners.",
  },
];

export default function HowItWorks() {
  return (
    <main className="how-page">
      {/* HERO */}
      <section className="how-hero">
        <div className="public-container how-hero-inner">
          <span className="public-eyebrow">
            <Target size={15} />
            HOW IT WORKS
          </span>

          <h1>
            Your scores.
            <br />
            Your cause.
            <br />
            <span>Your chance.</span>
          </h1>

          <p>
            Digital Heroes brings golf performance, charitable giving and a
            monthly prize draw together in one simple membership.
          </p>
        </div>
      </section>

      {/* STEPS */}
      <section className="how-section">
        <div className="public-container">
          <div className="public-heading">
            <span>THE JOURNEY</span>
            <h2>Four simple steps.</h2>
            <p>
              From joining to participating in the monthly draw, everything is
              designed to stay straightforward.
            </p>
          </div>

          <div className="how-steps">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <article className="how-step" key={step.number}>
                  <div className="how-step-top">
                    <span>{step.number}</span>

                    <div className="how-step-icon">
                      <Icon size={22} />
                    </div>
                  </div>

                  <h3>{step.title}</h3>

                  <p>{step.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SCORES */}
      <section className="how-section how-dark-section">
        <div className="public-container how-two-column">
          <div>
            <span className="public-eyebrow">YOUR SCORES</span>

            <h2>
              Five scores.
              <br />
              One monthly entry.
            </h2>

            <p>
              Keep your latest Stableford scores up to date. The platform
              retains your latest five eligible scores and uses them as your
              monthly draw combination.
            </p>

            <div className="how-check-list">
              <div>
                <Check size={17} />
                Scores range from 1–45
              </div>

              <div>
                <Check size={17} />
                Each score has a played date
              </div>

              <div>
                <Check size={17} />
                Latest five scores are retained
              </div>

              <div>
                <Check size={17} />
                One score per date
              </div>
            </div>
          </div>

          <div className="score-demo">
            <div className="score-demo-header">
              <span>Latest scores</span>
              <span>5 / 5</span>
            </div>

            {[42, 31, 24, 17, 8].map((score, index) => (
              <div className="score-row" key={score}>
                <div className="score-circle">{score}</div>

                <div>
                  <strong>Stableford score</strong>
                  <small>
                    {index === 0
                      ? "Most recent"
                      : `${index} month${index > 1 ? "s" : ""} ago`}
                  </small>
                </div>

                <Check size={17} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DRAW */}
      <section className="how-section">
        <div className="public-container">
          <div className="public-heading">
            <span>THE MONTHLY DRAW</span>
            <h2>Match more. Win more.</h2>
            <p>
              Five numbers are drawn each month. Your entry is compared against
              the draw and qualifying matches determine your prize tier.
            </p>
          </div>

          <div className="draw-demo">
            <div className="draw-side">
              <small>YOUR ENTRY</small>

              <div className="draw-numbers">
                {[8, 17, 24, 31, 42].map((number) => (
                  <span key={number}>{number}</span>
                ))}
              </div>
            </div>

            <div className="draw-vs">VS</div>

            <div className="draw-side">
              <small>MONTHLY DRAW</small>

              <div className="draw-numbers">
                {[8, 17, 24, 31, 45].map((number) => (
                  <span
                    key={number}
                    className={number !== 45 ? "matched" : ""}
                  >
                    {number}
                  </span>
                ))}
              </div>
            </div>

            <div className="draw-result">
              <Trophy size={20} />
              <strong>4 MATCH</strong>
              <span>Qualifying prize tier</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRIZES */}
      <section className="how-section how-dark-section">
        <div className="public-container">
          <div className="public-heading">
            <span>PRIZE STRUCTURE</span>
            <h2>Three ways to match.</h2>
          </div>

          <div className="prize-grid">
            {prizes.map((prize) => (
              <article className="prize-card" key={prize.match}>
                <div className="prize-card-top">
                  <Trophy size={19} />
                  <span>{prize.match}</span>
                </div>

                <strong>{prize.percentage}</strong>

                <p>{prize.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="how-section">
        <div className="public-container trust-banner">
          <ShieldCheck size={28} />

          <div>
            <h3>Built around transparency.</h3>
            <p>
              Draws, entries, winners and payouts are managed through the
              platform with verification handled by administrators.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="how-final-cta">
        <div className="public-container">
          <Heart size={28} />

          <h2>Ready to make your game count?</h2>

          <p>
            Choose your membership, select a cause and start participating.
          </p>

          <Link to="/register" className="public-btn public-btn-primary">
            Get started
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}