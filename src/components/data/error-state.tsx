export function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-[var(--radius)] border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive-text">
      <p className="font-medium">No pudimos cargar los datos</p>
      <p className="mt-1 opacity-80">{message}</p>
    </div>
  );
}
