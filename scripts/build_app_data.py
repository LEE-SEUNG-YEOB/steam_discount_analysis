"""
scripts/build_app_data.py
--------------------------
원본 CSV → 웹앱용 JSON 변환 스크립트.
프로젝트 루트에서 실행하세요: python scripts/build_app_data.py

출력: web/public/data/dashboard_events.json
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data"
OUTPUT_DIR = ROOT / "web" / "public" / "data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# ─── 유틸 ───────────────────────────────────────────────────────────────────

def load_csv(filename: str):
    try:
        import pandas as pd
    except ImportError:
        print("[ERROR] pandas가 없습니다. pip install pandas 실행 후 재시도하세요.")
        sys.exit(1)

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
    import pandas as pd

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


# ─── main ───────────────────────────────────────────────────────────────────

def main():
    print(f"데이터 폴더: {DATA_DIR}")
    print(f"출력 폴더:   {OUTPUT_DIR}")

    events = build_dashboard_events()
    if events:
        write_json(events, "dashboard_events.json")

    print("\n완료!")
    print("다음 단계: npm run dev (web/ 폴더에서)")


if __name__ == "__main__":
    main()
