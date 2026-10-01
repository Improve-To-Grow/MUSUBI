/**
 * Skill guardrails: run guardrails around skill execution
 *
 * 'pre' guardrails check the skill input before the skill runs; 'post' guardrails check the
 * skill output after it. Guardrails built on BaseGuardrail run with that content and a
 * context that says what it is (skillId, phase, contentType, filePath, plus the caller's
 * guardrailContext). Other guardrail objects keep the check(data) contract and may report a
 * `reason`.
 */

/**
 * Whether a guardrail runs in a phase ('pre' or 'post'); a guardrail without a phase runs in both
 * @param {Object} guardrail - Guardrail
 * @param {string} phase - Phase
 * @returns {boolean}
 */
function runsInPhase(guardrail, phase) {
  const guardrailPhase = guardrail.phase || 'both';
  return guardrailPhase === phase || guardrailPhase === 'both';
}

/**
 * Context for a guardrail: the caller's guardrailContext plus what the checked content is.
 * After execution the content type comes from the output (contentType), the caller, or the
 * skill metadata, and the file path from the output (filePath) or the caller.
 * @param {string} phase - 'pre' or 'post'
 * @param {Object} data - { skillId, output, context } (context.guardrailContext from the caller)
 * @param {Object} metadata - Skill metadata
 * @returns {Object}
 */
function buildGuardrailContext(phase, data, metadata) {
  const base = data.context?.guardrailContext || {};
  const output =
    phase === 'post' && data.output && typeof data.output === 'object' ? data.output : {};
  return {
    ...base,
    skillId: data.skillId,
    executionId: data.context?.executionId,
    phase,
    contentType:
      phase === 'post'
        ? output.contentType || base.contentType || metadata.contentType || undefined
        : base.contentType,
    filePath: output.filePath || base.filePath,
  };
}

/**
 * Reason of a failed guardrail, with the codes of its errors (or of all violations)
 * @param {Object} outcome - Guardrail result
 * @returns {string}
 */
function describeGuardrailFailure(outcome) {
  const reason = outcome.reason || outcome.message || 'failed';
  const violations = outcome.violations || [];
  const errors = violations.filter(v => v.severity === 'error');
  const codes = (errors.length ? errors : violations).map(v => v.code);
  return codes.length ? `${reason} [${codes.join(', ')}]` : reason;
}

/**
 * Run the guardrails of a phase and record their outcomes; throws on the first failure
 * @param {Array} guardrails - Guardrails
 * @param {string} phase - 'pre' or 'post'
 * @param {Object} data - { skillId, input, output, context }
 * @param {Object} [metadata] - Skill metadata
 * @param {Object} [result] - Execution result; outcomes go to result.guardrails
 * @returns {Promise<void>}
 */
async function runSkillGuardrails(guardrails, phase, data, metadata = {}, result = null) {
  for (const guardrail of guardrails.filter(g => runsInPhase(g, phase))) {
    const outcome =
      typeof guardrail.run === 'function'
        ? await guardrail.run(
            phase === 'pre' ? data.input : data.output,
            buildGuardrailContext(phase, data, metadata)
          )
        : await guardrail.check(data);

    result?.guardrails.push({
      phase,
      guardrail: guardrail.name,
      passed: outcome.passed,
      violations: outcome.violations || [],
    });
    if (!outcome.passed) {
      throw new Error(
        `Guardrail '${guardrail.name}' failed (${phase}): ${describeGuardrailFailure(outcome)}`
      );
    }
  }
}

module.exports = { runSkillGuardrails, buildGuardrailContext, runsInPhase };
