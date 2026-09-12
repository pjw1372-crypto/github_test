# 여울 마스코트 자산 (대기 중)

이 폴더에는 홈 화면용으로 확정된 마스코트 포즈 파일을 넣습니다:

- `yeoul-fox-home-sitting-reading.png` — 안경·보타이, 파란 책을 들고 앉아 읽는 포즈 (확정본, 아직 파일로 전달되지 않음)

파일이 도착하면:
1. 이 폴더에 위 파일명으로 저장
2. `components/home/MascotHero.tsx`의 placeholder `<div>`를 `next/image`의 `<Image src="/images/mascot/yeoul-fox-home-sitting-reading.png" ... />`로 교체
3. `components/home/MascotHero.module.css`의 placeholder용 `border`/`background`를 제거

캐릭터를 새로 그리거나 다른 포즈로 대체하지 않습니다 — 오직 이 확정된 PNG로만 교체합니다.
