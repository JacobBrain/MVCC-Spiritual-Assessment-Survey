import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get assessment
    const { data: assessment, error: assessmentError } = await supabaseAdmin
      .from('assessments')
      .select('*')
      .eq('id', id)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Get responses
    const { data: responses } = await supabaseAdmin
      .from('responses')
      .select('*')
      .eq('assessment_id', id)
      .order('question_id', { ascending: true });

    // Get team interests
    const { data: teamInterests } = await supabaseAdmin
      .from('team_interests')
      .select('team_name')
      .eq('assessment_id', id);

    // Get recommendations
    const { data: recommendations } = await supabaseAdmin
      .from('recommendations')
      .select('*')
      .eq('assessment_id', id)
      .order('priority', { ascending: true });

    return NextResponse.json({
      ...assessment,
      responses: responses || [],
      team_interests: (teamInterests || []).map((t) => t.team_name),
      recommendations: recommendations || [],
    });
  } catch (error) {
    console.error('Admin assessment detail error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
