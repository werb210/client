import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getBootRoute } from "../services/boot";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { components, layout, tokens } from "@/styles";

export function EntryPage() {
  const navigate = useNavigate();
  const route = useMemo(() => getBootRoute(), []);

  useEffect(() => {
    navigate(route, { replace: true });
  }, [navigate, route]);

  return (
    <div style={layout.page}>
      <div style={layout.centerColumn}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.sm }}>
            <Spinner />
            <div style={components.form.helperText}>
              Preparing your application…
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
