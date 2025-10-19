import React, { useState } from 'react';

// Shows savings for the last 3 months (excluding current month if requested)
// Props:
// - savingsGoal: number (target savings per month)
// - actualSavings: number (current month savings — not used directly in history)
// - monthlyBudget: number
// - displayedSpent: number (current month spend — not used directly in history)
// - transactions: array of { date: Date|string, amount: number, category: 'Need'|'Want' }
// - excludeCurrentMonth: boolean
const SavingsHistory = ({
	savingsGoal = 500,
	actualSavings = 0,
	monthlyBudget = 0,
	displayedSpent = 0,
	transactions = [],
	excludeCurrentMonth = true,
}) => {
	const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'quarterly'
	// Normalize transactions: ensure Date instances and numeric amounts
	const tx = Array.isArray(transactions)
		? transactions.map((t) => ({
				...t,
				date: t?.date instanceof Date ? t.date : new Date(t?.date),
				amount: Number(t?.amount) || 0,
			}))
		: [];

	const today = new Date();
	const currentYear = today.getFullYear();
	const currentMonth = today.getMonth(); // 0-11

	// Build list of months to display: last 3 months
	const months = [];
	let count = 0;
	let m = currentMonth;
	let y = currentYear;
	// If excluding current month, start from previous month
	const startOffset = excludeCurrentMonth ? 1 : 0;
	// Move back startOffset months first
	for (let i = 0; i < startOffset; i++) {
		m -= 1;
		if (m < 0) { m = 11; y -= 1; }
	}
	while (count < 3) {
		months.push({ y, m });
		m -= 1;
		if (m < 0) { m = 11; y -= 1; }
		count += 1;
	}

	// Aggregate spending per month
	const monthKey = (year, month) => `${year}-${String(month + 1).padStart(2, '0')}`;
	const spendingByMonth = Object.create(null);
	for (const t of tx) {
		if (!(t.date instanceof Date) || isNaN(t.date)) continue;
		const key = monthKey(t.date.getFullYear(), t.date.getMonth());
		spendingByMonth[key] = (spendingByMonth[key] || 0) + (Number(t.amount) || 0);
	}

		const rowsMonthly = months.map(({ y, m }) => {
		const key = monthKey(y, m);
		const spent = spendingByMonth[key] || 0;
		const goal = Math.max(0, Number(savingsGoal) || 0);
		const budget = Math.max(0, Number(monthlyBudget) || 0);
			// Allow negative savings; progress will clamp to 0 when negative
			const savings = (budget - spent);
			const pctToGoal = goal > 0 ? Math.min(100, Math.max(0, ((savings) / goal) * 100)) : 0;
		const monthLabel = new Date(y, m, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
		return { key, label: monthLabel, spent, savings, pctToGoal };
	});

	// Build quarterly rows: four most recent COMPLETED quarters before the current month
	// Quarters: Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec. Since current is October (Q4), exclude Q4 2025.
	const quarterName = (startMonth) => {
		const map = { 0: 'Jan–Mar', 3: 'Apr–Jun', 6: 'Jul–Sep', 9: 'Oct–Dec' };
		return map[startMonth] || '';
	};
	const getQuarterStart = (year, month) => Math.floor(month / 3) * 3; // 0,3,6,9
	const currentQuarterStart = getQuarterStart(currentYear, currentMonth);
	// We want the last 4 quarters that are fully completed before the current month
	// If currentMonth is in Oct-Dec (>=9), the most recent completed quarter is Jul–Sep (6)
	let qYear = currentYear;
	let qStart = currentQuarterStart - 3; // previous quarter start
	if (qStart < 0) { qStart = 9; qYear -= 1; }
	const quarters = [];
	for (let i = 0; i < 4; i++) {
		quarters.push({ year: qYear, startMonth: qStart });
		qStart -= 3;
		if (qStart < 0) { qStart = 9; qYear -= 1; }
	}

			const rowsQuarterly = quarters.map(({ year, startMonth }) => {
			const monthsInQuarter = [startMonth, startMonth + 1, startMonth + 2];
			const spent = monthsInQuarter.reduce((acc, mm) => acc + (spendingByMonth[monthKey(year, mm)] || 0), 0);
			const periodGoal = Math.max(0, (Number(savingsGoal) || 0) * 3);
			const periodBudget = Math.max(0, (Number(monthlyBudget) || 0) * 3);
					// If there is no spending recorded for the entire quarter, treat savings as 0 (do not assume full budget saved)
					// Otherwise allow negative savings
					const savings = spent > 0 ? (periodBudget - spent) : 0;
			const pctToGoal = periodGoal > 0 ? Math.min(100, Math.max(0, (savings / periodGoal) * 100)) : 0;
			const label = `${quarterName(startMonth)} ${year}`;
			const key = `${year}-Q-${startMonth}`;
			return { key, label, spent, savings, pctToGoal };
		});

	return (
			<div className="card-base" style={{ display: 'flex', flexDirection: 'column' }}>
				<h3 style={{ margin: 0 }}>Savings History</h3>
				<div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
					<button
						className="btn-ghost small"
						onClick={() => setViewMode('monthly')}
						aria-pressed={viewMode === 'monthly'}
						style={{
							padding: '6px 10px',
							borderRadius: 6,
							border: viewMode === 'monthly' ? '1px solid #2563eb' : '1px solid #e5e7eb',
							background: viewMode === 'monthly' ? '#eef2ff' : '#fff',
							color: '#0b1f3a'
						}}
					>
						Last 3 months
					</button>
					<button
						className="btn-ghost small"
						onClick={() => setViewMode('quarterly')}
						aria-pressed={viewMode === 'quarterly'}
						style={{
							padding: '6px 10px',
							borderRadius: 6,
							border: viewMode === 'quarterly' ? '1px solid #2563eb' : '1px solid #e5e7eb',
							background: viewMode === 'quarterly' ? '#eef2ff' : '#fff',
							color: '#0b1f3a'
						}}
					>
						Quarterly (year)
					</button>
				</div>
				<div className="card-scroll" style={{ marginTop: 8 }}>
					{(viewMode === 'monthly' ? rowsMonthly : rowsQuarterly).length === 0 ? (
					<div style={{ color: '#6b7280' }}>No history to display.</div>
				) : (
					<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
						{monthlyBudget <= 0 && (
							<div style={{ color: '#6b7280', background: '#f9fafb', border: '1px solid #e5e7eb', padding: 10, borderRadius: 6 }}>
								Tip: Set a monthly budget during onboarding to track savings vs. spending.
							</div>
						)}
													{(viewMode === 'monthly' ? rowsMonthly : rowsQuarterly).map((r) => (
							<div key={r.key} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#fff' }}>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
									<div style={{ fontWeight: 700, color: '#0b1f3a' }}>{r.label}</div>
									<div style={{ color: '#374151' }}>Spent: ${r.spent.toFixed(2)}</div>
								</div>
												{viewMode === 'quarterly' && r.spent === 0 && (
													<div style={{ marginTop: 4, color: '#6b7280', fontSize: 12, fontStyle: 'italic' }}>No activity</div>
												)}
								<div style={{ marginTop: 8, color: '#0b1f3a' }}>Savings: ${r.savings.toFixed(2)}</div>
															{(() => {
																const monthlyGoal = Math.max(0, Number(savingsGoal) || 0);
																const goalAmt = viewMode === 'monthly' ? monthlyGoal : monthlyGoal * 3;
																const isNegative = r.savings < 0;
																const meetsGoal = !isNegative && goalAmt > 0 && r.savings >= goalAmt;
																const barBg = isNegative ? '#fee2e2' : '#eef2ff';
																const fillColor = isNegative ? '#dc2626' : (meetsGoal ? '#16a34a' : '#2563eb');
																const widthPct = Math.max(0, Math.min(100, r.pctToGoal));
																return (
																	<div className="progress-bar" style={{ height: 8, background: barBg, borderRadius: 999, overflow: 'hidden', marginTop: 6 }}>
																		<div
																			className="progress-fill"
																			style={{ width: `${widthPct}%`, height: '100%', background: fillColor, transition: 'width 200ms ease' }}
																		/>
																	</div>
																);
															})()}
									<div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
										{r.pctToGoal.toFixed(1)}% of $
										{viewMode === 'monthly' ? Math.max(0, Number(savingsGoal) || 0) : Math.max(0, (Number(savingsGoal) || 0) * 3)}
										{' '}goal
									</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default SavingsHistory;

