import os
import sys
import unittest
from datetime import datetime, timezone
from unittest.mock import patch

import generate_content as content


NOW = datetime(2026, 7, 20, 12, 0, tzinfo=timezone.utc)


def item(url: str, *, uae: bool = False) -> content.FeedItem:
    return content.FeedItem(
        publisher="Test publisher",
        feed_category="defense",
        title="Defensive security update",
        url=url,
        published=NOW,
        summary="A source-grounded defensive summary.",
        uae_relevant=uae,
    )


def article(source_urls: list[str]) -> dict:
    return {
        "publish": True,
        "title": "A defensible security briefing",
        "subtitle": "What defenders need to know",
        "description": "A concise, source-grounded security briefing.",
        "category": "defense",
        "tags": ["defense", "risk", "operations"],
        "key_points": ["One", "Two", "Three"],
        "source_urls": source_urls,
        "importance": "notable",
        "body_markdown": " ".join(["defensive"] * 550),
    }


class ContentAutomationTests(unittest.TestCase):
    def test_prompt_record_marks_uae_relevance(self) -> None:
        self.assertTrue(item("https://example.com/uae", uae=True).as_prompt_record()["uae_relevant"])

    def test_published_run_marks_only_cited_candidates_seen(self) -> None:
        first = item("https://example.com/first", uae=True)
        second = item("https://example.com/second", uae=True)
        state = {"seen_urls": [], "last_successful_run": None}
        saved: list[dict] = []

        with (
            patch.object(content, "load_state", return_value=state),
            patch.object(content, "collect_items", return_value=([first, second], [])),
            patch.object(content, "generate_article", return_value=article([first.url])),
            patch.object(content, "write_post"),
            patch.object(content, "save_state", side_effect=lambda value: saved.append(value.copy())),
            patch.dict(os.environ, {"OPENAI_API_KEY": "test"}),
            patch.object(sys, "argv", ["generate_content.py"]),
            patch("builtins.print"),
        ):
            self.assertEqual(content.main(), 0)

        self.assertEqual(saved[0]["seen_urls"], [first.url])
        self.assertNotIn(second.url, saved[0]["seen_urls"])

    def test_uae_candidates_are_processed_before_global_candidates(self) -> None:
        global_item = item("https://example.com/global")
        uae_item = item("https://example.com/uae", uae=True)

        with (
            patch.object(content, "load_state", return_value={"seen_urls": [], "last_successful_run": None}),
            patch.object(content, "collect_items", return_value=([global_item, uae_item], [])),
            patch.object(sys, "argv", ["generate_content.py", "--dry-run"]),
            patch("builtins.print") as output,
        ):
            self.assertEqual(content.main(), 0)

        rendered = output.call_args.args[0]
        self.assertIn(uae_item.url, rendered)
        self.assertNotIn(global_item.url, rendered)

    def test_article_rejects_unknown_source_url(self) -> None:
        with self.assertRaisesRegex(ValueError, "outside the supplied records"):
            content.validate_article(
                article(["https://untrusted.example/story"]),
                {"https://example.com/allowed"},
            )

    def test_url_validation_rejects_unsafe_targets(self) -> None:
        self.assertTrue(content.valid_public_url("https://www.cisa.gov/news"))
        self.assertFalse(content.valid_public_url("http://example.com/insecure"))
        self.assertFalse(content.valid_public_url("https://localhost/internal"))
        self.assertFalse(content.valid_public_url("https://127.0.0.1/internal"))
        self.assertFalse(content.valid_public_url('https://example.com/\" onclick=\"alert(1)'))


if __name__ == "__main__":
    unittest.main()
