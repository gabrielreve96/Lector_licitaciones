import { Suspense } from 'react'
import FileUploader from '@/components/licitaciones/FileUploader'
import FileList from '@/components/licitaciones/FileList'
import LoadingSkeleton from '@/components/licitaciones/LoadingSkeleton'

// Server Component
export default function LicitacionesPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Gestión de Licitaciones</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Client Component para subir archivos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Subir Archivo</h2>
          <FileUploader />
        </div>
        
        {/* Server Component con Suspense para listar archivos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Archivos Subidos</h2>
          <Suspense fallback={<LoadingSkeleton />}>
            <FileList />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
