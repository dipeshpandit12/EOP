import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, content } = body;
    if (!session_id || !content) {
      return NextResponse.json({ error: 'Missing session_id or content' }, { status: 400 });
    }

    // Generate PDF using jsPDF
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 10, 20);

    // Output PDF as base64
    const pdfBase64 = doc.output('datauristring');
    // Extract base64 part
    const base64 = pdfBase64.split(',')[1];
    // Create a downloadable URL (data URI)
    const pdfUrl = `data:application/pdf;base64,${base64}`;

    return NextResponse.json({ pdfUrl });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
