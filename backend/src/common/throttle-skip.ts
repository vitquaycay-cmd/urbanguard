/**
 * ThrottlerModule.forRoot dùng các rule có `name` (`auth`, `api`).
 * `@SkipThrottle()` không tham số sẽ **không** bỏ qua — phải chỉ rõ từng name.
 */
export const skipAllThrottles = { auth: true, api: true } as const;
