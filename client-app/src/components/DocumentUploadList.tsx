import { components, tokens } from "@/styles";

type DocumentUploadListProps = {
  title?: string;
  documents: string[];
};

export function DocumentUploadList({ title, documents }: DocumentUploadListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.xs }}>
      {title ? <div style={components.form.sectionTitle}>{title}</div> : null}
      <ul style={{ margin: 0, paddingLeft: "20px", color: tokens.colors.textSecondary }}>
        {documents.map((doc) => (
          <li key={doc}>{doc}</li>
        ))}
      </ul>
    </div>
  );
}
