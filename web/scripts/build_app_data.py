"""
build_app_data.py
-----------------
CSV 원본 데이터를 읽어 웹앱용 JSON 파일을 생성합니다.
web/ 디렉토리에서 실행하세요: python scripts/build_app_data.py
"""

import json
import os
import sys
from pathlib import Path

# 경로 설정
SCRIPT_DIR = Path(__file__).parent
WEB_DIR = SCRIPT_DIR.parent
DATA_DIR = WEB_DIR.parent / "data"
OUTPUT_DIR = WEB_DIR / "public" / "data"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def load_csv(filename: str):
    try:
        import pandas as pd
    except ImportError:
        print("[ERROR] pandas가 설치되어 있지 않습니다. pip install pandas를 실행하세요.")
        sys.exit(1)

    path = DATA_DIR / filename
    if not path.exists():
        return None
    return pd.read_csv(path)


def check_required_files():
    required = ["analysis_df.csv", "game_metadata.csv", "genre_mapping_v2.csv"]
    missing = [f for f in required if not (DATA_DIR / f).exists()]
    if missing:
        print(f"[ERROR] 필수 파일을 찾을 수 없습니다: {missing}")
        print(f"        data/ 폴더 경로: {DATA_DIR}")
        sys.exit(1)

    review_path = DATA_DIR / "review_individual.csv"
    if not review_path.exists():
        print("[WARNING] data/review_individual.csv 파일이 없습니다.")
        print("          이 파일은 약 350MB 대용량 파일이므로 GitHub에 포함하지 않습니다.")
        print("          이미 public/data/*.json이 있다면 웹앱 실행에는 문제가 없습니다.")
        print("          전체 재현이 필요하다면 필독.md의 안내에 따라 파일을 먼저 생성하세요.")


def build_summary(analysis_df):
    import numpy as np
    n_games = analysis_df["app_id"].nunique() if "app_id" in analysis_df.columns else 55
    n_events = len(analysis_df)

    # review_daily로 전체 리뷰 수 추정
    review_daily = load_csv("review_daily.csv")
    reviews_count = 2_570_000
    if review_daily is not None and "review_count" in review_daily.columns:
        reviews_count = int(review_daily["review_count"].sum())

    summary = {
        "games_count": int(n_games),
        "discount_events_collected": 808,
        "valid_events": int(n_events),
        "reviews_count": reviews_count,
        "main_message": "할인은 단기 유입을 만들지만, 유입의 질은 조건에 따라 다르게 나타났습니다.",
    }
    return summary


def build_games(metadata, genre_mapping):
    if metadata is None:
        return []

    genre_map = {}
    if genre_mapping is not None and "app_id" in genre_mapping.columns:
        for _, row in genre_mapping.iterrows():
            genre_map[int(row["app_id"])] = row.get("genre", "Action")

    games = []
    for _, row in metadata.iterrows():
        app_id = int(row["app_id"]) if "app_id" in row else 0
        games.append({
            "app_id": app_id,
            "name": str(row.get("name", f"Game {app_id}")),
            "genre": genre_map.get(app_id, "Action"),
            "release_date": str(row["release_date"]) if "release_date" in row else None,
            "price": float(row["price"]) if "price" in row and not str(row.get("price", "")).strip() == "" else None,
        })
    return games


def build_game_reports(analysis_df, genre_mapping):
    import numpy as np

    if analysis_df is None:
        return []

    genre_map = {}
    if genre_mapping is not None and "app_id" in genre_mapping.columns:
        for _, row in genre_mapping.iterrows():
            genre_map[int(row["app_id"])] = row.get("genre", "Action")

    # 전체 반응률 중앙값
    response_col = None
    for col in ["response_rate", "response_rate_all", "engagement_response"]:
        if col in analysis_df.columns:
            response_col = col
            break

    if response_col is None:
        print("[WARNING] 반응률 컬럼을 찾을 수 없습니다.")
        return []

    overall_median = float(analysis_df[response_col].median())

    # 장르별 중앙값
    analysis_df = analysis_df.copy()
    analysis_df["genre"] = analysis_df["app_id"].map(genre_map).fillna("Action")
    genre_medians = analysis_df.groupby("genre")[response_col].median().to_dict()

    reports = []
    for app_id, group in analysis_df.groupby("app_id"):
        app_id = int(app_id)
        genre = genre_map.get(app_id, "Action")

        discount_col = next((c for c in ["discount_rate", "discount_pct"] if c in group.columns), None)
        retention_col = next((c for c in ["retention_rate", "engagement_retention"] if c in group.columns), None)
        season_col = next((c for c in ["is_season_sale", "season_sale"] if c in group.columns), None)
        positive_col = next((c for c in ["positive_rate_delta", "sentiment_delta"] if c in group.columns), None)

        avg_response = float(group[response_col].mean())
        avg_retention = float(group[retention_col].mean()) if retention_col else 0.0
        avg_discount = float(group[discount_col].mean()) if discount_col else 0.0
        max_discount = float(group[discount_col].max()) if discount_col else 0.0

        season_response = None
        nonseason_response = None
        if season_col and season_col in group.columns:
            s_group = group[group[season_col] == True]
            ns_group = group[group[season_col] == False]
            if len(s_group) > 0:
                season_response = float(s_group[response_col].mean())
            if len(ns_group) > 0:
                nonseason_response = float(ns_group[response_col].mean())

        name_col = next((c for c in ["name", "game_name", "title"] if c in group.columns), None)
        game_name = str(group[name_col].iloc[0]) if name_col else f"Game {app_id}"

        report = {
            "app_id": app_id,
            "name": game_name,
            "genre": genre,
            "valid_event_count": len(group),
            "avg_discount_rate": round(avg_discount, 2),
            "max_discount_rate": round(max_discount, 2),
            "avg_response_rate": round(avg_response, 4),
            "avg_retention_rate": round(avg_retention, 4),
            "genre_median_response": round(genre_medians.get(genre, overall_median), 4),
            "overall_median_response": round(overall_median, 4),
            "discount_frequency": len(group),
        }
        if season_response is not None:
            report["season_response"] = round(season_response, 4)
        if nonseason_response is not None:
            report["nonseason_response"] = round(nonseason_response, 4)

        reports.append(report)

    return sorted(reports, key=lambda x: x["name"])


def build_dashboard_events(analysis_df, genre_mapping):
    if analysis_df is None:
        return []

    genre_map = {}
    if genre_mapping is not None and "app_id" in genre_mapping.columns:
        for _, row in genre_mapping.iterrows():
            genre_map[int(row["app_id"])] = row.get("genre", "Action")

    response_col = next((c for c in ["response_rate", "response_rate_all", "engagement_response"] if c in analysis_df.columns), None)
    retention_col = next((c for c in ["retention_rate", "engagement_retention"] if c in analysis_df.columns), None)
    discount_col = next((c for c in ["discount_rate", "discount_pct"] if c in analysis_df.columns), None)
    season_col = next((c for c in ["is_season_sale", "season_sale"] if c in analysis_df.columns), None)
    pos_before_col = next((c for c in ["positive_rate_before", "pos_rate_pre"] if c in analysis_df.columns), None)
    pos_during_col = next((c for c in ["positive_rate_during", "pos_rate_post"] if c in analysis_df.columns), None)
    pos_delta_col = next((c for c in ["positive_rate_delta", "sentiment_delta"] if c in analysis_df.columns), None)
    name_col = next((c for c in ["name", "game_name"] if c in analysis_df.columns), None)

    if response_col is None:
        print("[WARNING] 반응률 컬럼을 찾을 수 없습니다.")
        return []

    events = []
    for i, row in analysis_df.iterrows():
        app_id = int(row["app_id"]) if "app_id" in row else 0
        genre = genre_map.get(app_id, "Action")

        pos_delta = float(row[pos_delta_col]) if pos_delta_col and pos_delta_col in row else None
        if pos_delta is None and pos_before_col and pos_during_col:
            b = row.get(pos_before_col)
            d = row.get(pos_during_col)
            if b is not None and d is not None:
                pos_delta = float(d) - float(b)

        sentiment_group = None
        if pos_delta is not None:
            if pos_delta > 0.005:
                sentiment_group = "positive_rate_up"
            elif pos_delta < -0.005:
                sentiment_group = "positive_rate_down"
            else:
                sentiment_group = "positive_rate_flat"

        event = {
            "event_id": f"event_{i:05d}",
            "app_id": app_id,
            "game_name": str(row[name_col]) if name_col else f"Game {app_id}",
            "genre": genre,
            "is_season_sale": bool(row[season_col]) if season_col and season_col in row else False,
            "playtime_filter": "all",
            "discount_rate": float(row[discount_col]) if discount_col and discount_col in row else 0.0,
            "response_rate_all": float(row[response_col]),
            "retention_rate": float(row[retention_col]) if retention_col and retention_col in row else 0.0,
        }
        if pos_before_col and pos_before_col in row:
            event["positive_rate_before"] = float(row[pos_before_col])
        if pos_during_col and pos_during_col in row:
            event["positive_rate_during"] = float(row[pos_during_col])
        if pos_delta is not None:
            event["positive_rate_delta"] = round(pos_delta, 4)
        if sentiment_group:
            event["sentiment_group"] = sentiment_group

        events.append(event)

    return events


def build_simulator_rules():
    return [
        {
            "id": "discount_rate_high",
            "condition": "할인율 60% 이상",
            "message": "높은 할인율은 단기 반응을 높일 가능성이 있습니다.",
            "evidence": "Spearman ρ=0.18, p=0.004 (할인율 구간별 반응률 분석)",
            "chart": "chart13",
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
            "id": "action_satisfaction",
            "condition": "Action 장르",
            "message": "Action은 반응률이 높게 나타났지만, 긍정률 하락 경향도 함께 관찰되었습니다.",
            "evidence": "신뢰구간이 0을 포함하므로 확정 결론이 아니라 탐색적 경향입니다.",
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


def write_json(data, filename: str):
    path = OUTPUT_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[OK] {filename} 생성 완료 ({len(data) if isinstance(data, list) else 1}건)")


def main():
    print(f"데이터 폴더: {DATA_DIR}")
    print(f"출력 폴더: {OUTPUT_DIR}")
    print()

    check_required_files()

    print("CSV 파일 로딩 중...")
    analysis_df = load_csv("analysis_df.csv")
    metadata = load_csv("game_metadata.csv")
    genre_mapping = load_csv("genre_mapping_v2.csv")

    print()
    print("JSON 생성 중...")

    summary = build_summary(analysis_df)
    write_json(summary, "summary.json")

    games = build_games(metadata, genre_mapping)
    write_json(games, "games.json")

    game_reports = build_game_reports(analysis_df, genre_mapping)
    write_json(game_reports, "game_reports.json")

    events = build_dashboard_events(analysis_df, genre_mapping)
    write_json(events, "dashboard_events.json")

    simulator_rules = build_simulator_rules()
    write_json(simulator_rules, "simulator_rules.json")

    print()
    print("모든 JSON 파일 생성 완료!")
    print(f"위치: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
