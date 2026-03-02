import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchApplicationOffers } from "@/api/applications";
import { OffersView } from "@/offers/OffersView";
import { components, layout } from "@/styles";
import type { OfferTermSheet } from "@/offers/OffersView";

export function ApplicationOffersPage(): JSX.Element {
  const { id } = useParams();
  const [offers, setOffers] = useState<OfferTermSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetchApplicationOffers(id);
        if (!active) return;
        setOffers((response as { offers?: OfferTermSheet[] })?.offers ?? []);
      } catch {
        if (!active) return;
        setError("We couldn't load your offers yet. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div style={layout.page}>
        <div style={layout.portalColumn}>
          <div style={components.form.sectionTitle}>Loading offers…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={layout.page}>
        <div style={layout.portalColumn}>
          <div style={components.form.sectionTitle}>Offers unavailable</div>
          <p style={components.form.helperText}>{error}</p>
          <button
            type="button"
            style={{
              marginTop: "12px",
              ...components.buttons.base,
              ...components.buttons.secondary,
              width: "fit-content",
            }}
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchApplicationOffers(id as string)
                .then((response) => setOffers((response as { offers?: OfferTermSheet[] })?.offers ?? []))
                .catch(() => {
                  setError("We couldn't load your offers yet. Please try again.");
                })
                .finally(() => setLoading(false));
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <OffersView offers={offers} />;
}
