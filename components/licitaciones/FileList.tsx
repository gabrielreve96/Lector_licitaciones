import FileItem from './FileItem'

async function getArchivos() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    console.log('Fetching archivos desde:', `${baseUrl}/api/licitaciones/archivos`)
    
    const response = await fetch(`${baseUrl}/api/licitaciones/archivos`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      console.error('Error response:', response.status, response.statusText)
      const errorData = await response.json().catch(() => ({}))
      console.error('Error data:', errorData)
      return { data: [] }
    }
    
    const result = await response.json()
    console.log('Archivos recibidos:', result.data?.length || 0)
    return result
  } catch (error) {
    console.error('Fetch error:', error)
    return { data: [] }
  }
}

export default async function FileList() {
  const { data: archivos } = await getArchivos()

  if (!archivos || archivos.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="mb-2">No hay archivos subidos</p>
        <p className="text-xs">Los archivos aparecerán aquí después de subirlos</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {archivos.map((archivo: any) => (
        <FileItem key={archivo.nombre} archivo={archivo} />
      ))}
    </div>
  )
}
