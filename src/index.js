// ==UserScript==
// @name         MAL Sense
// @namespace    http://tampermonkey.net/
// @version      1.1.6
// @description  A MyAnimeList script for extending the website's functionality and features.
// @author       xamantra
// @match        https://myanimelist.net/*
// @updateURL    https://raw.githubusercontent.com/xamantra/mal-sense/master/src/index.js
// @downloadURL  https://raw.githubusercontent.com/xamantra/mal-sense/master/src/index.js
// @supportURL   https://github.com/xamantra/mal-sense/issues
// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @require      https://raw.githubusercontent.com/xamantra/mal-sense/1.1.6/src/core.js
// @require      https://raw.githubusercontent.com/xamantra/mal-sense/1.1.6/src/http.js
// @require      https://raw.githubusercontent.com/xamantra/mal-sense/1.1.6/src/date.js
// @require      https://raw.githubusercontent.com/xamantra/mal-sense/1.1.6/src/bootstrapper.js
// @require      https://raw.githubusercontent.com/xamantra/mal-sense/1.1.6/src/modules/related-entries.js
// @require      https://raw.githubusercontent.com/xamantra/mal-sense/1.1.6/src/modules/rating-sytem.anime.js
// @require      https://raw.githubusercontent.com/xamantra/mal-sense/1.1.6/src/modules/rating-sytem.manga.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict'

  // eslint-disable-next-line no-undef
  startModuleRelatedEntries()
  // eslint-disable-next-line no-undef
  startModuleAnimeRatingSystem()
  // eslint-disable-next-line no-undef
  startModuleMangaRatingAssistant()
})()
