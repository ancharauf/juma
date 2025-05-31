import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase'

const SupabaseTest = () => {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL)
        console.log("SUPABASE_KEY:", import.meta.env.VITE_SUPABASE_KEY?.substring(0, 10))

        const { data, error } = await supabase.from('profiles').select('*').limit(1)

        if (error) {
          console.error("❌ Supabase connection failed:", error.message)
          setResult({ success: false, message: error.message })
        } else {
          console.log("✅ Supabase connected. Sample data:", data)
          setResult({ success: true, data })
        }
      } catch (err) {
        console.error("❌ Unexpected error:", err)
        setResult({ success: false, message: err.message })
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold mb-6">🔍 Supabase Connection Test</h1>
      {loading ? (
        <p>⏳ Menguji koneksi ke Supabase...</p>
      ) : result?.success ? (
        <div className="bg-green-800/30 p-4 rounded border border-green-500">
          ✅ <strong>Berhasil terhubung ke Supabase!</strong>
          <pre className="mt-4 text-sm">{JSON.stringify(result.data, null, 2)}</pre>
        </div>
      ) : (
        <div className="bg-red-800/30 p-4 rounded border border-red-500">
          ❌ <strong>Gagal terhubung ke Supabase:</strong>
          <pre className="mt-4 text-sm">{result.message}</pre>
        </div>
      )}
    </div>
  )
}

export default SupabaseTest
