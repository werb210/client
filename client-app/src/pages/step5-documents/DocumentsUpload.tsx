import { useNavigate } from "react-router-dom";

import { PageContainer } from "../../components/layout/PageContainer";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export default function DocumentsUpload() {
  const navigate = useNavigate();

  return (
    <PageContainer title="Documents Upload">
      <Card className="space-y-4">
        <p>Document upload is coming soon.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate("/step4-applicant")}>
            Back
          </Button>
          <Button variant="primary" disabled>
            Continue
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
}
