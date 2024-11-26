/**
 * Compatibility with other libraries.
 *
 * Convert between the formats used by chessops,
 * [chessground](https://github.com/lichess-org/chessground),
 * and [scalachess](https://github.com/lichess-org/scalachess).
 *
 * @packageDocumentation
 */

import { Position } from './chess.js';
import { isDrop, Move, Rules, SquareName } from './types.js';
import { makeSquare, squareFile } from './util.js';

export interface ChessgroundDestsOpts {
  chess960?: boolean;
}

/**
 * Computes the legal move destinations in the format used by chessground.
 *
 * Includes both possible representations of castling moves (unless
 * `chess960` mode is enabled), so that the `rookCastles` option will work
 * correctly.
 * @param {Position} pos
 * @param {ChessgroundDestsOpts} [opts]
 */
export const chessgroundDests = (pos: Position, opts?: ChessgroundDestsOpts): Map<SquareName, SquareName[]> => {
  const result = new Map();
  const ctx = pos.ctx();
  for (const [from, squares] of pos.allDests(ctx)) {
    if (squares.nonEmpty()) {
      const d = Array.from(squares, makeSquare);
      if (!opts?.chess960 && from === ctx.king && squareFile(from) === 4) {
        // Chessground needs both types of castling dests and filters based on
        // a rookCastles setting.
        if (squares.has(0)) d.push('c1');
        else if (squares.has(56)) d.push('c8');
        if (squares.has(7)) d.push('g1');
        else if (squares.has(63)) d.push('g8');
      }
      result.set(makeSquare(from), d);
    }
  }
  return result;
};

/**
 * Converts a move to Chessground format.
 * @param {Move} move
 * @returns {SquareName[]}
 */
export const chessgroundMove = (move: Move): SquareName[] =>
  isDrop(move) ? [makeSquare(move.to)] : [makeSquare(move.from), makeSquare(move.to)];

export const scalachessCharPair = (move: Move): string =>
  isDrop(move)
    ? String.fromCharCode(
      35 + move.to,
      35 + 64 + 8 * 5 + ['queen', 'rook', 'bishop', 'knight', 'pawn'].indexOf(move.role),
    )
    : String.fromCharCode(
      35 + move.from,
      move.promotion
        ? 35 + 64 + 8 * ['queen', 'rook', 'bishop', 'knight', 'king'].indexOf(move.promotion) + squareFile(move.to)
        : 35 + move.to,
    );

/**
 * Converts chessops chess variant names to lichess chess rule names
 * @param variant
 * @returns {Rules}
 */
export const lichessRules = (
  variant:
    | 'standard'
    | 'chess960'
    | 'antichess'
    | 'fromPosition'
    | 'kingOfTheHill'
    | 'threeCheck'
    | 'atomic'
    | 'horde'
    | 'racingKings'
    | 'crazyhouse',
): Rules => {
  switch (variant) {
    case 'standard':
    case 'chess960':
    case 'fromPosition':
      return 'chess';
    case 'threeCheck':
      return '3check';
    case 'kingOfTheHill':
      return 'kingofthehill';
    case 'racingKings':
      return 'racingkings';
    default:
      return variant;
  }
};

/**
 * Conversts chessops rule name to lichess variant name.
 * @param rules
 * @returns
 */
export const lichessVariant = (
  rules: Rules,
): 'standard' | 'antichess' | 'kingOfTheHill' | 'threeCheck' | 'atomic' | 'horde' | 'racingKings' | 'crazyhouse' => {
  switch (rules) {
    case 'chess':
      return 'standard';
    case '3check':
      return 'threeCheck';
    case 'kingofthehill':
      return 'kingOfTheHill';
    case 'racingkings':
      return 'racingKings';
    default:
      return rules;
  }
};
