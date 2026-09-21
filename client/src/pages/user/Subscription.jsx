import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  CalendarDays,
  IndianRupee,
  Heart,
  Trophy,
  AlertCircle,
  CreditCard,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import Card from "../../components/Card/Card";
import Badge from "../../components/Badge/Badge";
import Loader from "../../components/Loader/Loader";

import "./Subscription.css";

const API_URL = import.meta.env.VITE_API_URL;

const Subscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(null);
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get("plan");
  const autoCheckoutStarted = useRef(false);

  // --------------------------------
  // Load Razorpay Checkout
  // --------------------------------
  useEffect(() => {
    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // --------------------------------
  // Load current subscription
  // --------------------------------
  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Please login to view your subscription.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/subscriptions/me`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      console.log("SUBSCRIPTION API RESULT:", result);

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load subscription"
        );
      }

      setSubscription(result.subscription || null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);


  useEffect(() => {
    if (
      loading ||
      subscription ||
      !selectedPlan ||
      autoCheckoutStarted.current
    ) {
      return;
    }

    if (
      selectedPlan !== "monthly" &&
      selectedPlan !== "yearly"
    ) {
      return;
    }

    autoCheckoutStarted.current = true;

    handleSubscribe(selectedPlan);
  }, [
    loading,
    subscription,
    selectedPlan,
  ]);

  // --------------------------------
  // Razorpay subscription
  // --------------------------------
  const handleSubscribe = async (plan) => {
    try {
      setPaymentLoading(plan);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Please login first.");
        return;
      }

      // Create Razorpay subscription
      const response = await fetch(
        `${API_URL}/api/subscriptions/create`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            plan,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Subscription creation failed"
        );
      }

      const subscriptionId = data.subscription.id;

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout failed to load. Please try again."
        );
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        subscription_id: subscriptionId,

        name: "Digital Heroes",

        description:
          plan === "monthly"
            ? "Digital Heroes Monthly Subscription"
            : "Digital Heroes Yearly Subscription",

        handler: async (razorpayResponse) => {
          try {
            console.log(
              "Razorpay response:",
              razorpayResponse
            );

            const {
              data: { session: currentSession },
            } = await supabase.auth.getSession();

            if (!currentSession) {
              throw new Error(
                "Session expired. Please login again."
              );
            }

            const verifyResponse = await fetch(
              `${API_URL}/api/subscriptions/verify`,
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${currentSession.access_token}`,
                },

                body: JSON.stringify({
                  razorpay_payment_id:
                    razorpayResponse.razorpay_payment_id,

                  razorpay_subscription_id:
                    razorpayResponse.razorpay_subscription_id,

                  razorpay_signature:
                    razorpayResponse.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.message ||
                "Payment verification failed"
              );
            }

            alert(
              "Subscription activated successfully! 🎉"
            );

            await loadSubscription();
          } catch (verificationError) {
            console.error(
              "Verification error:",
              verificationError
            );

            setError(
              verificationError.message ||
              "Payment was completed but verification failed."
            );
          }
        },

        prefill: {
          email: session.user.email,
        },

        theme: {
          color: "#A3E635",
        },

        modal: {
          ondismiss: () => {
            console.log("Razorpay checkout closed");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        console.error(
          "Payment failed:",
          response.error
        );

        setError(
          response.error?.description ||
          "Payment failed. Please try again."
        );
      });

      razorpay.open();
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setPaymentLoading(null);
    }
  };

  // --------------------------------
  // Loading
  // --------------------------------
  if (loading) {
    return (
      <div className="subscription-page">
        <Loader />
      </div>
    );
  }

  return (
    <div className="subscription-page">

      {/* HEADER */}
      <div className="subscription-header">
        <div>
          <span className="page-eyebrow">
            Membership
          </span>

          <h1>Your Subscription</h1>

          <p>
            Manage your membership, billing period and
            contribution to the prize pool and charity.
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="subscription-message error">
          <AlertCircle size={18} />

          <span>{error}</span>
        </div>
      )}

      {/* -------------------------------- */}
      {/* NO SUBSCRIPTION */}
      {/* -------------------------------- */}

      {!subscription && !error && (
        <Card className="no-subscription">

          <div className="no-subscription-icon">
            <Trophy size={28} />
          </div>

          <h2>No active subscription</h2>

          <p>
            Subscribe to participate in monthly draws
            and support your chosen charity.
          </p>

          <div className="subscription-options">

            {/* MONTHLY */}
            <div className="subscription-option">

              <div>
                <span>Monthly</span>

                <strong>
                  ₹999
                </strong>

                <small>/ month</small>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleSubscribe("monthly")
                }
                disabled={paymentLoading !== null}
              >
                <CreditCard size={17} />

                {paymentLoading === "monthly"
                  ? "Processing..."
                  : "Subscribe Monthly"}
              </button>

            </div>

            {/* YEARLY */}
            <div className="subscription-option featured">

              <div>
                <span>Yearly</span>

                <strong>
                  ₹9,999
                </strong>

                <small>/ year</small>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleSubscribe("yearly")
                }
                disabled={paymentLoading !== null}
              >
                <CreditCard size={17} />

                {paymentLoading === "yearly"
                  ? "Processing..."
                  : "Subscribe Yearly"}
              </button>

            </div>

          </div>

        </Card>
      )}

      {/* -------------------------------- */}
      {/* ACTIVE SUBSCRIPTION */}
      {/* -------------------------------- */}

      {subscription && (
        <>
          <Card className="current-plan-card">

            <div className="plan-top">

              <div>
                <span className="plan-label">
                  Current Plan
                </span>

                <h2>
                  {subscription.subscription_plans
                    ?.billing_interval === "yearly"
                    ? "Yearly"
                    : "Monthly"}{" "}
                  Membership
                </h2>
              </div>

              <Badge>
                {subscription.status?.toUpperCase()}
              </Badge>

            </div>

            {/* PRICE */}

            <div className="plan-price">

              <IndianRupee size={25} />

              <strong>
                {Number(
                  subscription.subscription_plans
                    ?.price || 0
                ).toLocaleString("en-IN")}
              </strong>

              <span>
                /
                {subscription.subscription_plans
                  ?.billing_interval === "yearly"
                  ? "year"
                  : "month"}
              </span>

            </div>

            {/* DETAILS */}

            <div className="plan-details">

              {/* PERIOD */}

              <div className="subscription-detail">

                <CalendarDays size={18} />

                <div>

                  <span>
                    Current Period
                  </span>

                  <strong>
                    {subscription.current_period_start
                      ? new Date(
                        subscription.current_period_start
                      ).toLocaleDateString("en-IN")
                      : "—"}

                    {" – "}

                    {subscription.current_period_end
                      ? new Date(
                        subscription.current_period_end
                      ).toLocaleDateString("en-IN")
                      : "—"}
                  </strong>

                </div>

              </div>

              {/* PRIZE POOL */}

              <div className="subscription-detail">

                <Trophy size={18} />

                <div>

                  <span>
                    Prize Pool
                  </span>

                  <strong>
                    {subscription.subscription_plans
                      ?.prize_pool_percentage || 0}
                    %
                  </strong>

                </div>

              </div>

              {/* CHARITY */}

              <div className="subscription-detail">

                <Heart size={18} />

                <div>

                  <span>
                    Minimum Charity Contribution
                  </span>

                  <strong>
                    {subscription.subscription_plans
                      ?.minimum_charity_percentage ||
                      10}
                    %
                  </strong>

                </div>

              </div>

            </div>

          </Card>

          {/* INFO */}

          <div className="subscription-info-grid">

            <Card>

              <div className="info-icon">
                <CheckCircle2 size={22} />
              </div>

              <h3>
                Draw Participation
              </h3>

              <p>
                Your active subscription makes you
                eligible for the monthly draw using
                your latest five Stableford scores.
              </p>

            </Card>

            <Card>

              <div className="info-icon">
                <Heart size={22} />
              </div>

              <h3>
                Charity Contribution
              </h3>

              <p>
                Your selected charity receives your
                configured contribution percentage
                from the subscription.
              </p>

            </Card>

          </div>

        </>
      )}

    </div>
  );
};

export default Subscription;