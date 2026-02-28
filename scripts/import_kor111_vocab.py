#!/usr/bin/env python3
"""Import KOR111 vocabulary text into a structured JSON dataset."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path


UNIT_RE = re.compile(r"^Unit\s+(\d+)\s+-\s+(.+)$")
SECTION_RE = re.compile(r"^Section\s+(\d+)\s+-\s+(.+)$")

IGNORED_LINE_PREFIXES = {
    "KOR 111 Vocabulary and Expressions",
    "Separated by Unit",
}


@dataclass
class ParseState:
    unit: int | None = None
    unit_title: str | None = None
    section: str | None = None
    section_title: str | None = None
    category: str | None = None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import KOR111 vocabulary text")
    parser.add_argument(
        "--input",
        type=Path,
        required=True,
        help="Path to source KOR111 vocabulary text file",
    )
    parser.add_argument(
        "--output",
        type=Path,
        required=True,
        help="Path to JSON output file",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Fail on malformed entries or missing parse context",
    )
    return parser.parse_args()


def is_separator(line: str) -> bool:
    if not line:
        return False
    return all(ch == "=" for ch in line)


def split_pair(line: str) -> tuple[str, str] | None:
    parts = line.split(" - ", 1)
    if len(parts) != 2:
        return None
    korean, english = parts[0].strip(), parts[1].strip()
    if not korean or not english:
        return None
    return korean, english


def require_context(state: ParseState, line_no: int, strict: bool, errors: list[str]) -> bool:
    missing = []
    if state.unit is None:
        missing.append("unit")
    if not state.section:
        missing.append("section")
    if not state.category:
        missing.append("category")
    if not missing:
        return True
    msg = f"Line {line_no}: pair missing context ({', '.join(missing)})"
    errors.append(msg)
    if strict:
        return False
    return False


def parse_source(text: str, strict: bool) -> tuple[list[dict[str, object]], dict[int, int], int, list[str]]:
    state = ParseState()
    parsed_items: list[dict[str, object]] = []
    unit_counts: dict[int, int] = {}
    ignored_lines = 0
    errors: list[str] = []

    for line_no, raw_line in enumerate(text.splitlines(), start=1):
        line = raw_line.strip()
        if not line:
            ignored_lines += 1
            continue
        if line in IGNORED_LINE_PREFIXES or is_separator(line):
            ignored_lines += 1
            continue

        unit_match = UNIT_RE.match(line)
        if unit_match:
            state.unit = int(unit_match.group(1))
            state.unit_title = unit_match.group(2).strip()
            state.section = None
            state.section_title = None
            state.category = None
            unit_counts.setdefault(state.unit, 0)
            continue

        section_match = SECTION_RE.match(line)
        if section_match:
            state.section = f"Section {section_match.group(1)}"
            state.section_title = section_match.group(2).strip()
            state.category = None
            continue

        pair = split_pair(line)
        if pair:
            if not require_context(state, line_no, strict, errors):
                if strict:
                    break
                ignored_lines += 1
                continue

            unit = int(state.unit)  # guarded by context check
            ordinal = unit_counts[unit] + 1
            unit_counts[unit] = ordinal
            item_id = f"u{unit}-{ordinal:04d}"
            korean, english = pair
            parsed_items.append(
                {
                    "id": item_id,
                    "korean": korean,
                    "english": english,
                    "unit": unit,
                    "unitTitle": state.unit_title or "",
                    "section": state.section or "",
                    "sectionTitle": state.section_title or "",
                    "category": state.category or "",
                    "audioFile": f"{item_id}.mp3",
                }
            )
            continue

        # Non-empty non-pair lines are treated as category headers.
        state.category = line

    return parsed_items, unit_counts, ignored_lines, errors


def main() -> None:
    args = parse_args()
    input_path = args.input.resolve()
    output_path = args.output.resolve()

    if not input_path.exists():
        print(f"Input file not found: {input_path}", file=sys.stderr)
        sys.exit(2)

    source_text = input_path.read_text(encoding="utf-8")
    items, unit_counts, ignored_lines, errors = parse_source(source_text, strict=args.strict)

    if args.strict and errors:
        for error in errors:
            print(error, file=sys.stderr)
        sys.exit(1)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(items, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    total_items = len(items)
    print(f"Imported {total_items} items -> {output_path}")
    for unit in sorted(unit_counts):
        print(f"  Unit {unit}: {unit_counts[unit]}")
    print(f"Ignored lines: {ignored_lines}")
    print(f"Malformed/context errors: {len(errors)}")
    if errors and not args.strict:
        print("Warnings:")
        for error in errors:
            print(f"  {error}")


if __name__ == "__main__":
    main()
