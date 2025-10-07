export default function MMSEProgress({
  currentStep,
  totalSteps,
  score,
  totalMax,
}: {
  currentStep: number
  totalSteps: number
  score: number
  totalMax: number
}) {
  const pct = Math.round(((currentStep + 1) / Math.max(1, totalSteps)) * 100)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-gray-700">
        <span>Paso {currentStep + 1} de {totalSteps}</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded">
        <div className="h-2 bg-blue-600 rounded" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

