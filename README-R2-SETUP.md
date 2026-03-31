# FreeSoo R2 운영형 배포 가이드

## 1. site-config.js 설정
- `CDN_BASE`: R2 custom domain 예) `https://cdn.freesoo.com`
- `UPLOAD_API_BASE`: Worker 주소 예) `https://freesoo-upload.example.workers.dev`
- `WEB_ANALYTICS_SNIPPET`: Cloudflare Web Analytics 스니펫 전체 문자열

## 2. R2 bucket 만들기
1. Cloudflare Dashboard > R2 > Create bucket
2. bucket name: `freesoo-video`
3. Settings > Custom Domains > Add > `cdn.example.com` 연결
4. Public access를 활성화하고 `r2.dev`는 개발용으로만 사용

## 3. Worker 배포
1. `npm install wrangler --save-dev`
2. `npx wrangler login`
3. `npx wrangler secret put UPLOAD_API_TOKEN`
4. `npx wrangler deploy`
5. worker URL을 `site-config.js`의 `UPLOAD_API_BASE`에 입력

## 4. 관리자 업로드 사용법
- 관리자 페이지 로그인 시:
  - 페이지 비밀번호: 각 HTML 상단의 `ADMIN_PASSWORD`
  - R2 업로드 토큰: `UPLOAD_API_TOKEN`에 넣은 값
- 업로드 성공 시 CDN 절대경로가 자동으로 입력됨
- `skills.json`, `guides.json`은 다운로드해서 GitHub에 반영

## 5. 추천 캐시 정책
- mp4: `public, max-age=31536000, immutable`
- jpg/png 썸네일: `public, max-age=604800`

## 6. Cloudflare Web Analytics
- Dashboard > Web Analytics > Add a site
- 비프록시 사이트는 JS snippet을 복사해 `site-config.js`의 `WEB_ANALYTICS_SNIPPET`에 넣기
- Cloudflare Pages/프록시 사이트는 자동 활성화 가능
