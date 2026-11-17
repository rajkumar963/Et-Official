import type { AnalyticsSummary } from '@et-trader/shared';
import { api } from '@/lib/api-client';
export const getAnalytics = () => api<AnalyticsSummary>('/analytics/summary');
