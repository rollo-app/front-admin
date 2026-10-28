export function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-6 text-sm text-destructive">
      <p className="font-medium">No pudimos cargar los datos</p>
      <p className="mt-1 opacity-80">{message}</p>
    </div>
  );
}
