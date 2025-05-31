import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)

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
        setResult({ error: "ENV tidak terbaca." })
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase.from('profiles').select('*').limit(1)
        if (error) setResult({ error: error.message })
        else setResult({ success: true, data })
      } catch (err) {
        setResult({ error: err.message })
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h2>Supabase Debug</h2>
      <p><strong>ENV URL:</strong> {env.url || '❌ Tidak terbaca'}</p>
      <p><strong>ENV KEY:</strong> {env.key || '❌ Tidak terbaca'}</p>
      <hr />
      {loading ? <p>⏳ Menghubungkan...</p> :
        result?.error ? <pre style={{ color: 'red' }}>{result.error}</pre> :
        <pre style={{ color: 'green' }}>{JSON.stringify(result.data, null, 2)}</pre>
      }
    </div>
  )
}
export default SupabaseTest
