// Reusable skeleton shimmer placeholders
// Use Skeleton (light) for admin pages, SkeletonDark for student dark-theme pages

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonDark({ className = '' }) {
  return <div className={`skeleton-dark ${className}`} />;
}
