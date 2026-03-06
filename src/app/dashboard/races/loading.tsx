export default function RacesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-40 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-squircle h-56 animate-pulse bg-gray-100 dark:bg-gray-800" />
        <div className="card-squircle h-56 animate-pulse bg-gray-100 dark:bg-gray-800" />
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="card-squircle h-24 animate-pulse bg-gray-100 dark:bg-gray-800" />
      ))}
    </div>
  )
}
