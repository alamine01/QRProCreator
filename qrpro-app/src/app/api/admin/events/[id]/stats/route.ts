import { NextRequest, NextResponse } from 'next/server';
import { getEventStats, getEventCheckins } from '@/lib/events';

// GET /api/admin/events/[id]/stats - Récupérer les statistiques d'un événement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'ID d\'événement requis' },
        { status: 400 }
      );
    }

    const [stats, checkins] = await Promise.all([
      getEventStats(eventId),
      getEventCheckins(eventId)
    ]);

    // Calculer des statistiques supplémentaires
    const additionalStats = {
      ...stats,
      recentCheckins: checkins.slice(0, 10), // 10 derniers check-ins
      checkinsByDay: {} as Record<string, number>,
      checkinsByMonth: {} as Record<string, number>,
      averageCheckinsPerHour: 0,
      peakDay: '',
      peakMonth: ''
    };

    // Calculer les statistiques par jour et mois
    checkins.forEach(checkin => {
      const date = checkin.checkedInAt.toDate();
      const dayStr = date.toISOString().split('T')[0];
      const monthStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      additionalStats.checkinsByDay[dayStr] = (additionalStats.checkinsByDay[dayStr] || 0) + 1;
      additionalStats.checkinsByMonth[monthStr] = (additionalStats.checkinsByMonth[monthStr] || 0) + 1;
    });

    // Trouver les jours et mois de pointe
    const peakDayEntry = Object.entries(additionalStats.checkinsByDay)
      .sort(([,a], [,b]) => b - a)[0];
    additionalStats.peakDay = peakDayEntry ? peakDayEntry[0] : '';

    const peakMonthEntry = Object.entries(additionalStats.checkinsByMonth)
      .sort(([,a], [,b]) => b - a)[0];
    additionalStats.peakMonth = peakMonthEntry ? peakMonthEntry[0] : '';

    // Calculer la moyenne de check-ins par heure
    const totalHours = Object.keys(stats.checkinsByHour).length;
    additionalStats.averageCheckinsPerHour = totalHours > 0 ? 
      Object.values(stats.checkinsByHour).reduce((sum, count) => sum + count, 0) / totalHours : 0;

    return NextResponse.json({ 
      success: true, 
      data: additionalStats 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
