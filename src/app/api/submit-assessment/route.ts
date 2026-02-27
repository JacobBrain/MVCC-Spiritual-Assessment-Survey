import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { questions } from '@/lib/questions';
import { calculateGiftScores, getTopGifts, generateRecommendations } from '@/lib/calculations';
import { AssessmentSubmission, QuestionResponse } from '@/types';
import { sendAssessmentNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body: AssessmentSubmission = await request.json();
    const { firstName, lastName, email, responses, teamInterests } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Calculate gift scores
    const giftScores = calculateGiftScores(responses);
    const topGifts = getTopGifts(giftScores, 3);

    // Create assessment record
    const { data: assessment, error: assessmentError } = await supabaseAdmin
      .from('assessments')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email,
        administration_score: giftScores.administration,
        evangelism_score: giftScores.evangelism,
        exhortation_score: giftScores.exhortation,
        giving_score: giftScores.giving,
        hospitality_score: giftScores.hospitality,
        leadership_score: giftScores.leadership,
        mercy_score: giftScores.mercy,
        pastoring_score: giftScores.pastoring,
        serving_score: giftScores.serving,
        teaching_score: giftScores.teaching,
        wisdom_score: giftScores.wisdom,
        top_gift_1: topGifts[0]?.gift || null,
        top_gift_2: topGifts[1]?.gift || null,
        top_gift_3: topGifts[2]?.gift || null,
      })
      .select()
      .single();

    if (assessmentError) {
      console.error('Assessment error:', assessmentError);
      return NextResponse.json(
        { error: 'Failed to save assessment' },
        { status: 500 }
      );
    }

    // Save individual responses
    if (responses.length > 0) {
      const responseRecords = responses.map((r: QuestionResponse) => {
        const question = questions.find(q => q.id === r.questionId);
        return {
          assessment_id: assessment.id,
          question_id: r.questionId,
          question_text: question?.text || '',
          answer_value: r.answerValue,
          gift_category: question?.giftCategory || '',
        };
      });

      const { error: responsesError } = await supabaseAdmin
        .from('responses')
        .insert(responseRecords);

      if (responsesError) {
        console.error('Responses error:', responsesError);
      }
    }

    // Save team interests
    if (teamInterests.length > 0) {
      const interestRecords = teamInterests.map((teamName: string) => ({
        assessment_id: assessment.id,
        team_name: teamName,
      }));

      const { error: interestsError } = await supabaseAdmin
        .from('team_interests')
        .insert(interestRecords);

      if (interestsError) {
        console.error('Interests error:', interestsError);
      }
    }

    // Generate recommendations
    const recommendations = generateRecommendations(giftScores, teamInterests);

    // Save recommendations
    if (recommendations.length > 0) {
      const recRecords = recommendations.map((rec) => ({
        assessment_id: assessment.id,
        team_name: rec.team.name,
        team_description: rec.team.description,
        team_link: rec.team.link || null,
        is_gift_based: rec.matchType !== 'user-interest',
        gift_match: rec.giftMatch || null,
        priority: rec.priority,
      }));

      const { error: recsError } = await supabaseAdmin
        .from('recommendations')
        .insert(recRecords);

      if (recsError) {
        console.error('Recommendations error:', recsError);
      }
    }

    // Send email notification (fire-and-forget — don't block the response)
    sendAssessmentNotification({
      firstName,
      lastName,
      email,
      topGifts,
      teamInterests,
      assessmentId: assessment.id,
    }).catch((err) => console.error('Notification error:', err));

    return NextResponse.json({
      assessmentId: assessment.id,
      giftScores,
      topGifts,
      recommendations,
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
