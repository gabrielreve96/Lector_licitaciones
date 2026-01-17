'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FileItemProps {
  archivo: {
    nombre: string
    tamaño: number
    fechaCreacion: string
    url: string
    tipo?: string
  }
}

export default function FileItem({ archivo }: FileItemProps) {
  const [eliminando, setEliminando] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este archivo?')) return

    setEliminando(true)
    try {
      const response = await fetch(`/api/licitaciones/archivos?nombre=${encodeURIComponent(archivo.nombre)}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        router.refresh()
      } else {
        alert(data.error || 'Error al eliminar archivo')
      }
    } catch (error) {
      alert('Error de conexión')
    } finally {
      setEliminando(false)
    }
  }

  const handleDownload = () => {
    // Abrir en nueva pestaña o descargar
    const link = document.createElement('a')
    link.href = archivo.url
    link.target = '_blank'
    link.download = archivo.nombre
    link.click()
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate" title={archivo.nombre}>
          {archivo.nombre}
        </p>
        <p className="text-xs text-gray-500">
          {formatBytes(archivo.tamaño)} • {new Date(archivo.fechaCreacion).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
      
      <div className="flex gap-2 ml-4">
        <button
          onClick={handleDownload}
          className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
        >
          Descargar
        </button>
        <button
          onClick={handleDelete}
          disabled={eliminando}
          className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {eliminando ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </div>
  )
}
