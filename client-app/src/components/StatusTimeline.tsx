import { components, tokens } from "@/styles";

type StatusTimelineProps = {
  stages: string[];
  activeStage: string;
};

export function StatusTimeline({ stages, activeStage }: StatusTimelineProps) {
  const activeIndex = stages.indexOf(activeStage);

  return (
    <div style={components.timeline.container}>
      {stages.map((stage, index) => {
        const isActive = index <= activeIndex;
        return (
          <div
            key={stage}
            style={{
              ...components.timeline.pill,
              background: isActive
                ? tokens.colors.primary
                : "rgba(35, 63, 92, 0.18)",
              color: isActive ? tokens.colors.surface : tokens.colors.primary,
            }}
          >
            {stage}
          </div>
        );
      })}
    </div>
  );
}
