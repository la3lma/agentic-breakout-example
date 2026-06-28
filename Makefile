.PHONY: all site plan refresh-plan open-plan evidence clean

PLAN_URL := file://$(CURDIR)/site/plan.html
BRANCH := $(shell git branch --show-current)

all: site

site:
	node scripts/render_plan_page.mjs

plan: site

refresh-plan: site
	osascript scripts/open_or_refresh_plan.applescript "$(PLAN_URL)"

open-plan: refresh-plan

evidence:
	node scripts/capture_evidence.mjs

publish: site
	@if [ "$(BRANCH)" != "main" ]; then \
		echo "make publish must be run from main after the documentation-site PR is merged."; \
		exit 1; \
	fi
	@if ! git diff --quiet -- site; then \
		git add site && git commit -m "Build documentation site"; \
	fi
	git push origin main
	gh workflow run pages.yml --ref main

clean:
	rm -rf site
