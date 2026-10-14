type TimelineDayDividerProps = {
  label: string;
};

const TimelineDayDivider = ({ label }: TimelineDayDividerProps) => (
  <div className="flex items-center gap-4 py-1" role="separator" aria-label={label}>
    <span className="h-px flex-1 bg-border" />
    <span className="text-[0.68rem] font-medium text-muted-foreground">{label}</span>
    <span className="h-px flex-1 bg-border" />
  </div>
);

export { TimelineDayDivider };
