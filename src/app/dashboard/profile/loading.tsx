export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="h-8 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card-squircle h-28 animate-pulse bg-gray-100 dark:bg-gray-800" />
      ))}
    </div>
  )
}
