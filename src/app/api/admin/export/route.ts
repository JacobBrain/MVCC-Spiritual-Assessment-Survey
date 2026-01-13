import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data: assessments, error } = await supabaseAdmin
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch assessments' },
        { status: 500 }
      );
    }

    // Build CSV content
    const headers = [
      'ID',
      'First Name',
      'Last Name',
      'Email',
      'Date',
      'Administration',
      'Evangelism',
      'Exhortation',
      'Giving',
      'Hospitality',
      'Leadership',
      'Mercy',
      'Pastoring',
      'Serving',
      'Teaching',
      'Wisdom',
      'Top Gift 1',
      'Top Gift 2',
      'Top Gift 3',
    ];

    const rows = (assessments || []).map((a) => [
      a.id,
      a.first_name,
      a.last_name,
      a.email,
      new Date(a.created_at).toLocaleDateString(),
      a.administration_score,
      a.evangelism_score,
      a.exhortation_score,
      a.giving_score,
      a.hospitality_score,
      a.leadership_score,
      a.mercy_score,
      a.pastoring_score,
      a.serving_score,
      a.teaching_score,
      a.wisdom_score,
      a.top_gift_1 || '',
      a.top_gift_2 || '',
      a.top_gift_3 || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="spiritual-gifts-assessments-${
          new Date().toISOString().split('T')[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
