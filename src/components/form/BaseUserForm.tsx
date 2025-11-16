export default function BaseUserForm({ children, onSubmit }: { children: React.ReactNode, onSubmit: () => void }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 border p-4 rounded">
      {children}
      <button className="btn-primary">Save</button>
    </form>
  );
}