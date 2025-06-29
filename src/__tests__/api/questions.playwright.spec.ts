import { test, expect, request as pwRequest } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

// Use your valid session token here
const SESSION_COOKIE = 'next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..PRUCPJYGr3cRA0ma.AHb4HYc_LEbujbEGO9GHY3HvktOGQ-HAbTvQdu3rUJmT8Mr6rxFoADJEoKSFrO_lKpMAkwUMx0CW3K7ZH3RP9IU36jPShnVso4LeamjDREo1Yx307R88ya-5ly8uRVPOmqCquoUckWo6wUYG_FBy3o_a396GEkl_IFIVE4mYiNCHs3NhaACoGLD3vELf06GO0d2LU21tnkkb6J_NwZdG4hwUxAov7w-7ac-PKAYOvMc7abJjtXTSQLtjzFXNjefpcAjUM4rQJ9iaVqLEL5x-bznxenidYwVggJOF0sTaH5Hwel5RlvpYAS0ScSOOnM5g0p28vibtUYN_Qwui5o_tv90WVS2Lcf-hCpl1W9DvbYnLk82l2ucGtU3xfIodoyrD_208sUxrGm5Sqwz_I4I3Bjt_BNJUUTMe1KrZRdEJO8102jag7QLbxY7vskrXzTZ7OrU.kHl2gOOOB9umjBjdqkwZxQ';

test.describe('/api/questions', () => {
  test('POST /api/questions returns 401 if not authenticated', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/questions`, {
      data: { topic: "JavaScript", type: "mcq", amount: 1 }
    });
    expect(response.status()).toBe(200);
  });

  test('POST /api/questions returns 400 for invalid input (authenticated)', async () => {
    const authRequest = await pwRequest.newContext({
      baseURL,
      extraHTTPHeaders: {
        cookie: SESSION_COOKIE
      }
    });

    // Missing type and amount
    const response = await authRequest.post(`/api/questions`, {
      data: { topic: "JavaScript" }
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test('POST /api/questions returns open-ended questions (authenticated)', async () => {
    const authRequest = await pwRequest.newContext({
      baseURL,
      extraHTTPHeaders: {
        cookie: SESSION_COOKIE
      }
    });

    const response = await authRequest.post(`/api/questions`, {
      data: { topic: "Science", type: "open_ended", amount: 2 }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.questions)).toBe(true);
    expect(body.questions.length).toBe(2);
    expect(body.questions[0]).toHaveProperty('question');
    expect(body.questions[0]).toHaveProperty('answer');
  });

  test('POST /api/questions returns mcq questions (authenticated)', async () => {
    const authRequest = await pwRequest.newContext({
      baseURL,
      extraHTTPHeaders: {
        cookie: SESSION_COOKIE
      }
    });

    const response = await authRequest.post(`/api/questions`, {
      data: { topic: "Math", type: "mcq", amount: 1 }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.questions)).toBe(true);
    expect(body.questions.length).toBe(1);
    expect(body.questions[0]).toHaveProperty('question');
    expect(body.questions[0]).toHaveProperty('answer');
    expect(body.questions[0]).toHaveProperty('option1');
    expect(body.questions[0]).toHaveProperty('option2');
    expect(body.questions[0]).toHaveProperty('option3');
  });
});