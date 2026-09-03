import { NextResponse } from 'next/server';
import { ProjectStore } from '@/lib/store';
import { analyzeIntakeWithDeepSeek } from '@/lib/deepseek';

export async function GET() {
  try {
    const requests = ProjectStore.getRequests();
    return NextResponse.json({ success: true, data: requests });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Analizar la solicitud con DeepSeek AI
    let aiAnalysisResult = null;
    try {
      aiAnalysisResult = await analyzeIntakeWithDeepSeek({
        title: body.title,
        description: body.description,
        businessPain: body.businessPain || '',
        estimatedImpact: body.estimatedImpact || '',
        department: body.requesterDepartment || 'General'
      });
    } catch (e) {
      console.warn('No se pudo analizar con DeepSeek:', e);
    }

    const newRequest = ProjectStore.createRequest({
      ...body,
      aiCategory: aiAnalysisResult?.category || 'OTHER',
      aiAnalysis: aiAnalysisResult ? `${aiAnalysisResult.executiveSummary}\n\nArquitectura: ${aiAnalysisResult.recommendedArchitecture}` : undefined,
      aiRecommendedQuestions: aiAnalysisResult?.keyDiscoveryQuestions || []
    });

    return NextResponse.json({
      success: true,
      data: newRequest,
      aiAnalysis: aiAnalysisResult
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
