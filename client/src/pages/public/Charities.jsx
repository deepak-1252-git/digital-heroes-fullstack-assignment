import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  Search, 
  Sparkles,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import "./Charities.css";

export default function Charities() {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCharities() {
      setLoading(true);

      const { data, error } = await supabase
        .from("charities")
        .select("*")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("name", { ascending: true });

      if (!error) {
        setCharities(data || []);
      }

      setLoading(false);
    }

    loadCharities();
  }, []);

  const categories = useMemo(() => {
    const values = charities
      .map((charity) => charity.category)
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [charities]);

  const filteredCharities = useMemo(() => {
    return charities.filter((charity) => {
      const matchesSearch =
        charity.name?.toLowerCase().includes(search.toLowerCase()) ||
        charity.description?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || charity.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [charities, search, category]);

  const featured = charities.find((charity) => charity.featured);

  return (
    <main className="charities-page">
      <section className="charities-hero">
        <div className="public-container">
          <span className="public-eyebrow">
            <Heart size={15} />
            OUR CHARITIES
          </span>

          <h1>
            Give to something
            <span> meaningful.</span>
          </h1>

          <p>
            Choose a cause that matters to you. Your selected charity can
            receive a portion of your membership contribution.
          </p>
        </div>
      </section>

      {featured && (
        <section className="featured-charity-section">
          <div className="public-container">
            <div className="featured-charity">
              <div className="featured-image">
                {featured.image_url ? (
                  <img src={featured.image_url} alt={featured.name} />
                ) : (
                  <Heart size={60} />
                )}
              </div>

              <div className="featured-content">
                <span>
                  <Sparkles size={14} />
                  FEATURED CHARITY
                </span>

                <h2>{featured.name}</h2>

                <p>{featured.description}</p>

                <Link
                  to={`/charities/${featured.id}`}
                  className="public-btn public-btn-primary"
                >
                  View charity
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="charity-list-section">
        <div className="public-container">
          <div className="charity-toolbar">
            <div className="charity-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search charities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="charity-filters">
              {categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={category === item ? "active" : ""}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="charity-state">
              Loading charities...
            </div>
          ) : filteredCharities.length === 0 ? (
            <div className="charity-state">
              No charities found.
            </div>
          ) : (
            <div className="charity-grid">
              {filteredCharities.map((charity) => (
                <article className="charity-card" key={charity.id}>
                  <div className="charity-card-image">
                    {charity.image_url ? (
                      <img src={charity.image_url} alt={charity.name} />
                    ) : (
                      <Heart size={40} />
                    )}

                    {charity.featured && (
                      <span className="featured-badge">Featured</span>
                    )}
                  </div>

                  <div className="charity-card-content">
                    {charity.category && (
                      <span className="charity-category">
                        {charity.category}
                      </span>
                    )}

                    <h3>{charity.name}</h3>

                    <p>{charity.description}</p>

                    <Link
                      to={`/charities/${charity.id}`}
                      className="charity-card-link"
                    >
                      Learn more
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="charity-bottom-cta">
        <div className="public-container">
          <Heart size={27} />

          <h2>Your membership can create an impact.</h2>

          <p>
            Join Digital Heroes and choose a cause that means something to
            you.
          </p>

          <Link to="/register" className="public-btn public-btn-primary">
            Join Digital Heroes
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}