import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase'

const SupabaseTest = () => {
  const [result, setResult] = useState(null)
  const [env, setEnv] = useState({ url: '', key: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const testConnection = async () => {
      const url = import.meta.env.VITE_SUPABASE_URL
      const key = import.meta.env.VITE_SUPABASE_KEY

      setEnv({ url, key: key?.substring(0, 10) + '...' })

      if (!url || !key) {
        setResult({ error: "❌ ENV tidak terbaca. Pastikan sudah disetting dan deploy ulang." })
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase.from('profiles').select('*').limit(1)
        if (error) {
          setResult({ error: error.message })
        } else {
          setResult({ success: true, data })
        }
      } catch (err) {
        setResult({ error: err.message })
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  return (
    <div style={{ padding: 20, fontFamily: 'monospace', background: '#111', color: '#eee', minHeight: '100vh' }}>
      <h2>🧪 Supabase Debug Panel</h2>
      <p><strong>ENV URL:</strong> {env.url || '⛔ Tidak terbaca'}</p>
      <p><strong>ENV KEY:</strong> {env.key || '⛔ Tidak terbaca'}</p>
      <hr style={{ margin: '20px 0' }} />
      {loading ? (
        <p>🔄 Menghubungkan ke Supabase...</p>
      ) : result?.error ? (
        <div style={{ color: 'salmon' }}>
          <p><strong>❌ ERROR:</strong></p>
          <pre>{result.error}</pre>
        </div>
      ) : (
        <div style={{ color: 'lightgreen' }}>
          <p><strong>✅ TERHUBUNG:</strong> Data dari Supabase:</p>
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default SupabaseTest
