import UserForm from "@/components/user-form"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Cognitive Assessment Suite</h1>
          <p className="text-gray-600 text-center mb-8">
            Complete all 6 games to receive a comprehensive cognitive assessment report.
          </p>
          <UserForm />
        </div>
      </div>
    </main>
  )
}

