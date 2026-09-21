import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  ArrowRight,
  Check,
  Heart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import "./Pricing.css";

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    price: "₹999",
    period: "/ month",
    description: "Flexible membership with monthly billing.",
    popular: false,
    features: [
      "Monthly draw participation",
      "Latest 5 scores",
      "Choose your charity",
      "Minimum 10% charity contribution",
      "Access to member dashboard",
    ],
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "₹9,999",
    period: "/ year",
    description: "A discounted yearly membership for long-term participation.",
    popular: true,
    features: [
      "Everything in Monthly",
      "12-month membership",
      "Discounted annual pricing",
      "Monthly draw participation",
      "Charity contribution controls",
    ],
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handlePlanSelect = (plan) => {
    if (session) {
      navigate(`/dashboard/subscription?plan=${plan.id}`);
      return;
    }

    navigate(`/register?plan=${plan.id}`);
  };

  return (
    <main className="pricing-page">
      {/* HERO */}
      <section className="pricing-hero">
        <div className="public-container">
          <span className="public-eyebrow">
            <Sparkles size={15} />
            MEMBERSHIP
          </span>

          <h1>
            Choose your way
            <span> to play.</span>
          </h1>

          <p>
            One membership connects your golf performance with monthly draw
            participation and the causes you care about.
          </p>
        </div>
      </section>

      {/* PLANS */}
      <section className="pricing-section">
        <div className="public-container">
          <div className="pricing-grid">
            {plans.map((plan) => (
              <article
                className={`pricing-card ${plan.popular ? "pricing-card-popular" : ""
                  }`}
                key={plan.id}
              >
                {plan.popular && (
                  <div className="popular-label">
                    Most popular
                  </div>
                )}

                <div className="pricing-card-header">
                  <span>{plan.name}</span>

                  {plan.popular && <Sparkles size={18} />}
                </div>

                <div className="pricing-price">
                  <strong>{plan.price}</strong>
                  <span>{plan.period}</span>
                </div>

                <p className="pricing-description">
                  {plan.description}
                </p>

                <button
                  type="button"
                  onClick={() => handlePlanSelect(plan)}
                  className="pricing-button"
                >
                  Choose {plan.name}
                  <ArrowRight size={17} />
                </button>

                <div className="pricing-divider" />

                <div className="pricing-features">
                  {plan.features.map((feature) => (
                    <div key={feature}>
                      <Check size={16} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {/* PAYMENT INFO */}
          <div className="pricing-security">
            <ShieldCheck size={20} />

            <div>
              <strong>Secure recurring payments</strong>
              <p>
                Membership payments are processed through the connected payment
                provider. Your payment details are handled securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BREAKDOWN */}
      <section className="pricing-breakdown">
        <div className="public-container">
          <div className="pricing-breakdown-heading">
            <span>WHERE YOUR MEMBERSHIP GOES</span>

            <h2>
              Participation with
              <br />
              <span>purpose.</span>
            </h2>
          </div>

          <div className="pricing-breakdown-grid">
            <article>
              <div className="breakdown-number">20%</div>

              <Heart size={21} />

              <h3>Prize pool</h3>

              <p>
                A fixed portion of subscription revenue contributes to the
                monthly prize pool.
              </p>
            </article>

            <article>
              <div className="breakdown-number">10%+</div>

              <Heart size={21} />

              <h3>Charity</h3>

              <p>
                At least 10% of your subscription contribution goes toward the
                charity you select.
              </p>
            </article>

            <article>
              <div className="breakdown-number">100%</div>

              <ShieldCheck size={21} />

              <h3>Member access</h3>

              <p>
                Your active membership unlocks your dashboard, score tracking
                and draw participation.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* FAQ-LIKE INFO */}
      <section className="pricing-info">
        <div className="public-container pricing-info-grid">
          <div>
            <span>CAN I CHANGE MY CHARITY?</span>
            <h3>Yes.</h3>
            <p>
              Your selected charity can be managed from your member dashboard.
            </p>
          </div>

          <div>
            <span>CAN I CANCEL?</span>
            <h3>Manage your membership.</h3>
            <p>
              Subscription lifecycle and cancellation are handled through your
              membership settings.
            </p>
          </div>

          <div>
            <span>NOT A MEMBER YET?</span>
            <h3>Start in minutes.</h3>
            <Link to="/register" className="pricing-inline-link">
              Create your account
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pricing-cta">
        <div className="public-container">
          <Heart size={28} />

          <h2>Pick a plan. Pick a cause.</h2>

          <p>
            Your next round can be part of something bigger.
          </p>

          <Link to="/register" className="public-btn public-btn-primary">
            Get started
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}