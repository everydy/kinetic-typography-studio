# ⚡ Kinetic Typography Studio

> **한글 자소 결합 및 글로벌 키네틱 모션 타이포그래피 인터랙티브 스튜디오**  
> 28가지 다채로운 인(IN) 트랜지션, 실시간 폰트 모딩(서체·두께·자간·크기), 라이트/다크 테마 스위처, 그리고 Remotion 컴포넌트 연동을 지원하는 웹 모션 랩입니다.

---

## 🚀 Live Demo

- **GitHub Pages**: [https://everydy.github.io/kinetic-typography-studio/](https://everydy.github.io/kinetic-typography-studio/)
- **Netlify Deploy**: [https://kinetic-typography-studio.netlify.app](https://kinetic-typography-studio.netlify.app)

---

## ✨ 핵심 기능

1. **🇰🇷 한글 자소 결합 특화 모션 (4종)**
   - **자소 자석 결합 (Hangul Assembly)**: 초성·중성·종성이 사방에서 날아와 완성 글자로 결합되는 물리 모션
   - **자모 타이핑 (Hangul Typing)**: 자음과 모음이 낱개 단위로 타닥타닥 조립되며 타이핑되는 효과
   - **자모 팝 & 모프 (Hangul Morph)**: 낱자 단위로 탄성 있게 팝업되며 완성형으로 형태가 변하는 모션
   - **캘리그라피 드로우 (Calligraphy)**: 붓글씨 획이 그어지듯 나타나는 우아한 드로잉 모션

2. **🌐 28종 풀라인업 인(IN) 트랜지션**
   - **3D 공간 & 원근 (5종)**: 3D 플립, 3D 큐브 회전, 도미노, 나선형 스파이럴, 스윙 진자
   - **마스크 & 슬라이스 (4종)**: 대각선 슬라이스, 블라인드 셔터, 바이패스 듀얼, 원형 마스크
   - **바운스 & 임팩트 (5종)**: 중력 낙하 바운스, 탄성 젤리, 스탬프 임팩트, 폭발 파편, 글리치 스파크
   - **시네마틱 & 페이드 (5종)**: 시네마틱 줌 블러, 네온 플리커, 라이트 스위프, 홀로그램 빔, 페이드 업
   - **테크 & 미니멀 (5종)**: 스캔라인 디스플레이, 터미널 블록 커서, 와이어프레임 메트릭스, 미니멀 스케일, 플로팅 웨이브

3. **🎨 실시간 폰트 모딩 (Font Moding)**
   - **한글 폰트**: Pretendard, Black Han Sans, Do Hyeon, Noto Serif KR, Gowun Batang
   - **글로벌 폰트**: Montserrat, Bebas Neue, Space Grotesk, Playfair Display, JetBrains Mono
   - **상세 튜닝**: 굵기(Weight 100~900), 자간(Letter Spacing -4px~20px), 크기(Size 24px~80px), 대소문자 변환, 텍스트 컬러 피커

4. **🌓 다크 / 라이트 모드 전환**
   - ☀️ 화이트 모드 / 🌙 다크 모드를 원클릭으로 전환하여 다양한 배경 톤에서의 시각적 전달력 확인 가능

5. **📋 Remotion JSX 원클릭 내보내기**
   - 각 카드 하단의 `[📋 Remotion JSX]` 버튼을 클릭하면 현재 모딩된 값(폰트, 자간, 크기, 이펙트 종류)이 반영된 Remotion 코드가 클립보드에 복사됩니다.

---

## 🎬 Remotion에서 사용하기

저장소의 `KineticText.tsx` 파일을 Remotion 프로젝트의 `src/components/` 폴더에 복사한 뒤 다음과 같이 사용합니다:

```tsx
import { KineticText } from './KineticText';

export const MyComposition = () => {
  return (
    <div style={{ flex: 1, backgroundColor: '#0B1120', justifyContent: 'center', alignItems: 'center' }}>
      <KineticText
        text="크리에이티브 키네틱 모션"
        effect="hangul-assembly"
        fontFamily="Pretendard Variable"
        fontWeight={900}
        letterSpacing="-0.02em"
        fontSize={64}
        color="#FFFFFF"
        durationInFrames={45}
      />
    </div>
  );
};
```

---

## 🛠️ 로컬 실행 방법

별도의 빌드 과정 없이 `index.html`을 바로 브라우저에서 실행할 수 있습니다:

```bash
# 단순 파일 열기
open index.html

# 또는 로컬 웹 서버 실행
npx serve .
```

---

## 📄 License
MIT License
