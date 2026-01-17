'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FileUploader() {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error' | 'warning', texto: string } | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0])
      setMensaje(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!archivo) {
      setMensaje({ tipo: 'error', texto: 'Por favor selecciona un archivo' })
      return
    }

    setCargando(true)
    setMensaje(null)

    try {
      const formData = new FormData()
      formData.append('archivo', archivo)

      const response = await fetch('/api/licitaciones/archivos', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        const texto = data.warning || 'Archivo subido correctamente'
        setMensaje({ tipo: data.warning ? 'warning' : 'success', texto })
        setArchivo(null)
        const input = document.getElementById('file-input') as HTMLInputElement
        if (input) input.value = ''
        router.refresh()
      } else {
        setMensaje({ tipo: 'error', texto: data.error || 'Error al subir archivo' })
        console.error('Error details:', data.details)
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setMensaje({ tipo: 'error', texto: 'Error de conexión con el servidor' })
    } finally {
      setCargando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label 
          htmlFor="file-input" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Seleccionar archivo de licitación
        </label>
        <input
          id="file-input"
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            cursor-pointer"
          disabled={cargando}
        />
      </div>

      {archivo && (
        <div className="text-sm text-gray-600">
          <p>Archivo seleccionado: <span className="font-medium">{archivo.name}</span></p>
          <p>Tamaño: <span className="font-medium">{(archivo.size / 1024).toFixed(2)} KB</span></p>
        </div>
      )}

      {mensaje && (
        <div className={`p-3 rounded-md ${
          mensaje.tipo === 'success' ? 'bg-green-50 text-green-800' : 
          mensaje.tipo === 'warning' ? 'bg-yellow-50 text-yellow-800' :
          'bg-red-50 text-red-800'
        }`}>
          {mensaje.texto}
        </div>
      )}

      <button
        type="submit"
        disabled={!archivo || cargando}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
          hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
          transition-colors font-medium"
      >
        {cargando ? 'Subiendo...' : 'Subir Archivo'}
      </button>
    </form>
  )
}
