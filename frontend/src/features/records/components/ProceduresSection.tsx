import React from 'react';
import type { Procedure } from '../../../types';

interface ProceduresSectionProps {
  procedures: Procedure[];
  onProcedureChange: (index: number, field: keyof Procedure, value: string | number | null) => void;
}

export function ProceduresSection({ procedures, onProcedureChange }: ProceduresSectionProps): JSX.Element {
  const getProcedureSummary = (procedure: Procedure): string => {
    const parts: string[] = [];
    if (procedure.date) parts.push(`Date: ${procedure.date}`);
    if (procedure.cpt_code) parts.push(`CPT: ${procedure.cpt_code}`);
    if (procedure.cost) parts.push(`$${procedure.cost.toFixed(2)}`);
    return parts.join(' • ') || 'No details';
  };

  return (
    <div className="form-section">
      <h3 className="section-title">
        Procedures
        {procedures.length > 0 ? ` (${procedures.length})` : ''}
      </h3>
      {procedures.length === 0 ? (
        <p className="empty-state">No procedures recorded</p>
      ) : (
        <div className="list-items">
          {procedures.map((procedure, index) => (
            <div className="list-item-card" key={index}>
              <div className="form-group">
                <label>Procedure Name</label>
                <input
                  type="text"
                  value={procedure.name}
                  onChange={(e) => onProcedureChange(index, 'name', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Blood Test, X-Ray"
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={procedure.date || ''}
                  onChange={(e) => onProcedureChange(index, 'date', e.target.value || null)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>CPT Code</label>
                <input
                  type="text"
                  value={procedure.cpt_code || ''}
                  onChange={(e) => onProcedureChange(index, 'cpt_code', e.target.value || null)}
                  className="form-input"
                  placeholder="e.g., 80048"
                />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <input
                  type="text"
                  value={procedure.reason || ''}
                  onChange={(e) => onProcedureChange(index, 'reason', e.target.value || null)}
                  className="form-input"
                  placeholder="Reason for procedure"
                />
              </div>
              <div className="form-group">
                <label>Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={procedure.cost || ''}
                  onChange={(e) =>
                    onProcedureChange(
                      index,
                      'cost',
                      e.target.value ? parseFloat(e.target.value) : null,
                    )
                  }
                  className="form-input"
                  placeholder="0.00"
                />
              </div>
              <p className="item-summary">{getProcedureSummary(procedure) || 'No details'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
