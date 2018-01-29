assets: static/options.css

static/options.css: less/options.less less/*.less
	../../node_modules/.bin/lessc $< > $@
