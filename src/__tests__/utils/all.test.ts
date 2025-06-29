import { cn, formatTimeDelta, normalize, similarity, calculateAccuracy } from '../../lib/utils';

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
    expect(cn('a', false && 'b', 'c')).toBe('a c');
    expect(cn('a', undefined, 'b')).toBe('a b');
  });
});

describe('formatTimeDelta', () => {
  it('formats seconds to h m s', () => {
    expect(formatTimeDelta(3661)).toBe('1h 1m 1s');
    expect(formatTimeDelta(61)).toBe('1m 1s');
    expect(formatTimeDelta(59)).toBe('59s');
    expect(formatTimeDelta(3600)).toBe('1h');
    expect(formatTimeDelta(0)).toBe('');
  });
});

describe('normalize', () => {
  it('normalizes strings by removing punctuation, lowercasing, and trimming', () => {
    expect(normalize('Hello, World!')).toBe('hello world');
    expect(normalize('  Multiple   spaces  ')).toBe('multiple spaces');
    expect(normalize('Test-String_123')).toBe('teststring123');
    expect(normalize('   ')).toBe('');
  });
});

describe('similarity', () => {
  it('returns 1 for identical strings', () => {
    expect(similarity('hello', 'hello')).toBe(1);
  });
  it('returns 0 for completely different strings', () => {
    expect(similarity('abc', 'xyz')).toBe(0);
  });
  it('returns 1 for two empty strings', () => {
    expect(similarity('', '')).toBe(1);
  });
  it('returns 0 if one string is empty', () => {
    expect(similarity('abc', '')).toBe(0);
    expect(similarity('', 'abc')).toBe(0);
  });
  it('returns a value between 0 and 1 for partial similarity', () => {
    const sim = similarity('kitten', 'sitting');
    expect(sim).toBeGreaterThan(0);
    expect(sim).toBeLessThan(1);
  });
});

describe('calculateAccuracy', () => {
  it('calculates MCQ accuracy', () => {
    const game = { gameType: 'mcq', questions: [{ isCorrect: true }, { isCorrect: false }] };
    expect(calculateAccuracy(game)).toBe(50);
  });

  it('calculates OpenEnded accuracy', () => {
    const game = { gameType: 'open_ended', questions: [{ percentageCorrect: 80 }, { percentageCorrect: 100 }] };
    expect(calculateAccuracy(game)).toBe(90);
  });

  it('returns 0 for empty questions array', () => {
    const game = { gameType: 'mcq', questions: [] };
    expect(calculateAccuracy(game)).toBe(0);
  });
});