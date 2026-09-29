type TimelineDayDividerProps = {
  label: string;
};

const TimelineDayDivider = ({ label }: TimelineDayDividerProps) => (
  <div className="flex items-center gap-4 py-2" role="separator" aria-label={label}>
    <span className="h-px flex-1 bg-border" />
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <span className="h-px flex-1 bg-border" />
  </div>
);

export { TimelineDayDivider };
