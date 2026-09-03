import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), '.data', 'uploads');

export async function POST(req: NextRequest) {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se encontró ningún archivo para subir' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(UPLOAD_DIR, safeName);

    fs.writeFileSync(filePath, buffer);

    const fileRecord = {
      id: `file-${Date.now()}`,
      name: file.name,
      sizeBytes: file.size,
      type: file.type || 'application/octet-stream',
      url: `/api/upload/${safeName}`,
      uploadedAt: new Date().toISOString()
    };

    return NextResponse.json({ success: true, file: fileRecord });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json({ error: 'Error interno al procesar la carga del archivo' }, { status: 500 });
  }
}
