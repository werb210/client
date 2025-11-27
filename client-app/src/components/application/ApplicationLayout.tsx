import { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

const ApplicationLayout = ({ title, children }: Props) => {
  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>{title}</h1>
      <div style={{ marginTop: "24px" }}>{children}</div>
    </div>
  );
};

export default ApplicationLayout;
