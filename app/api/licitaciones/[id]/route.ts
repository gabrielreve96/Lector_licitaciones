import { NextRequest, NextResponse } from 'next/server'

const licitaciones = [
  { id: 1, nombre: 'Licitación 1', estado: 'abierto' },
  { id: 2, nombre: 'Licitación 2', estado: 'cerrado' }
]

// GET /api/licitaciones/1
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    // Buscar la licitación por ID
    const licitacion = licitaciones.find(l => l.id === id)
    
    if (!licitacion) {
      return NextResponse.json(
        { success: false, error: 'Licitación no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: licitacion
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al obtener licitación' },
      { status: 500 }
    )
  }
}

// PUT /api/licitaciones/1
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    
    // Buscar y actualizar
    const index = licitaciones.findIndex(l => l.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Licitación no encontrada' },
        { status: 404 }
      )
    }
    
    // Actualizar en base de datos
    return NextResponse.json({
      success: true,
      message: 'Licitación actualizada',
      data: { id, ...body }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al actualizar' },
      { status: 500 }
    )
  }
}

// DELETE /api/licitaciones/1
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    const index = licitaciones.findIndex(l => l.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Licitación no encontrada' },
        { status: 404 }
      )
    }
    
    // Eliminar de base de datos
    return NextResponse.json({
      success: true,
      message: 'Licitación eliminada'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al eliminar' },
      { status: 500 }
    )
  }
}
