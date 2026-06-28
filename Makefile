.PHONY: all plan refresh-plan open-plan evidence clean

PLAN_URL := file://$(CURDIR)/site/plan.html

all: plan

plan: site/plan.html

site/plan.html: docs/05-execution-plan.md docs/06-lab-notebook.md scripts/render_plan_page.mjs
	@mkdir -p site
	node scripts/render_plan_page.mjs

refresh-plan: site/plan.html
	osascript scripts/open_or_refresh_plan.applescript "$(PLAN_URL)"

open-plan: refresh-plan

evidence:
	node scripts/capture_evidence.mjs

clean:
	rm -rf site
