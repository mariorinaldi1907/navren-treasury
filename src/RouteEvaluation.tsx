import { cheapestExplanation, type Quote } from "./model";

export function RouteEvaluation({
  routes,
  best,
  priority,
}: {
  routes: Quote[];
  best?: Quote;
  priority: string;
}) {
  const eligible = routes.filter((r) => r.eligible).length;
  const deadline = routes.filter(
    (r) => r.compliant && r.available && !r.meetsDeadline,
  ).length;
  const other = routes.length - eligible - deadline;
  return (
    <section className="orchestration" aria-label="Orchestration analysis">
      <div className="evaluation-counts">
        <strong>Orchestration analysis</strong>
        <span>{routes.length} routes evaluated</span>
        <span>{eligible} eligible</span>
        {deadline > 0 && <span>{deadline} excluded by deadline</span>}
        {other > 0 && <span>{other} excluded by other controls</span>}
      </div>
      <div className="cheapest-rationale">
        <h3>
          {best &&
          [...routes].sort((a, b) => a.cost - b.cost)[0]?.id === best.id
            ? "The lowest-cost route qualifies"
            : "Why not the cheapest route?"}
        </h3>
        <p>{cheapestExplanation(routes, best)}</p>
      </div>
      <details className="evaluation-details">
        <summary>How Navren evaluated these routes</summary>
        <p className="evaluation-rule">
          Mandatory controls are applied before route ranking.
        </p>
        <div className="evaluation-columns">
          <div>
            <h3>Mandatory constraints</h3>
            <ul>
              <li>Company KYB and beneficiary compliance passed</li>
              <li>Sanctions screening and monitoring requirements passed</li>
              <li>Route available for this corridor and amount</li>
              <li>Expected arrival meets the required supplier deadline</li>
            </ul>
            <p>
              Failed routes remain excluded under every treasury priority.
              Funds, quote validity and approval authority are checked again
              before sending.
            </p>
          </div>
          <div>
            <h3>Optimization factors</h3>
            <ul>
              <li>
                Total economic cost: FX spread, transfer fees and intermediary
                estimates
              </li>
              <li>FX quality and settlement speed</li>
              <li>Recent simulated route reliability</li>
              <li>Reconciliation capability and treasury priority</li>
            </ul>
            <p>
              <strong>{priority}: </strong>
              {priority === "Lowest cost"
                ? "The lowest economic cost among eligible routes; faster arrival breaks a tie."
                : priority === "Fastest arrival"
                  ? "The fastest expected arrival among eligible routes; lower cost breaks a tie."
                  : "Eligible routes are scored on cost 35%, settlement 25%, reliability 15%, FX quality 15% and reconciliation 10%. These weights are prototype assumptions."}
            </p>
          </div>
        </div>
        <p className="evaluation-foot">
          Navren provides decision support. Final payment approval remains with
          the SME.
        </p>
        <small>
          Illustrative quotes and controls. Deterministic prototype evaluation;
          no live AI, FX feed or provider connection.
        </small>
      </details>
    </section>
  );
}
