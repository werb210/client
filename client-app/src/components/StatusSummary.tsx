import { Card } from "./ui/Card";
import { Spinner } from "./ui/Spinner";
import { components, layout, tokens } from "@/styles";
import { useProcessingStatus } from "@/hooks/useProcessingStatus";
import type { ProcessingStatus } from "@/types/processing";

type StatusSummaryProps = {
  applicationId: string | null;
};

function formatTimestamp(value: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

function renderStatusLine(status: ProcessingStatus["ocr"]) {
  if (status.status === "processing") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Spinner />
        Processing
      </span>
    );
  }
  if (status.status === "completed") {
    const timestamp = formatTimestamp(status.completedAt);
    return (
      <span style={{ color: tokens.colors.success }}>
        ✓ Completed{timestamp ? ` ${timestamp}` : ""}
      </span>
    );
  }
  if (status.status === "failed") {
    return (
      <span style={{ color: tokens.colors.warning }}>⚠ Contact support</span>
    );
  }
  return <span>Pending</span>;
}

function renderBankingStatusLine(status: ProcessingStatus["banking"]) {
  return renderStatusLine({
    status: status.status,
    completedAt: status.completedAt,
  });
}

export function StatusSummary({ applicationId }: StatusSummaryProps) {
  const { status, pollState } = useProcessingStatus(applicationId);
  const statementCount =
    status?.banking.statementCount ?? null;
  const requiredStatements =
    status?.banking.requiredStatements ?? 6;

  return (
    <Card>
      <div style={layout.stackTight}>
        <h2 style={components.form.sectionTitle}>Processing status</h2>
        <div style={{ color: tokens.colors.textSecondary, fontSize: "13px" }}>
          Refresh:{" "}
          {pollState === "terminal"
            ? "Locked"
            : pollState === "paused"
              ? "Paused"
              : pollState === "reconnecting"
                ? "Reconnecting"
                : "Polling"}
        </div>
        <div style={layout.stackTight}>
          <div style={components.form.eyebrow}>Documents</div>
          <ul
            style={{
              margin: 0,
              paddingLeft: tokens.spacing.lg,
              color: tokens.colors.textSecondary,
              display: "grid",
              gap: tokens.spacing.xs,
            }}
          >
            <li>Documents received</li>
            <li>{status ? renderStatusLine(status.ocr) : "Pending"}</li>
          </ul>
        </div>
        <div style={layout.stackTight}>
          <div style={components.form.eyebrow}>Banking Analysis</div>
          <ul
            style={{
              margin: 0,
              paddingLeft: tokens.spacing.lg,
              color: tokens.colors.textSecondary,
              display: "grid",
              gap: tokens.spacing.xs,
            }}
          >
            <li>
              {status ? renderBankingStatusLine(status.banking) : "Pending"}
            </li>
            <li>
              Statements received{" "}
              {statementCount !== null ? statementCount : "—"}/{requiredStatements}
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
