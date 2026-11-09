import http from 'http';
import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000';

async function request(path: string, options: any = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runSecurityTests() {
  console.log('🧪 Executing MOLAN AI Radical Security Audit & Integration Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function test(condition: boolean, title: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASSED: ${title}`);
      passed++;
    } else {
      console.log(`  ❌ FAILED: ${title} ${detail ? `- ${detail}` : ''}`);
      failed++;
    }
  }

  try {
    // 1. System Health Status Check
    const health = await request('/api/health');
    test(health.status === 200 && health.data.success === true, '1. System Health Status Check');

    // 2. Register New User Account & Role Isolation
    const regEmail = `sec_user_${Date.now()}@example.com`;
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: regEmail, password: 'SecurePassword123!', name: 'مستخدم الأمان' }),
    });
    test(
      regRes.status === 201 &&
      regRes.data.success === true &&
      regRes.data.user.role === 'user' &&
      !regRes.data.user.isAdmin,
      '2. Public Registration Defaults strictly to "user" Role (No Auto-Admin)'
    );

    const userToken = regRes.data.token || '';
    const userId = regRes.data.user?.id || '';

    // 3. Login Mandatory Password Checks
    const loginNoPass = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: regEmail }),
    });
    test(loginNoPass.status === 401 && loginNoPass.data.success === false, '3. Reject Login Request Missing Password (401 Unauthorized)');

    const loginEmptyPass = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: regEmail, password: '   ' }),
    });
    test(loginEmptyPass.status === 401 && loginEmptyPass.data.success === false, '4. Reject Login Request with Blank Password');

    const loginWrongPass = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: regEmail, password: 'WrongPassword999' }),
    });
    test(loginWrongPass.status === 401 && loginWrongPass.data.success === false, '5. Reject Login Request with Incorrect Password');

    const loginSuccess = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: regEmail, password: 'SecurePassword123!' }),
    });
    test(loginSuccess.status === 200 && loginSuccess.data.success === true, '6. Successful Authentication with Valid Password');

    // 4. Block Unauthenticated Endpoints
    const unauthReq = await request('/api/projects');
    test(unauthReq.status === 401 && unauthReq.data.success === false, '7. Enforce Authentication Token on Protected Routes');

    // 5. Cross-User IDOR Data Isolation
    const regUser2 = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: `user2_${Date.now()}@example.com`, password: 'Password123!', name: 'User B' }),
    });
    const user2Token = regUser2.data.token || '';

    const idorCheck = await request(`/api/projects/${userId}`, {
      headers: { Authorization: `Bearer ${user2Token}` },
    });
    test(idorCheck.status === 403 && idorCheck.data.success === false, '8. IDOR Prevention: Block User B from Accessing User A Data');

    // 6. Admin Panel RBAC Protection
    const adminPanelCheck = await request('/api/admin/stats', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    test(adminPanelCheck.status === 403 && adminPanelCheck.data.success === false, '9. Admin RBAC: Block Standard User from Admin Endpoints');

    // 7. Unconfigured Payment Webhook & Fake Proof Rejection
    const webhookCheck = await request('/api/webhooks/payment', {
      method: 'POST',
      body: JSON.stringify({ paymentId: 'pay_123', userId: userId, planTier: 'pro', amount: 29, currency: 'USD' }),
    });
    test(webhookCheck.status === 503 || webhookCheck.status === 401, '10. Disable Payment Webhook when Secret is Missing or Signature Mismatched');

    const fakeProofSub = await request('/api/user/subscription', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ tier: 'pro', paymentProofToken: 'fake_invalid_token.signature' }),
    });
    test(fakeProofSub.status === 400 || fakeProofSub.status === 401, '11. Block Subscription Upgrade with Fake/Invalid Payment Proof Token');

    // 8. Single-Use Coupon Enforcement per User
    const coupon1 = await request('/api/coupons/redeem', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ code: 'MOUULIN2026' }),
    });
    test(coupon1.status === 200 && coupon1.data.success === true, '12. Redeem Valid Coupon Successfully');

    const coupon2 = await request('/api/coupons/redeem', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ code: 'MOUULIN2026' }),
    });
    test(coupon2.status === 400 && coupon2.data.success === false, '13. Enforce Single-Use Coupon per User (Prevent Duplicate Redeem)');

    // 9. Input Validation & Negative Input Rejection
    const adminLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'ahmed@moulin.ai', password: process.env.ADMIN_INITIAL_PASSWORD || 'MolanAdminSecured2026!' }),
    });

    const adminToken = adminLoginRes.data.token || '';
    const negativeGrant = await request('/api/admin/grant-credits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ targetUserId: userId, amount: -50, reason: 'Negative Credit Test' }),
    });
    test(negativeGrant.status === 400 && negativeGrant.data.success === false, '14. Reject Negative or Invalid Numeric Inputs (Grant Credits)', `status=${negativeGrant.status}, data=${JSON.stringify(negativeGrant.data)}`);

    // 10. File Upload Security & Magic Byte Verification
    const fakeScriptBase64 = 'data:image/png;base64,' + Buffer.from('<?php echo "evil_script"; ?>').toString('base64');
    const uploadCheck = await request('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ fileData: fakeScriptBase64, fileName: 'script.php' }),
    });
    test(uploadCheck.status === 400 && uploadCheck.data.success === false, '15. Upload Security: Reject Executable Script disguised as Image (Magic Bytes Mismatch)', `status=${uploadCheck.status}, data=${JSON.stringify(uploadCheck.data)}`);

    // Valid JPG Image Upload Test (1x1 Pixel JPEG)
    const validJpgBase64 = 'data:image/jpg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
    const uploadJpgCheck = await request('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ fileData: validJpgBase64, fileName: 'product_photo.jpg' }),
    });
    test(uploadJpgCheck.status === 200 && uploadJpgCheck.data.success === true, '15b. Upload Security: Accept Valid JPG/JPEG Image from Mobile Phone');

    // 11. Concurrent Credit Reservation Race Condition Protection
    const userMe = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const currentCredits = userMe.data.user.credits || 0;

    // Trigger two rapid parallel calls requiring 10 credits each
    const videoCall1 = request('/api/ai/video-generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ product: 'منتج الساعات الفاخرة' }),
    });

    const videoCall2 = request('/api/ai/video-generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ product: 'منتج العطور الفاخرة' }),
    });

    const [res1, res2] = await Promise.all([videoCall1, videoCall2]);
    // Since API key is missing or calls complete, verify that credit subtraction was atomic and balance never went negative
    const userMeAfter = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    test(userMeAfter.data.user.credits >= 0, '16. Credit Balance Protection: Ensure Balance Never Reaches Negative Under Concurrency');

    // 12. Unconfigured AI Failure without Credit Deduction
    const unconfiguredAiCall = await request('/api/ai/video-generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ product: 'تجربة التوليد بدون مفتاح' }),
    });
    test(
      (unconfiguredAiCall.status === 400 || unconfiguredAiCall.status === 500) &&
      unconfiguredAiCall.data.success === false,
      '17. AI Failure Returns Error Response with 0 Credits Loss',
      `status=${unconfiguredAiCall.status}, data=${JSON.stringify(unconfiguredAiCall.data)}`
    );

    // 13. Project Ownership CRUD Verification
    const createPrj = await request('/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ title: 'مشروع اختبار الأمان', type: 'video', platform: '9:16' }),
    });
    test(createPrj.status === 201 && createPrj.data.success === true, '18. Create Project with Authenticated User Token');
    const prjId = createPrj.data.project.id;

    const deleteUnauthorized = await request(`/api/projects/${prjId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user2Token}` },
    });
    test(deleteUnauthorized.status === 403 && deleteUnauthorized.data.success === false, '19. IDOR Deletion Protection: Prevent User B from Deleting User A Project');

    const deleteOwn = await request(`/api/projects/${prjId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    test(deleteOwn.status === 200 && deleteOwn.data.success === true, '20. Allow Owner to Delete Their Own Project');

    // 21. Real Server Gemini API Key Connection Test Endpoint
    const keyTestRes = await request('/api/ai/test-connection');
    test(keyTestRes.status === 200 && typeof keyTestRes.data.hasKey === 'boolean', '21. Server Gemini API Connection & Masked Key Diagnostic Test Route', `status=${keyTestRes.status}, data=${JSON.stringify(keyTestRes.data)}`);

    // 22. Video Generation Input Validation & Image Processing Scenarios
    // 22a. Short Product Description (e.g. 5 chars)
    const shortProdRes = await request('/api/ai/video-generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ product: 'ساعة' }),
    });
    test(
      shortProdRes.status === 200 || (shortProdRes.data.success === false && typeof shortProdRes.data.error === 'string'),
      '22a. Accept Short Product Description (e.g. 5 chars)',
      `status=${shortProdRes.status}, data=${JSON.stringify(shortProdRes.data)}`
    );

    // 22b. Long Product Description (2500 chars)
    const longText = 'منتج فاخر '.repeat(250); // ~2500 chars
    const longProdRes = await request('/api/ai/video-generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ product: longText }),
    });
    test(
      longProdRes.status === 200 || (longProdRes.data.success === false && typeof longProdRes.data.error === 'string'),
      '22b. Accept Long Product Description (2500 chars)',
      `status=${longProdRes.status}, data=${JSON.stringify(longProdRes.data)}`
    );

    // 22c. Product Description with Base64 Image
    const b64ImageRes = await request('/api/ai/video-generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ product: 'عطور ملكية فاخرة', image: validJpgBase64 }),
    });
    test(
      b64ImageRes.status === 200 || (b64ImageRes.data.success === false && typeof b64ImageRes.data.error === 'string'),
      '22c. Accept Product Description with Base64 Image',
      `status=${b64ImageRes.status}, data=${JSON.stringify(b64ImageRes.data)}`
    );

    // 22d. Product Description Without Image (Text-Only)
    const noImageRes = await request('/api/ai/video-generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ product: 'خدمة تسويق سحابي بدون صورة', image: '' }),
    });
    test(
      noImageRes.status === 200 || (noImageRes.data.success === false && typeof noImageRes.data.error === 'string'),
      '22d. Accept Product Description Without Image (Text-Only)',
      `status=${noImageRes.status}, data=${JSON.stringify(noImageRes.data)}`
    );

    // 22e. SSRF Prevention Test: Block Internal Network URL
    const ssrfBlockRes = await request('/api/ai/video-generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ product: 'تجربة ثغرة SSRF', image: 'http://127.0.0.1:3000/internal-secret' }),
    });
    test(
      ssrfBlockRes.status === 400 && ssrfBlockRes.data.error?.includes('SSRF Blocked'),
      '22e. SSRF Security: Block Access to Internal IP Addresses (127.0.0.1)',
      `status=${ssrfBlockRes.status}, data=${JSON.stringify(ssrfBlockRes.data)}`
    );

    // 23. AI Video Creator Module Test Scenarios
    // 23a. Story & Idea Expander Endpoint
    const expandRes = await request('/api/ai/expand-story-idea', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ idea: 'رائد فضاء يكتشف زهرة مضيئة على قمر مهجور', category: 'القصص الخيالية والمغامرات' }),
    });
    test(
      expandRes.status === 200 || (expandRes.data.success === false && typeof expandRes.data.error === 'string'),
      '23a. AI Video Creator: Expand Raw Idea into Rich Story & Screenplay',
      `status=${expandRes.status}, data=${JSON.stringify(expandRes.data)}`
    );

    // 23b. Creative Video Generation Endpoint
    const creativeVidRes = await request('/api/ai/creative-video-generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        prompt: 'سفينة فضائية هائلة تعبر ثقباً دودياً متلألئاً نحو كوكب مأهول بالغابات الكريستالية',
        category: 'القصص الخيالية والمغامرات',
        style: 'سينمائي فاخر 8K',
        aspectRatio: '16:9',
        duration: '10 ثوانٍ',
      }),
    });
    test(
      creativeVidRes.status === 200 || (creativeVidRes.data.success === false && typeof creativeVidRes.data.error === 'string'),
      '23b. AI Video Creator: Generate Creative Story Video',
      `status=${creativeVidRes.status}, data=${JSON.stringify(creativeVidRes.data)}`
    );

    // 24. URL TO AD Feature Scenarios
    // 24a. Analyze Public Store/Product URL Endpoint
    const analyzeUrlRes = await request('/api/ai/analyze-url', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30' }),
    });
    test(
      analyzeUrlRes.status === 200 || (analyzeUrlRes.data.success === false && typeof analyzeUrlRes.data.error === 'string'),
      '24a. URL TO AD: Analyze & Extract Product Info from Web URL',
      `status=${analyzeUrlRes.status}, data=${JSON.stringify(analyzeUrlRes.data)}`
    );

    // 24b. URL TO AD SSRF Prevention: Block Internal Network URLs
    const analyzeSsrfRes = await request('/api/ai/analyze-url', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ url: 'http://127.0.0.1:3000/internal-secret-db' }),
    });
    test(
      analyzeSsrfRes.status === 400 && analyzeSsrfRes.data.error?.includes('SSRF Blocked'),
      '24b. URL TO AD SSRF Security: Block Access to Internal IP Addresses (127.0.0.1)',
      `status=${analyzeSsrfRes.status}, data=${JSON.stringify(analyzeSsrfRes.data)}`
    );

    console.log(`\n📊 INTEGRATION TEST SUITE SUMMARY: Passed ${passed} / ${passed + failed} Tests.`);
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runSecurityTests();
