
import { calculateAccuracy } from '../../lib/utils';

test('calculates MCQ accuracy', () => {
  const game = { gameType: 'mcq', questions: [{ isCorrect: true }, { isCorrect: false }] };
  expect(calculateAccuracy(game)).toBe(50);
});

test('calculates OpenEnded accuracy', () => {
  const game = { gameType: 'open_ended', questions: [{ percentageCorrect: 80 }, { percentageCorrect: 100 }] };
  expect(calculateAccuracy(game)).toBe(90);
});