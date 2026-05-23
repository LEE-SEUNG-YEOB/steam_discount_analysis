"""
scripts/build_app_data.py
--------------------------
원본 CSV → 웹앱용 JSON 변환 스크립트.
프로젝트 루트에서 실행하세요: python scripts/build_app_data.py

출력:
  web/public/data/dashboard_events.json
  web/public/data/summary.json
  web/public/data/games.json
  web/public/data/game_reports.json
  web/public/data/simulator_rules.json
"""

import json
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data"
OUTPUT_DIR = ROOT / "web" / "public" / "data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# ─── 유틸 ───────────────────────────────────────────────────────────────────

def load_csv(filename: str):
    path = DATA_DIR / filename
    if not path.exists():
        print(f"[WARNING] {filename} 파일이 없습니다. ({path})")
        return None
    df = pd.read_csv(path)
    print(f"  로드: {filename}  ({len(df):,}행)")
    return df


def write_json(data, filename: str):
    path = OUTPUT_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    count = len(data) if isinstance(data, list) else 1
    print(f"  [OK] {filename}  ({count:,}건)")


def safe_float(val, default=None):
    try:
        v = float(val)
        import math
        return default if math.isnan(v) else round(v, 4)
    except (TypeError, ValueError):
        return default


def safe_int(val, default=None):
    try:
        return int(val)
    except (TypeError, ValueError):
        return default


def safe_bool(val, default=False):
    if isinstance(val, bool):
        return val
    if isinstance(val, (int, float)):
        return bool(val)
    if isinstance(val, str):
        return val.strip().lower() in ("true", "1", "yes")
    return default


# ─── dashboard_events.json ──────────────────────────────────────────────────

def build_dashboard_events():
    print("\n[dashboard_events.json 생성]")

    # 1) 필수 파일 로드
    sentiment = load_csv("event_sentiment.csv")
    if sentiment is None:
        print("[ERROR] event_sentiment.csv가 없어 dashboard_events.json을 생성할 수 없습니다.")
        return []

    analysis = load_csv("analysis_df.csv")
    genre_map_df = load_csv("genre_mapping_v2.csv")
    metadata = load_csv("game_metadata.csv")

    # 2) genre dict 구성  (app_id → genre_v2)
    genre_dict: dict[int, str] = {}
    if genre_map_df is not None:
        for _, row in genre_map_df.iterrows():
            genre_dict[int(row["app_id"])] = str(row["genre_v2"])

    # 3) game_name dict 구성 (appid → name)
    name_dict: dict[int, str] = {}
    if metadata is not None:
        for _, row in metadata.iterrows():
            name_dict[int(row["appid"])] = str(row["name"])

    # 4) analysis_df 인덱스 구성 (appid, discount_start) → row
    #    조인 키: appid + discount_start
    #    컬럼 매핑:
    #      reaction_rate    → response_rate_all
    #      sustained_rate   → retention_rate
    #      discount_pct     → discount_rate
    #      is_seasonal_sale → is_season_sale
    #      name             → game_name (fallback)
    analysis_index: dict[tuple, dict] = {}
    if analysis is not None:
        for _, row in analysis.iterrows():
            key = (int(row["appid"]), str(row["discount_start"]).strip())
            analysis_index[key] = row.to_dict()

    # 5) genre별 유효 이벤트 수 계산 (playtime_filter == "all" 기준)
    sentiment_all = sentiment[sentiment["playtime_filter"] == "all"] if "playtime_filter" in sentiment.columns else sentiment

    genre_event_counts: dict[str, int] = {}
    for _, row in sentiment_all.iterrows():
        appid = int(row["appid"])
        genre = genre_dict.get(appid, "Unknown")
        genre_event_counts[genre] = genre_event_counts.get(genre, 0) + 1

    # 6) 이벤트 리스트 생성
    events = []
    missing_analysis = 0
    missing_name = 0
    missing_genre = 0

    for i, row in sentiment.iterrows():
        appid = int(row["appid"])
        discount_start = str(row["discount_start"]).strip()

        # analysis_df 조인
        analysis_row = analysis_index.get((appid, discount_start))
        if analysis_row is None:
            missing_analysis += 1

        # game_name
        game_name = name_dict.get(appid)
        if game_name is None and analysis_row is not None:
            game_name = analysis_row.get("name")
        if game_name is None:
            game_name = f"Game {appid}"
            missing_name += 1

        # genre
        genre = genre_dict.get(appid)
        if genre is None:
            genre = "Unknown"
            missing_genre += 1

        # playtime_filter
        playtime_raw = str(row.get("playtime_filter", "all")).strip()
        playtime: str
        if playtime_raw in ("all", "2h", "10h"):
            playtime = playtime_raw
        else:
            playtime = "all"

        # sentiment_group 정규화
        sg_raw = str(row.get("sentiment_group", "")).strip().lower()
        sg_map = {
            "up": "up",
            "neutral": "neutral",
            "down": "down",
            "positive_rate_up": "positive_rate_up",
            "positive_rate_flat": "positive_rate_flat",
            "positive_rate_down": "positive_rate_down",
        }
        sentiment_group = sg_map.get(sg_raw)

        event: dict = {
            "event_id": f"evt_{i:05d}",
            "appid": appid,
            "game_name": str(game_name),
            "genre": genre,
            "discount_start": discount_start,
            "playtime_filter": playtime,
            "response_rate_positive": safe_float(row.get("response_rate_positive")),
            "response_rate_negative": safe_float(row.get("response_rate_negative")),
            "positive_count_before": safe_int(row.get("positive_count_before")),
            "negative_count_before": safe_int(row.get("negative_count_before")),
            "positive_count_during": safe_int(row.get("positive_count_during")),
            "negative_count_during": safe_int(row.get("negative_count_during")),
            "positive_rate_before": safe_float(row.get("positive_rate_before")),
            "positive_rate_during": safe_float(row.get("positive_rate_during")),
            "positive_rate_delta": safe_float(row.get("positive_rate_delta")),
        }

        if sentiment_group is not None:
            event["sentiment_group"] = sentiment_group

        # analysis_df 필드 보강
        if analysis_row is not None:
            event["response_rate_all"] = safe_float(analysis_row.get("reaction_rate"))
            event["retention_rate"] = safe_float(analysis_row.get("sustained_rate"))
            event["discount_rate"] = safe_float(analysis_row.get("discount_pct"))
            event["is_season_sale"] = safe_bool(analysis_row.get("is_seasonal_sale"))
        else:
            event["response_rate_all"] = None
            event["retention_rate"] = None
            event["discount_rate"] = None
            event["is_season_sale"] = None

        # genre별 유효 이벤트 수 (playtime=all 기준)
        event["valid_event_count_for_genre"] = genre_event_counts.get(genre, 0)

        events.append(event)

    # 7) 누락 보고
    print(f"  총 이벤트: {len(events):,}건")
    print(f"  analysis_df 조인 실패: {missing_analysis}건 → response_rate_all/retention_rate/discount_rate/is_season_sale = null")
    print(f"  game_name 누락 (fallback 처리): {missing_name}건")
    print(f"  genre 누락 (Unknown 처리): {missing_genre}건")

    return events


# ─── summary.json ───────────────────────────────────────────────────────────

def build_summary(metadata, analysis):
    print("\n[summary.json 생성]")

    games_count = len(metadata) if metadata is not None else 55
    valid_events = len(analysis) if analysis is not None else 263

    # Steam 누적 전체 리뷰(total_reviews)가 아니라
    # 분석 기간 내 수집된 리뷰 수 기준 — 발표 자료 확정값 사용
    reviews_count = 2_570_000

    return {
        "games_count": games_count,
        "discount_events_collected": 808,
        "valid_events": valid_events,
        "reviews_count": reviews_count,
        "main_message": (
            "할인은 단기 유입을 만들지만, "
            "유입의 질은 조건에 따라 다르게 나타났습니다."
        ),
    }


# ─── games.json ──────────────────────────────────────────────────────────────

def build_games(metadata, genre_dict):
    print("\n[games.json 생성]")

    if metadata is None:
        print("  [SKIP] game_metadata.csv 없음")
        return []

    games = []
    for _, row in metadata.iterrows():
        appid = int(row["appid"])
        games.append({
            "appid": appid,
            "name": str(row["name"]),
            "genre": genre_dict.get(appid, str(row.get("genre_category", "Unknown"))),
            "release_date": str(row["release_date"]) if "release_date" in row else None,
            "price_usd": safe_float(row.get("price_usd")),
            "total_reviews": safe_int(row.get("total_reviews")),
            "is_multiplayer": safe_bool(row.get("is_multiplayer")),
        })

    games.sort(key=lambda g: g["name"])
    print(f"  게임 수: {len(games)}개")
    return games


# ─── game_reports.json ───────────────────────────────────────────────────────

def build_game_reports(analysis, metadata, genre_dict):
    print("\n[game_reports.json 생성]")

    if analysis is None:
        print("  [SKIP] analysis_df.csv 없음")
        return []

    # game_name dict
    name_dict: dict[int, str] = {}
    if metadata is not None:
        for _, row in metadata.iterrows():
            name_dict[int(row["appid"])] = str(row["name"])

    # analysis에 genre 컬럼 추가
    analysis = analysis.copy()
    analysis["genre"] = analysis["appid"].apply(
        lambda aid: genre_dict.get(int(aid), "Unknown")
    )

    # 전체 reaction_rate 중앙값
    overall_median = float(analysis["reaction_rate"].median())

    # 장르별 중앙값
    genre_medians: dict[str, float] = (
        analysis.groupby("genre")["reaction_rate"].median().to_dict()
    )

    reports = []
    for appid, group in analysis.groupby("appid"):
        appid = int(appid)
        genre = genre_dict.get(appid, "Unknown")
        name = name_dict.get(appid, group["name"].iloc[0] if "name" in group.columns else f"Game {appid}")

        season = group[group["is_seasonal_sale"] == True]["reaction_rate"]
        nonseason = group[group["is_seasonal_sale"] == False]["reaction_rate"]

        report: dict = {
            "appid": appid,
            "name": str(name),
            "genre": genre,
            "valid_event_count": len(group),
            "avg_discount_rate": round(float(group["discount_pct"].mean()), 2),
            "max_discount_rate": round(float(group["discount_pct"].max()), 2),
            "avg_response_rate": round(float(group["reaction_rate"].mean()), 4),
            "avg_retention_rate": round(float(group["sustained_rate"].mean()), 4),
            "genre_median_response": round(genre_medians.get(genre, overall_median), 4),
            "overall_median_response": round(overall_median, 4),
            "discount_frequency": len(group),
        }

        if len(season) > 0:
            report["season_response"] = round(float(season.mean()), 4)
        if len(nonseason) > 0:
            report["nonseason_response"] = round(float(nonseason.mean()), 4)

        reports.append(report)

    reports.sort(key=lambda r: r["name"])
    print(f"  게임 수: {len(reports)}개  /  총 이벤트: {len(analysis)}건")
    return reports


# ─── simulator_rules.json ────────────────────────────────────────────────────

def build_simulator_rules():
    print("\n[simulator_rules.json 생성]")

    rules = [
        {
            "id": "discount_rate_high",
            "condition": "할인율 60% 이상",
            "message": "높은 할인율은 단기 반응을 높일 가능성이 있습니다.",
            "evidence": "Spearman ρ=0.18, p=0.004 (할인율 구간별 반응률 분석)",
            "chart": "chart13",
            "confidence": "strong",
        },
        {
            "id": "discount_rate_low",
            "condition": "할인율 30% 미만",
            "message": "낮은 할인율은 단기 반응에 대한 영향이 제한적일 수 있습니다.",
            "evidence": "Spearman ρ=0.18, p=0.004 — 할인율이 낮을수록 반응률 평균이 낮게 나타났습니다.",
            "confidence": "strong",
        },
        {
            "id": "season_sale_retention",
            "condition": "시즌 세일",
            "message": "시즌 세일은 단기 유입형 전략에 가깝습니다. 유지율 주의가 필요합니다.",
            "evidence": "시즌 세일은 비시즌보다 반응률은 높고 유지율은 낮은 경향을 보였습니다. 단, p-value가 충분히 낮지 않아 탐색적 패턴으로 해석합니다.",
            "confidence": "exploratory",
        },
        {
            "id": "nonseason_retention",
            "condition": "비시즌 할인",
            "message": "비시즌 할인은 시즌 세일 대비 유지율이 상대적으로 높은 경향을 보입니다.",
            "evidence": "탐색적 패턴 — p-value가 충분히 낮지 않아 확정 결론은 아닙니다.",
            "confidence": "exploratory",
        },
        {
            "id": "action_satisfaction",
            "condition": "Action 장르",
            "message": "Action은 반응률이 높게 나타났지만, 긍정률 하락 경향도 함께 관찰되었습니다.",
            "evidence": "신뢰구간이 0을 포함하므로 확정 결론이 아니라 탐색적 경향입니다.",
            "confidence": "exploratory",
        },
        {
            "id": "rpg_retention",
            "condition": "RPG 장르 + 10시간 이상 유저",
            "message": "RPG 장르는 장기 유지 가능성이 상대적으로 높은 경향을 보입니다.",
            "evidence": "탐색적 패턴 — 장르 차이 p=0.52로 통계적으로 유의하지 않습니다.",
            "confidence": "exploratory",
        },
        {
            "id": "casual_response",
            "condition": "Casual/Lightweight 장르",
            "message": "Casual 장르는 이벤트 단위 반응이 높게 나타나는 경향이 있습니다.",
            "evidence": "탐색적 패턴 — 장르 차이 p=0.52로 통계적으로 유의하지 않습니다.",
            "confidence": "exploratory",
        },
        {
            "id": "high_frequency_fatigue",
            "condition": "연간 할인 3회 이상",
            "message": "반복 할인은 반응률 약화 가능성이 있으므로 빈도 조절이 필요합니다.",
            "evidence": "p=0.07 수준의 경향으로 탐색적 패턴입니다.",
            "confidence": "exploratory",
        },
    ]

    print(f"  룰 수: {len(rules)}개")
    return rules


# ─── main ───────────────────────────────────────────────────────────────────

def main():
    print(f"데이터 폴더: {DATA_DIR}")
    print(f"출력 폴더:   {OUTPUT_DIR}")

    # 공통 데이터 로드
    print("\n[공통 데이터 로드]")
    analysis = load_csv("analysis_df.csv")
    metadata = load_csv("game_metadata.csv")
    genre_map_df = load_csv("genre_mapping_v2.csv")

    # genre dict 구성
    genre_dict: dict[int, str] = {}
    if genre_map_df is not None:
        for _, row in genre_map_df.iterrows():
            genre_dict[int(row["app_id"])] = str(row["genre_v2"])

    # 각 JSON 생성
    summary = build_summary(metadata, analysis)
    write_json(summary, "summary.json")

    games = build_games(metadata, genre_dict)
    if games:
        write_json(games, "games.json")

    reports = build_game_reports(analysis, metadata, genre_dict)
    if reports:
        write_json(reports, "game_reports.json")

    simulator_rules = build_simulator_rules()
    write_json(simulator_rules, "simulator_rules.json")

    events = build_dashboard_events()
    if events:
        write_json(events, "dashboard_events.json")

    print("\n완료!")
    print("생성된 파일:")
    for f in ["summary.json", "games.json", "game_reports.json",
              "simulator_rules.json", "dashboard_events.json"]:
        p = OUTPUT_DIR / f
        print(f"  {'✓' if p.exists() else '✗'} {f}")


if __name__ == "__main__":
    main()
