export function auditDifficultyData(db, { minimumCleanSamples = 30 } = {}) {
  if (!Number.isInteger(minimumCleanSamples) || minimumCleanSamples < 1) throw new RangeError('Minimum sample must be positive');
  const rows = db.prepare(`SELECT o.*, g.language, g.region, e.served_at,
      EXISTS (
        SELECT 1 FROM exposures earlier
        WHERE earlier.account_id=o.account_id AND earlier.fact_id=o.fact_id
          AND (earlier.served_at < e.served_at OR (earlier.served_at=e.served_at AND earlier.id < e.id))
      ) prior_exposure
    FROM outcomes o
    JOIN games g ON g.id=o.game_id
    JOIN exposures e ON e.slot_id=o.slot_id
    ORDER BY o.recorded_at, o.id`).all();
  const exclusionCounts = {};
  const included = [];
  const observations = rows.map((row) => {
    let exclusion = null;
    if (row.outcome === 'voided') exclusion = 'voided';
    else if (row.outcome === 'disputed' || row.dispute_note) exclusion = 'disputed';
    else if (row.technical_failure) exclusion = 'technical_failure';
    else if (row.host_override) exclusion = 'host_override';
    else if (row.prior_exposure) exclusion = 'prior_exposure';
    if (exclusion) exclusionCounts[exclusion] = (exclusionCounts[exclusion] ?? 0) + 1;
    else included.push(row);
    return { outcome_id: row.id, included: !exclusion, exclusion_reason: exclusion, language: row.language, region: row.region, variant_id: row.variant_id, difficulty: row.difficulty };
  });
  const cohorts = new Map();
  for (const row of included) {
    const cohortKey = `${row.variant_id}:${row.language}:${row.region}`;
    const cohort = cohorts.get(cohortKey) ?? { variant_id: row.variant_id, language: row.language, region: row.region, sample_size: 0, correct: 0, incorrect: 0, skipped: 0, response_time_samples: 0, response_time_total_ms: 0 };
    cohort.sample_size += 1;
    if (['correct', 'incorrect', 'skipped'].includes(row.outcome)) cohort[row.outcome] += 1;
    if (row.response_time_ms != null) { cohort.response_time_samples += 1; cohort.response_time_total_ms += row.response_time_ms; }
    cohorts.set(cohortKey, cohort);
  }
  const cleanSampleSize = included.length;
  return {
    gate: cleanSampleSize >= minimumCleanSamples ? 'sufficient_for_review' : 'insufficient_data',
    minimum_clean_samples: minimumCleanSamples,
    total_outcomes: rows.length,
    clean_sample_size: cleanSampleSize,
    exclusion_counts: exclusionCounts,
    observations,
    cohorts: [...cohorts.values()].map((cohort) => ({ ...cohort, correctness_rate: cohort.sample_size ? cohort.correct / cohort.sample_size : null,
      mean_response_time_ms: cohort.response_time_samples ? Math.round(cohort.response_time_total_ms / cohort.response_time_samples) : null })),
    calibration_applied: false,
  };
}
