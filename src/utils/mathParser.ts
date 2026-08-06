/**
 * Safe, pure mathematical expression evaluator for Edulpha Scientific Calculator.
 * Uses a Recursive Descent Parser / Shunting-Yard engine.
 * Absolutely NO eval() or Function() constructor calls.
 */

export function evaluateMathExpression(expression: string): number {
  if (!expression || !expression.trim()) {
    return 0;
  }

  // Pre-process expression: replace symbols with standardized tokens
  let expr = expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/√/g, 'sqrt')
    .replace(/π/g, 'PI')
    .replace(/\bE\b/g, 'E');

  // Tokenizer
  type TokenType = 'NUMBER' | 'OPERATOR' | 'FUNCTION' | 'LPAREN' | 'RPAREN' | 'COMMA';
  interface Token {
    type: TokenType;
    value: string;
  }

  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const char = expr[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (/\d/.test(char) || (char === '.' && i + 1 < expr.length && /\d/.test(expr[i + 1]))) {
      let numStr = '';
      while (i < expr.length && (/\d/.test(expr[i]) || expr[i] === '.')) {
        numStr += expr[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    if (/[a-zA-Z_]/.test(char)) {
      let nameStr = '';
      while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
        nameStr += expr[i];
        i++;
      }

      if (nameStr === 'PI') {
        tokens.push({ type: 'NUMBER', value: String(Math.PI) });
      } else if (nameStr === 'E') {
        tokens.push({ type: 'NUMBER', value: String(Math.E) });
      } else if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'abs'].includes(nameStr)) {
        tokens.push({ type: 'FUNCTION', value: nameStr });
      } else {
        throw new Error(`Unknown identifier: ${nameStr}`);
      }
      continue;
    }

    if (['+', '-', '*', '/', '%', '^'].includes(char)) {
      // Check for unary minus vs binary minus
      const lastToken = tokens[tokens.length - 1];
      const isUnary = char === '-' && (!lastToken || lastToken.type === 'LPAREN' || lastToken.type === 'OPERATOR');

      if (isUnary) {
        tokens.push({ type: 'NUMBER', value: '0' });
        tokens.push({ type: 'OPERATOR', value: '-' });
      } else {
        tokens.push({ type: 'OPERATOR', value: char });
      }
      i++;
      continue;
    }

    if (char === '(') {
      // Implicit multiplication before parenthesis: e.g. 5(3) or PI(2)
      const lastToken = tokens[tokens.length - 1];
      if (lastToken && (lastToken.type === 'NUMBER' || lastToken.type === 'RPAREN')) {
        tokens.push({ type: 'OPERATOR', value: '*' });
      }
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    if (char === ',') {
      tokens.push({ type: 'COMMA', value: ',' });
      i++;
      continue;
    }

    throw new Error(`Invalid character in expression: ${char}`);
  }

  // Parser & Evaluator (Shunting Yard + RPN Calculator)
  const precedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '%': 2,
    '^': 3,
  };

  const rightAssociative: Record<string, boolean> = {
    '^': true,
  };

  const outputQueue: Token[] = [];
  const operatorStack: Token[] = [];

  for (const token of tokens) {
    if (token.type === 'NUMBER') {
      outputQueue.push(token);
    } else if (token.type === 'FUNCTION') {
      operatorStack.push(token);
    } else if (token.type === 'OPERATOR') {
      const o1 = token.value;
      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (
          top.type === 'OPERATOR' &&
          ((!rightAssociative[o1] && precedence[o1] <= precedence[top.value]) ||
            (rightAssociative[o1] && precedence[o1] < precedence[top.value]))
        ) {
          outputQueue.push(operatorStack.pop()!);
        } else {
          break;
        }
      }
      operatorStack.push(token);
    } else if (token.type === 'LPAREN') {
      operatorStack.push(token);
    } else if (token.type === 'RPAREN') {
      let foundLParen = false;
      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top.type === 'LPAREN') {
          foundLParen = true;
          operatorStack.pop();
          break;
        } else {
          outputQueue.push(operatorStack.pop()!);
        }
      }
      if (!foundLParen) {
        throw new Error('Mismatched parentheses');
      }
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'FUNCTION') {
        outputQueue.push(operatorStack.pop()!);
      }
    }
  }

  while (operatorStack.length > 0) {
    const top = operatorStack.pop()!;
    if (top.type === 'LPAREN' || top.type === 'RPAREN') {
      throw new Error('Mismatched parentheses');
    }
    outputQueue.push(top);
  }

  // RPN Evaluation
  const evalStack: number[] = [];

  for (const token of outputQueue) {
    if (token.type === 'NUMBER') {
      const num = parseFloat(token.value);
      if (isNaN(num)) throw new Error('Invalid number format');
      evalStack.push(num);
    } else if (token.type === 'OPERATOR') {
      if (evalStack.length < 2) throw new Error('Invalid syntax for operator');
      const b = evalStack.pop()!;
      const a = evalStack.pop()!;

      switch (token.value) {
        case '+':
          evalStack.push(a + b);
          break;
        case '-':
          evalStack.push(a - b);
          break;
        case '*':
          evalStack.push(a * b);
          break;
        case '/':
          if (b === 0) throw new Error('Division by zero');
          evalStack.push(a / b);
          break;
        case '%':
          if (b === 0) throw new Error('Division by zero in modulo');
          evalStack.push(a % b);
          break;
        case '^':
          evalStack.push(Math.pow(a, b));
          break;
        default:
          throw new Error(`Unknown operator: ${token.value}`);
      }
    } else if (token.type === 'FUNCTION') {
      if (evalStack.length < 1) throw new Error('Invalid function syntax');
      const arg = evalStack.pop()!;

      switch (token.value) {
        case 'sin':
          // sin in degrees
          evalStack.push(Math.sin((arg * Math.PI) / 180));
          break;
        case 'cos':
          // cos in degrees
          evalStack.push(Math.cos((arg * Math.PI) / 180));
          break;
        case 'tan':
          // tan in degrees
          evalStack.push(Math.tan((arg * Math.PI) / 180));
          break;
        case 'log':
          if (arg <= 0) throw new Error('Logarithm of non-positive number');
          evalStack.push(Math.log10(arg));
          break;
        case 'ln':
          if (arg <= 0) throw new Error('Natural log of non-positive number');
          evalStack.push(Math.log(arg));
          break;
        case 'sqrt':
          if (arg < 0) throw new Error('Square root of negative number');
          evalStack.push(Math.sqrt(arg));
          break;
        case 'abs':
          evalStack.push(Math.abs(arg));
          break;
        default:
          throw new Error(`Unknown function: ${token.value}`);
      }
    }
  }

  if (evalStack.length !== 1) {
    throw new Error('Invalid expression');
  }

  const result = evalStack[0];
  if (!isFinite(result)) {
    throw new Error('Numeric overflow or divide by zero');
  }

  return result;
}
