export default function RaceDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-5 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      <div className="h-8 w-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
      <div className="card-squircle h-48 animate-pulse bg-gray-100 dark:bg-gray-800" />
      <div className="card-squircle h-32 animate-pulse bg-gray-100 dark:bg-gray-800" />
      <div className="card-squircle h-32 animate-pulse bg-gray-100 dark:bg-gray-800" />
    </div>
  )
}
