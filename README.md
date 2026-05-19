# Steam 게임 할인에 따른 장르별 사용자 참여도 변화 분석

Steam 게임의 장르별로 할인이 사용자 참여도(Engagement)에 어떤 변화를 일으키는지
분석하는 데이터 분석 프로젝트입니다.

## 핵심 질문

- 할인이 모든 게임에서 동일한 사용자 참여도 변화를 일으키는가?
- 장르별로 사용자 참여도 변화 패턴은 어떻게 다른가?

## 사용 데이터

- Steam Web API (게임 메타데이터, 개별 리뷰)
- IsThereAnyDeal API (할인 이력)

## 분석 도구

- Python (pandas, matplotlib, seaborn)
- Jupyter Notebook

## 데이터 규모

- 분석 대상: 5개 장르 × 11개 게임 = **55개 게임**
- 할인 이벤트: 수집 808건 / 유효 분석 263건
- 개별 리뷰: 약 **257만 건** (playtime, voted_up 포함)

## 재현 시 주의사항

`data/review_individual.csv`는 용량(약 350MB) 문제로 GitHub에 포함하지 않았습니다.  
재현 시 `notebooks/05b_reviews_individual.ipynb`를 실행하면 생성됩니다.  
수집 소요 시간: 약 8~13시간 (Steam API 속도 제한으로 인해 sleep 1초 적용)

## 노트북 실행 순서

```
01 → 02 → 03 → 04 → 05b → 06 → 07
보완 분석: 08 (민감도·긍정률) → 09 (통계 검증)
```

## 팀원

- 이승엽 — 데이터 수집·전처리·PPT
- 이동민 — 분석·시각화·발표
