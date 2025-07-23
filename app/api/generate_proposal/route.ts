import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import ProposalModel from '@/models/proposal';
import { generateGeminiIntroduction } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    console.log('[generate_proposal] Connecting to DB...');
    await dbConnect();
    const body = await request.json();
    console.log('[generate_proposal] Request body:', body);
    const { session_id, step } = body;

    if (!session_id || !step) {
      console.warn('[generate_proposal] Missing session_id or step');
      return NextResponse.json({ error: 'Missing session_id or step' }, { status: 400 });
    }


    console.log(`[generate_proposal] Looking for proposal with userId: ${session_id}`);
    let proposal = await ProposalModel.findOne({ userId: session_id });
    if (!proposal) {
      // Fallback: find the most recent proposal with non-empty information.responses
      proposal = await ProposalModel.findOne({ 'status.information.responses.2': { $exists: true } }).sort({ lastUpdated: -1 });
      if (!proposal) {
        console.warn('[generate_proposal] No proposal found for session or fallback.');
        return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
      }
      console.log('[generate_proposal] Fallback proposal found:', proposal.userId);
    }

    // Handle all supported steps
    if (step === 'information') {
      console.log('[generate_proposal] Generating introduction for information step...');
      const responses = proposal.status.information.responses || [];
      console.log('[generate_proposal] Responses:', responses);
      if (responses.length < 3) {
        return NextResponse.json({ error: 'Not enough information responses to generate introduction.' }, { status: 400 });
      }
      const prompt = `Generate a professional and concise introduction for an Emergency Operations Plan proposal using the following information:\n\nOrganization Name: ${responses[0]}\nPrimary Contact Email: ${responses[1]}\nFacility Address: ${responses[2]}\n`;
      let intro = '';
      try {
        intro = await generateGeminiIntroduction(prompt);
      } catch (err) {
        console.error('[generate_proposal] Gemini API error:', err);
        intro = `Introduction:\n${responses.map((r: string) => `• ${r}`).join('\n')}`;
      }
      proposal.status.information.generatedText = intro;
      await proposal.save();
      console.log('[generate_proposal] Introduction generated and saved.');
      return NextResponse.json({
        generatedText: intro,
        step: 'information',
        status: 'success',
      });
    } else if (step === 'hazard') {
      console.log('[generate_proposal] Generating hazard assessment...');
      const responses = proposal.status.assessment.responses || [];
      if (responses.length < 3) {
        return NextResponse.json({ error: 'Not enough assessment responses to generate hazard assessment.' }, { status: 400 });
      }
      const prompt = `Generate a detailed hazard assessment section for an Emergency Operations Plan proposal using the following responses:\n\nRisk Assessment: ${responses[0]}\nDocumented Risks: ${responses[1]}\nManagement Review: ${responses[2]}\n`;
      let hazardText = '';
      try {
        hazardText = await generateGeminiIntroduction(prompt);
      } catch (err) {
        console.error('[generate_proposal] Gemini API error:', err);
        hazardText = `Hazard Assessment:\n${responses.map((r: string) => `• ${r}`).join('\n')}`;
      }
      proposal.status.assessment.generatedText = hazardText;
      await proposal.save();
      console.log('[generate_proposal] Hazard assessment generated and saved.');
      return NextResponse.json({
        generatedText: hazardText,
        step: 'hazard',
        status: 'success',
      });
    } else if (step === 'response') {
      console.log('[generate_proposal] Generating emergency response plan...');
      const responses = proposal.status.responsePlan.responses || [];
      if (responses.length < 3) {
        return NextResponse.json({ error: 'Not enough response plan responses to generate emergency response plan.' }, { status: 400 });
      }
      const prompt = `Generate a comprehensive emergency response plan section for an Emergency Operations Plan proposal using the following responses:\n\nWritten Plan: ${responses[0]}\nPlan Updates: ${responses[1]}\nStaff Training: ${responses[2]}\n`;
      let responseText = '';
      try {
        responseText = await generateGeminiIntroduction(prompt);
      } catch (err) {
        console.error('[generate_proposal] Gemini API error:', err);
        responseText = `Emergency Response Plan:\n${responses.map((r: string) => `• ${r}`).join('\n')}`;
      }
      proposal.status.responsePlan.generatedText = responseText;
      await proposal.save();
      console.log('[generate_proposal] Emergency response plan generated and saved.');
      return NextResponse.json({
        generatedText: responseText,
        step: 'response',
        status: 'success',
      });
    }

    console.warn(`[generate_proposal] Step not supported: ${step}`);
    return NextResponse.json({ error: 'Step not supported' }, { status: 400 });
  } catch (error) {
    console.error('Error in /api/generate_proposal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
