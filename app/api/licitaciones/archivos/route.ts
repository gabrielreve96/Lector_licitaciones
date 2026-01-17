import { NextRequest, NextResponse } from 'next/server'

// Importación condicional de Azure
let ContainerClient: any

try {
  const azureStorage = require('@azure/storage-blob')
  ContainerClient = azureStorage.ContainerClient
} catch (error) {
  console.error('Azure Storage Blob no está instalado')
}

const AZURE_SAS_URL = process.env.AZURE_STORAGE_SAS_URL

let mockStorage: any[] = []

function getContainerClient() {
  if (!ContainerClient || !AZURE_SAS_URL) {
    throw new Error('Azure Blob Storage no configurado')
  }
  // Usar ContainerClient directamente con la URL del SAS que ya incluye el contenedor
  return new ContainerClient(AZURE_SAS_URL)
}

// GET - Listar archivos
export async function GET(request: NextRequest) {
  try {
    if (!ContainerClient || !AZURE_SAS_URL) {
      console.log('Usando modo mock')
      return NextResponse.json({
        success: true,
        data: mockStorage
      })
    }

    console.log('Listando archivos desde Azure Blob Storage...')
    console.log('SAS URL configurada:', AZURE_SAS_URL ? 'Sí' : 'No')
    
    const containerClient = getContainerClient()
    
    const archivos = []
    for await (const blob of containerClient.listBlobsFlat()) {
      const blobClient = containerClient.getBlobClient(blob.name)
      
      archivos.push({
        nombre: blob.name,
        tamaño: blob.properties.contentLength || 0,
        fechaCreacion: blob.properties.createdOn?.toISOString() || new Date().toISOString(),
        tipo: blob.properties.contentType || 'application/octet-stream',
        url: blobClient.url
      })
    }
    
    console.log(`Se encontraron ${archivos.length} archivos`)
    
    return NextResponse.json({
      success: true,
      data: archivos
    })
  } catch (error: any) {
    console.error('Error detallado al listar archivos:', error.message)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error al listar archivos',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// POST - Subir archivo
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const archivo = formData.get('archivo') as File
    
    if (!archivo) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó archivo' },
        { status: 400 }
      )
    }

    const MAX_SIZE = 100 * 1024 * 1024
    if (archivo.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'El archivo es demasiado grande (máximo 100MB)' },
        { status: 400 }
      )
    }

    const timestamp = Date.now()
    const nombreLimpio = archivo.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const nombreArchivo = `${timestamp}-${nombreLimpio}`

    if (!ContainerClient || !AZURE_SAS_URL) {
      const mockFile = {
        nombre: nombreArchivo,
        nombreOriginal: archivo.name,
        tamaño: archivo.size,
        tipo: archivo.type,
        url: '#mock-url',
        fechaCreacion: new Date().toISOString()
      }
      mockStorage.push(mockFile)
      
      return NextResponse.json({
        success: true,
        data: mockFile,
        warning: 'Archivo guardado en memoria (Azure no configurado)'
      }, { status: 201 })
    }
    
    console.log(`Subiendo archivo: ${nombreArchivo}`)
    const containerClient = getContainerClient()
    const blockBlobClient = containerClient.getBlockBlobClient(nombreArchivo)
    
    const arrayBuffer = await archivo.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: archivo.type || 'application/octet-stream'
      },
      metadata: {
        originalName: archivo.name,
        uploadDate: new Date().toISOString()
      }
    })
    
    console.log(`Archivo subido exitosamente: ${nombreArchivo}`)
    
    return NextResponse.json({
      success: true,
      data: {
        nombre: nombreArchivo,
        nombreOriginal: archivo.name,
        tamaño: archivo.size,
        tipo: archivo.type,
        url: blockBlobClient.url,
        fechaCreacion: new Date().toISOString()
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error detallado al subir archivo:', error.message)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error al subir archivo',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar archivo
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const nombreArchivo = searchParams.get('nombre')
    
    if (!nombreArchivo) {
      return NextResponse.json(
        { success: false, error: 'Nombre de archivo requerido' },
        { status: 400 }
      )
    }

    if (!ContainerClient || !AZURE_SAS_URL) {
      const index = mockStorage.findIndex(f => f.nombre === nombreArchivo)
      if (index > -1) {
        mockStorage.splice(index, 1)
      }
      return NextResponse.json({
        success: true,
        message: 'Archivo eliminado (mock)'
      })
    }
    
    const containerClient = getContainerClient()
    const blockBlobClient = containerClient.getBlockBlobClient(nombreArchivo)
    
    const exists = await blockBlobClient.exists()
    if (!exists) {
      return NextResponse.json(
        { success: false, error: 'Archivo no encontrado' },
        { status: 404 }
      )
    }
    
    await blockBlobClient.delete()
    
    return NextResponse.json({
      success: true,
      message: 'Archivo eliminado correctamente'
    })
  } catch (error: any) {
    console.error('Error al eliminar archivo:', error.message)
    return NextResponse.json(
      { success: false, error: error.message || 'Error al eliminar archivo' },
      { status: 500 }
    )
  }
}
