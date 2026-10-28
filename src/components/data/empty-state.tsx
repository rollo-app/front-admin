export function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">{text}</div>;
}
