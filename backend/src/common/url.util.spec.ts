import { describe, expect, it } from 'vitest';
import { stripTrailingSlash } from './url.util';

describe('stripTrailingSlash', () => {
  it('bỏ một dấu / cuối', () => {
    expect(stripTrailingSlash('http://127.0.0.1:8000/')).toBe(
      'http://127.0.0.1:8000',
    );
  });

  it('giữ nguyên khi không có / cuối', () => {
    expect(stripTrailingSlash('http://127.0.0.1:8000')).toBe(
      'http://127.0.0.1:8000',
    );
  });
});
