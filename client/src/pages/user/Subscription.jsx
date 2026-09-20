import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const API_URL = "http://localhost:5000";

const Subscription = () => {
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscribe = async (plan) => {
    try {
      setLoading(plan);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Please login first.");
        return;
      }

      // Create Razorpay subscription from backend
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
        throw new Error(data.message || "Subscription creation failed");
      }

      const subscriptionId = data.subscription.id;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        subscription_id: subscriptionId,

        name: "Digital Heroes",

        description:
          plan === "monthly"
            ? "Digital Heroes Monthly Subscription"
            : "Digital Heroes Yearly Subscription",

        handler: async (response) => {
          try {
            console.log("Razorpay response:", response);

            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
              throw new Error("Session expired. Please login again.");
            }

            const verifyResponse = await fetch(
              `${API_URL}/api/subscriptions/verify`,
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },

                body: JSON.stringify({
                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_subscription_id:
                    response.razorpay_subscription_id,

                  razorpay_signature:
                    response.razorpay_signature,
                }),
              }
            );

            const data = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                data.message || "Payment verification failed"
              );
            }

            alert("Subscription activated successfully! 🎉");

            window.location.href = "/dashboard";
          } catch (error) {
            console.error("Verification error:", error);

            alert(
              error.message ||
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

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout failed to load");
      }

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);

        alert(
          response.error?.description ||
          "Payment failed. Please try again."
        );
      });

      razorpay.open();
    } catch (error) {
      console.error(error);

      alert(error.message || "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-5xl mx-auto">

        <div className="mb-10">
          <p className="text-lime-400 text-sm uppercase tracking-widest">
            Membership
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Choose your subscription
          </h1>

          <p className="text-gray-400 mt-3">
            Support charity, participate in monthly draws,
            and unlock your full Digital Heroes experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Monthly */}
          <div className="border border-white/10 rounded-2xl p-7 bg-white/[0.03]">

            <h2 className="text-2xl font-semibold">
              Monthly
            </h2>

            <div className="mt-5">
              <span className="text-4xl font-bold">
                ₹999
              </span>

              <span className="text-gray-400">
                /month
              </span>
            </div>

            <ul className="mt-6 space-y-3 text-gray-300">
              <li>✓ Monthly subscription</li>
              <li>✓ Golf score tracking</li>
              <li>✓ Monthly draw participation</li>
              <li>✓ Charity contribution</li>
            </ul>

            <button
              onClick={() => handleSubscribe("monthly")}
              disabled={loading !== null}
              className="w-full mt-8 bg-lime-400 text-black font-semibold py-3 rounded-xl hover:bg-lime-300 transition disabled:opacity-50"
            >
              {loading === "monthly"
                ? "Processing..."
                : "Subscribe Monthly"}
            </button>
          </div>

          {/* Yearly */}
          <div className="border border-lime-400/30 rounded-2xl p-7 bg-lime-400/[0.04]">

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">
                Yearly
              </h2>

              <span className="text-xs bg-lime-400 text-black px-3 py-1 rounded-full font-semibold">
                BEST VALUE
              </span>
            </div>

            <div className="mt-5">
              <span className="text-4xl font-bold">
                ₹9,999
              </span>

              <span className="text-gray-400">
                /year
              </span>
            </div>

            <ul className="mt-6 space-y-3 text-gray-300">
              <li>✓ Full year membership</li>
              <li>✓ Golf score tracking</li>
              <li>✓ Monthly draw participation</li>
              <li>✓ Charity contribution</li>
            </ul>

            <button
              onClick={() => handleSubscribe("yearly")}
              disabled={loading !== null}
              className="w-full mt-8 bg-lime-400 text-black font-semibold py-3 rounded-xl hover:bg-lime-300 transition disabled:opacity-50"
            >
              {loading === "yearly"
                ? "Processing..."
                : "Subscribe Yearly"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Subscription;