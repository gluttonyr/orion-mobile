import type { Mission, Vente } from '@/model/model';
import type { MissionApplication } from '@/service/mission.service';

// Mirror of orion_frontend/src/lib/client-dashboard-stats.ts; months with no activity stay at zero.
export function buildClientDashboardStats(orders: Vente[], applications: MissionApplication[], missions: Mission[], now = new Date()) {
  const paid = orders.filter((order) => order.statut === 'payee');
  const monthly = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return { key: `${date.getFullYear()}-${date.getMonth()}`, label: date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''), spent: 0, orders: 0 };
  });
  for (const order of paid) {
    const date = new Date(order.date_achat ?? '');
    const month = monthly.find((item) => item.key === `${date.getFullYear()}-${date.getMonth()}`);
    if (month) { month.spent += Number(order.prix_total ?? 0); month.orders += 1; }
  }
  const countStatus = (status: string) => applications.filter((item) => item.candidature?.statut === status).length;
  const amounts = missions.map((mission) => Number(mission.montant ?? 0)).filter((amount) => amount > 0);
  return {
    totalSpent: paid.reduce((sum, order) => sum + Number(order.prix_total ?? 0), 0),
    paidOrders: paid.length,
    monthly,
    applications: applications.length,
    applicationStatuses: [
      { name: 'En attente', value: countStatus('en_attente'), color: '#D9B66F' },
      { name: 'Acceptées', value: countStatus('accepté'), color: '#84133A' },
      { name: 'Refusées', value: countStatus('refusé'), color: '#C47C52' },
    ],
    openOpportunities: missions.length,
    averagePay: amounts.length ? Math.round(amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length) : 0,
    topOpportunities: missions
      .filter((mission) => Number(mission.montant ?? 0) > 0)
      .sort((a, b) => Number(b.montant) - Number(a.montant))
      .slice(0, 5)
      .map((mission) => ({ id: mission.id, title: mission.titre ?? 'Mission', amount: Number(mission.montant) })),
  };
}
