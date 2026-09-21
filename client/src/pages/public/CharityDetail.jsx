import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Globe2,
  Heart,
  ShieldCheck,
} from "lucide-react";
import {supabase} from "../../lib/supabase";
import "./CharityDetail.css";

export default function CharityDetail() {
  const { id } = useParams();

  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCharity() {
      setLoading(true);

      const { data, error } = await supabase
        .from("charities")
        .select("*")
        .eq("id", id)
        .eq("active", true)
        .single();

      if (!error) {
        setCharity(data);
      }

      setLoading(false);
    }

    loadCharity();
  }, [id]);

  if (loading) {
    return (
      <main className="charity-detail-page">
        <div className="charity-detail-state">
          Loading charity...
        </div>
      </main>
    );
  }

  if (!charity) {
    return (
      <main className="charity-detail-page">
        <div className="charity-detail-state">
          <Heart size={35} />
          <h2>Charity not found</h2>

          <Link to="/charities" className="public-btn public-btn-primary">
            Back to charities
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="charity-detail-page">
      <section className="charity-detail-hero">
        <div className="public-container">
          <Link to="/charities" className="back-link">
            <ArrowLeft size={16} />
            Back to charities
          </Link>

          <div className="charity-detail-grid">
            <div className="charity-detail-image">
              {charity.image_url ? (
                <img src={charity.image_url} alt={charity.name} />
              ) : (
                <Heart size={70} />
              )}
            </div>

            <div className="charity-detail-content">
              {charity.category && (
                <span className="charity-detail-category">
                  {charity.category}
                </span>
              )}

              <h1>{charity.name}</h1>

              <p>{charity.description}</p>

              <div className="charity-detail-actions">
                <Link
                  to="/register"
                  className="public-btn public-btn-primary"
                >
                  Support this cause
                  <Heart size={17} />
                </Link>

                {charity.website_url && (
                  <a
                    href={charity.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="public-btn public-btn-secondary"
                  >
                    Visit website
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="charity-detail-info">
        <div className="public-container charity-info-grid">
          <article>
            <div className="charity-info-icon">
              <Heart size={20} />
            </div>

            <h3>Your contribution</h3>

            <p>
              Select this charity during membership and choose the percentage
              of your subscription contribution you want to dedicate to it.
            </p>
          </article>

          <article>
            <div className="charity-info-icon">
              <ShieldCheck size={20} />
            </div>

            <h3>Minimum contribution</h3>

            <p>
              Every subscriber contributes at least 10% of their subscription
              toward their selected charity.
            </p>
          </article>

          <article>
            <div className="charity-info-icon">
              <Globe2 size={20} />
            </div>

            <h3>Learn more</h3>

            <p>
              Visit the charity's own website to learn more about its work,
              activities and current initiatives.
            </p>
          </article>
        </div>
      </section>

      <section className="charity-detail-cta">
        <div className="public-container">
          <Heart size={28} />

          <h2>Make your membership mean more.</h2>

          <p>
            Join Digital Heroes and select {charity.name} as your chosen cause.
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