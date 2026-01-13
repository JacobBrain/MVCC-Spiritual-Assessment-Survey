import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { GiftScores, GiftCategory, Recommendation } from '@/types';
import { teams, getTeamByName } from '@/lib/teams';

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

    // Get recommendations
    const { data: recommendations } = await supabaseAdmin
      .from('recommendations')
      .select('*')
      .eq('assessment_id', id)
      .order('priority', { ascending: true });

    // Build gift scores object
    const giftScores: GiftScores = {
      administration: assessment.administration_score,
      evangelism: assessment.evangelism_score,
      exhortation: assessment.exhortation_score,
      giving: assessment.giving_score,
      hospitality: assessment.hospitality_score,
      leadership: assessment.leadership_score,
      mercy: assessment.mercy_score,
      pastoring: assessment.pastoring_score,
      serving: assessment.serving_score,
      teaching: assessment.teaching_score,
      wisdom: assessment.wisdom_score,
    };

    // Build top gifts array
    const topGifts = [
      assessment.top_gift_1,
      assessment.top_gift_2,
      assessment.top_gift_3,
    ]
      .filter(Boolean)
      .map((gift) => ({
        gift: gift as GiftCategory,
        score: giftScores[gift as GiftCategory],
      }));

    // Build recommendations array
    const formattedRecommendations: Recommendation[] = (recommendations || []).map((rec) => {
      const team = getTeamByName(rec.team_name) || {
        id: rec.team_name.toLowerCase().replace(/\s+/g, '-'),
        name: rec.team_name,
        description: rec.team_description || '',
        link: rec.team_link,
      };

      return {
        team,
        matchType: rec.is_gift_based
          ? rec.gift_match
            ? 'gift-based'
            : 'perfect'
          : 'user-interest',
        giftMatch: rec.gift_match as GiftCategory | undefined,
        priority: rec.priority,
      };
    });

    return NextResponse.json({
      assessmentId: assessment.id,
      giftScores,
      topGifts,
      recommendations: formattedRecommendations,
    });
  } catch (error) {
    console.error('Get results error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
