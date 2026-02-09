import { Card } from "./ui/Card";
import { components, layout, tokens } from "@/styles";

type StatusSummaryProps = {
  status: any;
};

function readNumeric(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getBankStatementCount(status: any): number | null {
  const application = status?.application ?? status;
  const candidates = [
    application?.bank_statement_count,
    application?.bank_statements_count,
    application?.bankStatementsCount,
    application?.bank_statements?.length,
    application?.bankStatements?.length,
    status?.bank_statement_count,
    status?.bank_statements_count,
    status?.bankStatementsCount,
    status?.documents?.bank_statements?.count,
    status?.documents?.bank_statements?.file_count,
    status?.documents?.bank_statements?.files?.length,
    status?.documents?.bank_statements?.documents?.length,
    status?.documents?.bank_statements?.length,
  ];

  for (const candidate of candidates) {
    const numeric = readNumeric(candidate);
    if (numeric !== null) return numeric;
  }
  return null;
}

export function StatusSummary({ status }: StatusSummaryProps) {
  const application = status?.application ?? status;
  const ocrCompletedAt = application?.ocr_completed_at ?? null;
  const bankingCompletedAt = application?.banking_completed_at ?? null;
  const bankStatementCount = getBankStatementCount(status);
  const bankingReady = typeof bankStatementCount === "number" && bankStatementCount >= 6;

  const documentStatus = ocrCompletedAt
    ? "Documents processed"
    : "Documents processing";
  const bankingStatus = bankingCompletedAt
    ? "Banking analysis completed"
    : bankingReady
      ? "Banking analysis in progress"
      : "Waiting for statements";

  return (
    <Card>
      <div style={layout.stackTight}>
        <h2 style={components.form.sectionTitle}>Processing status</h2>
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
            <li>{documentStatus}</li>
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
            <li>{bankingStatus}</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
