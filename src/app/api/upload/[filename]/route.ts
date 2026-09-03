import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filePath = path.join(process.cwd(), '.data', 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Type': 'application/octet-stream'
      }
    });
  } catch (e) {
    console.error('Error al servir archivo:', e);
    return NextResponse.json({ error: 'Error al obtener el archivo' }, { status: 500 });
  }
}
