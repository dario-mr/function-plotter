import { compile } from "mathjs";

export type FunctionEvaluator = (x: number) => number | null;

export function createFunctionEvaluator(expression: string): FunctionEvaluator {
  const compiledExpression = compile(expression);

  return (x: number): number | null => {
    try {
      const result: unknown = compiledExpression.evaluate({ x });
      if (typeof result !== "number" || !Number.isFinite(result)) {
        return null;
      }

      return result;
    } catch {
      return null;
    }
  };
}

export function getFunctionValidationMessage(expression: string): string | null {
  try {
    const evaluator = createFunctionEvaluator(expression);
    const sampleInputs = [-2, -1, -0.5, 0, 0.5, 1, 2];
    const hasValidSample = sampleInputs.some((sampleInput) => evaluator(sampleInput) !== null);
    if (!hasValidSample) {
      return "This expression could not be evaluated to a finite number. Try a different function.";
    }

    return null;
  } catch {
    return "That expression could not be parsed. Try examples like sin(x), x^2, or sqrt(abs(x)).";
  }
}
