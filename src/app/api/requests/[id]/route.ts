import { NextResponse } from 'next/server';
import { ProjectStore } from '@/lib/store';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requests = ProjectStore.getRequests();
    const found = requests.find(r => r.id === id || r.code.toLowerCase() === id.toLowerCase());
    if (!found) {
      return NextResponse.json({ success: false, error: 'Solicitud no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: found });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const requests = ProjectStore.getRequests();
    const index = requests.findIndex(r => r.id === id || r.code.toLowerCase() === id.toLowerCase());
    
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Solicitud no encontrada' }, { status: 404 });
    }

    const current = requests[index];
    requests[index] = {
      ...current,
      ...body,
      updatedAt: new Date().toISOString()
    };

    ProjectStore.saveRequests(requests);

    // Sincronizar en segundo plano a SQL Server
    ProjectStore.syncRequestToSqlServer(requests[index]).catch(e => console.warn('SQL request sync:', e.message));

    return NextResponse.json({ success: true, data: requests[index] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
