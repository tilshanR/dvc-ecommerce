export default function AdminCard({ children, className = "" }) {
  return (
    <div className={`admin-card rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}
