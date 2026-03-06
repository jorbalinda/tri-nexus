export default function SocialLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-squircle h-64 animate-pulse bg-gray-100 dark:bg-gray-800" />
        <div className="card-squircle h-64 animate-pulse bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="card-squircle h-16 animate-pulse bg-gray-100 dark:bg-gray-800" />
      <div className="card-squircle h-48 animate-pulse bg-gray-100 dark:bg-gray-800" />
    </div>
  )
}
