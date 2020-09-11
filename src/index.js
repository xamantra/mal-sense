// ==UserScript==
// @name         MAL Sense
// @namespace    http://tampermonkey.net/
// @version      1.0.9
// @description  A MyAnimeList script for extending the website's functionality and features.
// @author       xamantra
// @match        https://myanimelist.net/*
// @updateURL    https://raw.githubusercontent.com/xamantra/mal-sense/master/src/index.js
// @downloadURL  https://raw.githubusercontent.com/xamantra/mal-sense/master/src/index.js
// @supportURL   https://github.com/xamantra/mal-sense/issues
// @require      https://raw.githubusercontent.com/xamantra/mal-sense/1.0.9/src/core.js
// @require      https://raw.githubusercontent.com/xamantra/mal-sense/1.0.9/src/http.js
// @require      https://raw.githubusercontent.com/xamantra/mal-sense/1.0.9/src/date.js
// @require      https://raw.githubusercontent.com/xamantra/mal-sense/1.0.9/src/bootstrapper.js
// @require      https://raw.githubusercontent.com/xamantra/mal-sense/1.0.9/src/modules/related-entries.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict'

  // eslint-disable-next-line no-undef
  startModuleRelatedEntries()
})()
