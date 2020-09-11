// eslint-disable-next-line no-unused-vars
class MalAnimeSorter {
  constructor(_type = 'anime') {
    this.entries = {}
    // eslint-disable-next-line no-undef
    this.http = new Http()
    this.scrapedEntries = []
    this.entryList = []
    this.markdown = false
    this.finished = false
    this.showOnlyWithWordsFilter = []
    this.skipEntriesWithWordsFilter = []
    this.sortBy = 'Release Dates'
    this.lastHttpRequestTimestamp = 0
    this.filterType = 'SKIP'
    this.durationDisplayType = 'FORMATTED'
    this.type = _type
  }

  init(callback, setShowOnlyWithWords, setSortBy, setSkipEntries, setFilterType, setDurationDisplayStyle) {
    const base = `://myanimelist.net/${this.type}/`
    const currentUrl = window.location.href
    if (currentUrl.includes(base)) {
      this.lastHttpRequestTimestamp = new Date().getTime()
      $(`<table style="margin-top: 8px;">
                <tbody>
                  <tr>
                    <td><button id="scan_and_sort_all_related_anime" type="button"
                        class="inputButton btn-middle flat js-anime-update-button">Search All Related Entries</button></td>
                    <td><small><a id="scan_related_entry_settings" style="cursor: pointer">Settings</a></small></td>
                  </tr>
                </tbody>
              </table>
              <table id="scanner_settings" style="display: none; height: 0px;">
                <tbody>
                  <tr>
                    <td><label>Sort entries by:</label></td>
                    <td>
                      <select name="scan_settings_sort_by" id="scan_settings_sort_by">
                        <option value="Release Dates">Release Dates</option>
                        <option value="Name">Entry Name</option>
                        <option value="Duration">Duration</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                  <td><label>Duration display type:</label></td>
                  <td>
                    <select name="duration_display_type" id="duration_display_type">
                      <option value="FORMATTED">Default</option>
                      <option value="CALCULATED">Total Duration</option>
                    </select>
                  </td>
                  </tr>
                  <tr>
                    <td><label>Show only entries with words:</label></td>
                    <td><textarea type="text" id="scan_settings_show_only_words" rows=1 cols=30></textarea></td>
                  </tr>
                  <tr>
                  <td>
                    <select name="search_filter_type" id="search_filter_type">
                      <option value="SKIP" selected>Filter Type: Skip with Words</option>
                      <option value="SEARCH_ONLY">Filter Type: Search only with Words</option>
                    </select>
                  </td>
                    <td><textarea type="text" id="search_filter_words" rows=1 cols=30></textarea></td>
                  </tr>
                </tbody>
                </table>`).insertAfter('.anime_detail_related_anime')
      setTimeout(() => {
        $('#scan_and_sort_all_related_anime').on('click', function () {
          callback(currentUrl)
          $('#scan_and_sort_all_related_anime').attr('disabled', '')
          $('#search_filter_words').attr('disabled', '')
          $('#search_filter_type').attr('disabled', '')
        })
        $('#scan_related_entry_settings').on('click', function () {
          const type = $('#scan_settings_show_only_words').attr('type')
          const toggleType = type === 'text' ? 'hidden' : 'text'
          if (toggleType === 'hidden') {
            $('#scanner_settings').attr('style', 'display: none; height: 0px;')
          } else {
            $('#scanner_settings').attr('style', '')
          }
          $('#scan_settings_show_only_words').attr('type', toggleType)
          $('#scan_settings_show_only_words').on('input', function () {
            setShowOnlyWithWords(this.value.split(','))
          })
          $('#scan_settings_sort_by').on('input', function () {
            setSortBy(this.value)
          })
          $('#search_filter_type').on('input', function () {
            setFilterType(this.value)
          })
          $('#search_filter_words').on('input', function () {
            setSkipEntries(this.value.split(','))
          })
          $('#duration_display_type').on('input', function () {
            setDurationDisplayStyle(this.value)
          })
        })
      }, 100)
    }
  }

  setShowOnlyWithWords(words = []) {
    this.showOnlyWithWordsFilter = words
    this.renderHtml()
  }

  setSortBy(sortBy = '') {
    this.sortBy = sortBy
    this.renderHtml()
  }

  setSkipEntries(skipEntries = []) {
    this.skipEntriesWithWordsFilter = skipEntries
    this.renderHtml()
  }

  setFilterType(filterType = 'SKIP') {
    this.filterType = filterType
    this.renderHtml()
  }

  setDurationDisplayStyle(durationDisplayType = 'FORMATTED') {
    this.durationDisplayType = durationDisplayType
    this.renderHtml()
  }

  async sortRelatedEntries(entry = '', childNodes = []) {
    const type = this.type
    if (!entry.includes(`/${type}/`)) {
      return
    }
    if (childNodes.length === 0) {
      const i = entry.indexOf(`://myanimelist.net/${type}/`) + 25
      const trimmed = entry.substring(i)
      const entryId = Number(trimmed.substring(0, trimmed.indexOf('/')))

      const html = await this.getHtml(entry)

      const relatedNodes = html.querySelectorAll('.anime_detail_related_anime > tbody > tr >td > a')
      const childIds = await this.processChild(relatedNodes, entryId)
      this.process(html, entryId)
      console.log(`Initial Recurse: "sortRelatedEntries(${entry}, ${childIds})"`)
      await this.sortRelatedEntries(`/${type}/`, childIds)
    } else {
      const entryId = childNodes[0]
      const html = await this.getHtml(`https://myanimelist.net/${type}/${entryId}`)
      const relatedNodes = html.querySelectorAll('.anime_detail_related_anime > tbody > tr >td > a')
      const childIds = await this.processChild(relatedNodes, entryId)
      this.process(html, entryId)
      console.log(`Recurse: "sortRelatedEntries(${entry}, ${childNodes})"`)
      let newIdList = childNodes
      for (let i = 0; i < childIds.length; i++) {
        const id = childIds[i]
        const existing = newIdList.find((x) => { return x === id })
        const scraped = this.scrapedEntries.find((x) => { return x === id })
        if (!scraped && !existing) {
          newIdList.push(id)
        }
      }
      newIdList = newIdList.slice(1)
      if (newIdList.length > 0) {
        await this.sortRelatedEntries(`https://myanimelist.net/${type}/${newIdList[0]}`, newIdList)
      } else {
        let output = ''
        const sortedList = this.entryList.sort((a, b) => {
          if (a.sort_key > b.sort_key) return 1
          if (a.sort_key < b.sort_key) return -1
          return 0
        })
        for (let i = 0; i < sortedList.length; i++) {
          const entry = sortedList[i]
          if (this.markdown) {
            output += `\`${entry.air_dates}\`, **${entry.entryTitle}**, ${entry.url}\n`
          } else {
            output += `${entry.air_dates}, ${entry.entryTitle}, ${entry.url}\n`
          }
        }
        console.log(output)
        this.finished = true
        this.renderHtml()
      }
    }
  }

  processChild(relatedNodes, _animeID) {
    return new Promise(async (resolve, reject) => {
      let childIds = []
      childIds = await this.processRecursive(relatedNodes, 0, [], _animeID)
      console.log(`Resolved: processChild => [${childIds}]`)
      const scraped = this.scrapedEntries.find((x) => { return x === _animeID })
      if (_animeID !== 0 && !scraped) {
        this.scrapedEntries.push(_animeID)
      }
      resolve(childIds)
    })
  }

  parseDate(from = '') {
    // eslint-disable-next-line no-undef
    return new DateFormat().from(from)
  }

  async processRecursive(relatedNodes = [], i = 0, ids = [], _animeID = 0) {
    const childIds = ids
    if (relatedNodes.length === 0) {
      return childIds
    }
    const type = this.type
    const node = relatedNodes[i]
    const shortUrl = node.getAttribute('href')
    if (shortUrl.includes(`/${type}/`)) {
      const trimmed = shortUrl.replace(`/${type}/`, '')
      const id = Number(trimmed.substring(0, trimmed.indexOf('/')))
      let skipped = true
      if (id && id !== 0 && !this.entries[id]) {
        const response = await this.http.get(`https://myanimelist.net/${type}/${id}`)
        var doc = document.createElement('html')
        const result = await response.text()
        doc.innerHTML = result
        let entryTitle = ''
        if (this.type === 'anime') {
          entryTitle = doc.querySelector('.title-name').textContent
        } else if (this.type === 'manga') {
          entryTitle = doc.querySelector('.h1-title > span').textContent
        }
        skipped = this.isSkipped(entryTitle)
        if (!skipped) {
          let entryEpisodes = ''
          let dates
          let entryDuration = ''
          let totalDuration = ''
          let chapters = ''
          let volumes = ''
          if (this.type === 'anime') {
            entryEpisodes = MalAnimeSorter.getInfoValue('Episodes', doc)
            entryDuration = this.formatDuration(MalAnimeSorter.getInfoValue('Duration', doc))
            totalDuration = this.getTotalEntryDuration(entryEpisodes, entryDuration)
            dates = MalAnimeSorter.getInfoValue('Aired', doc)
          } else if (this.type === 'manga') {
            chapters = Number(MalAnimeSorter.getInfoValue('Chapters', doc))
            volumes = Number(MalAnimeSorter.getInfoValue('Volumes', doc))
            entryDuration = `${chapters}ch./${volumes}vol.`
            if (isNaN(volumes)) {
              volumes = 9999999
            }
            if (isNaN(chapters)) {
              chapters = 0
            }
            entryDuration = entryDuration.replace('NaNch.', '')
            entryDuration = entryDuration.replace('NaNvol.', '')
            if (entryDuration === '/') {
              entryDuration = 'Unknown'
            }
            dates = MalAnimeSorter.getInfoValue('Published', doc)
          }
          const from = this.parseDate(dates.split(' to ')[0])
          const to = this.parseDate(dates.split(' to ')[1])
          let transformed = `${from} to ${to}`
          let sortKey = Date.parse(from)
          if (!dates.includes(' to ')) {
            const d = this.parseDate(dates)
            transformed = `${d} to ${d}`
          }
          if (transformed === '---------- to ----------') {
            sortKey = 4133865600000
          }
          if (id && id !== 0 && !this.entries[id]) {
            this.entries[id] = { air_dates: transformed, entryTitle, entryDuration, totalDuration, entryEpisodes, volumes, sort_key: sortKey, url: `https://myanimelist.net/${type}/${id}`, status: this.getStatusHtml(doc, id) }
            this.entryList.push(this.entries[id])
            this.renderHtml()
            console.log(`processChild: Entry added to list: ${id}`)
          }
        }
      }

      const scraped = this.scrapedEntries.find((x) => { return x === id })
      const existing = childIds.find((x) => { return x === _animeID })
      if (id !== 0 && !scraped && !existing && !skipped) {
        childIds.push(id)
      }
    }
    if (i === (relatedNodes.length - 1)) {
      return childIds
    } else {
      return this.processRecursive(relatedNodes, i + 1, childIds, _animeID)
    }
  }

  async wait() {
    const c = new Date().getTime()
    const t = (c - this.lastHttpRequestTimestamp).clamp(0, 1000)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, t)
    })
  }

  async getHtml(entry) {
    await this.wait()
    const response = await this.http.get(entry)
    this.lastHttpRequestTimestamp = new Date().getTime()
    var html = document.createElement('html')
    const result = await response.text()
    html.innerHTML = result
    return html
  }

  static getInfoValue(key = '', html) {
    const infos = html.querySelectorAll('#content > table > tbody > tr > td.borderClass > div > div')
    let infoValue = ''
    infos.forEach((x) => {
      if (x.textContent.trim().replace('\n', '').includes(`${key}:`)) {
        infoValue = x.textContent.replace(`${key}:`, '').trim()
      }
    })
    return infoValue
  }

  getStatusHtml(html, entryId) {
    let addElement
    if (this.type === 'anime') {
      addElement = html.querySelector('#showAddtolistAnime')
    } else if (this.type === 'manga') {
      addElement = html.querySelector('#showAddtolistManga')
    }
    if (addElement) {
      return ''
    }
    const e = html.querySelector('#myinfo_status')
    const statusValue = Number(e.options[e.selectedIndex].value)
    let statusStyle = ''
    let statusText = ''
    if (this.type === 'anime') {
      switch (statusValue) {
        case 1:
          statusStyle = 'watching'
          statusText = 'Watching'
          break
        case 2:
          statusStyle = 'completed'
          statusText = 'Completed'
          break
        case 3:
          statusStyle = 'on-hold'
          statusText = 'On-Hold'
          break
        case 4:
          statusStyle = 'dropped'
          statusText = 'Dropped'
          break
        case 6:
          statusStyle = 'plan-to-watch'
          statusText = 'Plan to Watch'
          break
        default:
          statusStyle = undefined
          statusText = undefined
          break
      }
    } else if (this.type === 'manga') {
      switch (statusValue) {
        case 1:
          statusStyle = 'reading'
          statusText = 'Reading'
          break
        case 2:
          statusStyle = 'completed'
          statusText = 'Completed'
          break
        case 3:
          statusStyle = 'on-hold'
          statusText = 'On-Hold'
          break
        case 4:
          statusStyle = 'dropped'
          statusText = 'Dropped'
          break
        case 6:
          statusStyle = 'plan-to-read'
          statusText = 'Plan to Read'
          break
        default:
          statusStyle = undefined
          statusText = undefined
          break
      }
    }
    if (!statusStyle && !statusText) {
      return ''
    }
    return `<a class="Lightbox_AddEdit button_edit ${statusStyle}" title="${statusText}" href="https://myanimelist.net/ownlist/${this.type}/${entryId}/edit?hideLayout=1">${statusText}</a>`
  }

  isSkipped(title = '') {
    if (this.skipEntriesWithWordsFilter.length === 0) {
      return false
    }
    const type = this.filterType
    let show = type === 'SKIP'
    const entryTitle = title.toLowerCase().trim()
    let matched = false
    for (let j = 0; j < this.skipEntriesWithWordsFilter.length; j++) {
      const word = this.skipEntriesWithWordsFilter[j].toLowerCase().trim()
      if (!matched) {
        matched = entryTitle.includes(word)
      }
      if (word.length > 0 && matched) {
        show = type !== 'SKIP'
      }
    }
    if (matched && type === 'SKIP') {
      console.log(`[Skipped] "${title}"`)
    }
    if (!matched && type === 'SEARCH_ONLY') {
      console.log(`[Skipped] "${title}"`)
    }
    return !show
  }

  process(html, entryId = 0) {
    let entryTitle = ''
    if (this.type === 'anime') {
      entryTitle = html.querySelector('.title-name').textContent
    } else if (this.type === 'manga') {
      entryTitle = html.querySelector('.h1-title > span').textContent
    }
    const skipped = this.isSkipped(entryTitle)
    if (skipped) {
      return
    }
    let entryEpisodes = ''
    let dates
    let entryDuration = ''
    let totalDuration = ''
    let chapters = ''
    let volumes = ''
    if (this.type === 'anime') {
      entryEpisodes = MalAnimeSorter.getInfoValue('Episodes', html)
      entryDuration = this.formatDuration(MalAnimeSorter.getInfoValue('Duration', html))
      totalDuration = this.getTotalEntryDuration(entryEpisodes, entryDuration)
      dates = MalAnimeSorter.getInfoValue('Aired', html)
    } else if (this.type === 'manga') {
      chapters = Number(MalAnimeSorter.getInfoValue('Chapters', html))
      volumes = Number(MalAnimeSorter.getInfoValue('Volumes', html))
      entryDuration = `${chapters}ch./${volumes}vol.`
      if (isNaN(volumes)) {
        volumes = 9999999
      }
      if (isNaN(chapters)) {
        chapters = 0
      }
      entryDuration = entryDuration.replace('NaNch.', '')
      entryDuration = entryDuration.replace('NaNvol.', '')
      if (entryDuration === '/') {
        entryDuration = 'Unknown'
      }
      dates = MalAnimeSorter.getInfoValue('Published', html)
    }
    if (entryId && entryId !== 0 && !this.entries[entryId]) {
      const from = this.parseDate(dates.split(' to ')[0])
      const to = this.parseDate(dates.split(' to ')[1])
      let transformed = `${from} to ${to}`
      let sortKey = Date.parse(from)
      if (!dates.includes(' to ')) {
        const d = this.parseDate(dates)
        transformed = `${d} to ${d}`
      }
      if (transformed === '---------- to ----------') {
        sortKey = 4133865600000
      }
      this.entries[entryId] = { air_dates: transformed, entryTitle, entryDuration, totalDuration, entryEpisodes, volumes, sort_key: sortKey, url: `https://myanimelist.net/${this.type}/${entryId}`, status: this.getStatusHtml(html, entryId) }
      this.entryList.push(this.entries[entryId])
      this.renderHtml()
      console.log(`process: Entry added to list: ${entryId}`)
    }
  }

  formatDuration(duration = '') {
    const d = duration.replace(' per ep.', '').replace(' hr.', 'h').replace(' min.', 'm').replace(' sec.', 's')
    return d
  }

  getTotalEntryDuration(eps, formattedDuration) {
    const duration = `${eps} x (${formattedDuration})`
    const s = duration.split('x')
    let episodes = 0
    let minutes = 0
    if (!s[0].toLowerCase().trim().includes('unknown')) {
      episodes = Number(s[0].toLowerCase().trim())
    }

    if (!s[1].toLowerCase().trim().includes('unknown')) {
      const time = s[1].trim().replace('(', '').replace(')', '').split(' ')
      if (time.length === 2) {
        minutes += Number(time[1].replace('m', ''))
        minutes += Number(time[0].replace('h', '')) * 60
      }
      if (time.length === 1) {
        if (time[0].includes('m')) {
          minutes += Number(time[0].replace('m', ''))
        }
        if (time[0].includes('s')) {
          minutes += Number(time[0].replace('s', '')) / 60
        }
      }
    }

    const result = ((episodes * minutes) / 60).toFixed(3)
    // console.log(`${episodes} x ${minutes} minutes = ${result} hours`)
    return Number(result)
  }

  renderHtml() {
    $('#scanned_related_anime').remove()
    let list = ''
    const sortedList = this.entryList.sort((a, b) => {
      if (this.type === 'anime') {
        if (this.sortBy === 'Name') {
          if (a.entryTitle < b.entryTitle) return -1
          if (a.entryTitle > b.entryTitle) return 1
          return 0
        } else if (this.sortBy === 'Release Dates') {
          if (a.sort_key > b.sort_key) return 1
          if (a.sort_key < b.sort_key) return -1
          return 0
        } else if (this.sortBy === 'Duration') {
          if (a.totalDuration > b.totalDuration) return 1
          if (a.totalDuration < b.totalDuration) return -1
          return 0
        }
      } else if (this.type === 'manga') {
        if (this.sortBy === 'Name') {
          if (a.entryTitle < b.entryTitle) return -1
          if (a.entryTitle > b.entryTitle) return 1
          return 0
        } else if (this.sortBy === 'Release Dates') {
          if (a.sort_key > b.sort_key) return 1
          if (a.sort_key < b.sort_key) return -1
          return 0
        } else if (this.sortBy === 'Duration') {
          if (a.volumes > b.volumes) return 1
          if (a.volumes < b.volumes) return -1
          return 0
        }
      }
    })
    let showedCount = 0
    let overallDuration = 0
    for (let i = 0; i < sortedList.length; i++) {
      const entry = sortedList[i]
      const entryTitle = entry.entryTitle
      let show = false
      if (this.showOnlyWithWordsFilter.length > 0) {
        for (let j = 0; j < this.showOnlyWithWordsFilter.length; j++) {
          const word = this.showOnlyWithWordsFilter[j].toLowerCase().trim()
          const title = entryTitle.toLowerCase()
          if (word.length > 0 && title.includes(word)) {
            show = true
            showedCount += 1
            overallDuration += entry.totalDuration
          } else if (word.length === 0) {
            show = true
            showedCount += 1
            overallDuration += entry.totalDuration
          }
        }
      } else {
        show = true
        showedCount += 1
        overallDuration += entry.totalDuration
      }
      if (show) {
        let duration = `(${entry.entryDuration})`
        let eps = ''
        if (this.type === 'anime') {
          if (this.durationDisplayType === 'CALCULATED') {
            duration = `${entry.totalDuration.toFixed(2)}h`
          } else {
            eps = `<strong>${entry.entryEpisodes}</strong> x `
          }
        } else if (this.type === 'manga') {
          duration = entry.entryDuration
        }
        list += `<tr class="table-row">
                    <td style="white-space: nowrap; overflow: hidden width:80px; text-overflow: ellipsis;"><em>${entry.air_dates}</em></td>
                    <td><strong><a style="white-space: nowrap; overflow: hidden width:80px; text-overflow: ellipsis;" href="${entry.url}" target="_blank">${entryTitle} </a></strong>${entry.status}</td>
                    <td style="white-space: nowrap; overflow: hidden width:80px; text-overflow: ellipsis;">${eps}<strong>${duration}</strong></td>
                  </tr>`
      }
    }
    let inProgress = ''
    let d = ''
    if (!this.finished) {
      inProgress = ' (Search in Progress)'
    } else {
      inProgress = ''
    }

    if (overallDuration > 0) {
      d = ` (${overallDuration.toFixed(2)} hours)`
    }
    let hiddenCount = sortedList.length - showedCount
    hiddenCount = hiddenCount < 0 ? 0 : hiddenCount
    const html = `<div id="scanned_related_anime" style="margin-top: 16px">
                  <table>
                    <tbody>
                      <tr>
                        <td><strong>Related Entries </strong><em> (Sorted by ${this.sortBy})</em></td>
                      </tr>
                    </tbody>
                  </table>
                  <hr>
                  <table>
                    <thead>
                      <tr>
                        <th>Release Date</th>
                        <th>Entry Name</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${list}
                    </tbody>
                  </table>
                  <hr>
                  <table>
                    <tbody>
                      <tr>
                        <td><strong>Total Entries: </strong><em> ${showedCount}${d}${inProgress}</em></td>
                      </tr>
                      <tr>
                        <td><strong>Hidden Entries: </strong><em> ${hiddenCount}${inProgress}</em></td>
                      </tr>
                    </tbody>
                  </table>
                </div>`
    $(html).insertAfter('.anime_detail_related_anime')
  }
}

function startModuleAnimeRelatedEntries() {
  // eslint-disable-next-line no-undef
  const sorter = new MalAnimeSorter('anime')
  sorter.init(function (url) {
    sorter.sortRelatedEntries(url)
  }, function (words = []) {
    sorter.setShowOnlyWithWords(words)
  }, function (sortBy = '') {
    sorter.setSortBy(sortBy)
  }, function (skipEntries = []) {
    sorter.setSkipEntries(skipEntries)
  }, function (filterType = '') {
    sorter.setFilterType(filterType)
  }, function (durationDisplayType = 'FORMATTED') {
    sorter.setDurationDisplayStyle(durationDisplayType)
  })
}

function startModuleMangaRelatedEntries() {
  // eslint-disable-next-line no-undef
  const sorter = new MalAnimeSorter('manga')
  sorter.init(function (url) {
    sorter.sortRelatedEntries(url)
  }, function (words = []) {
    sorter.setShowOnlyWithWords(words)
  }, function (sortBy = '') {
    sorter.setSortBy(sortBy)
  }, function (skipEntries = []) {
    sorter.setSkipEntries(skipEntries)
  }, function (filterType = '') {
    sorter.setFilterType(filterType)
  }, function (durationDisplayType = 'FORMATTED') {
    sorter.setDurationDisplayStyle(durationDisplayType)
  })
}

// eslint-disable-next-line no-unused-vars
function startModuleRelatedEntries() {
  // eslint-disable-next-line no-undef, no-new
  const anime = new Bootstrapper(['://myanimelist.net/anime/'], 'ModuleAnimeRelatedEntries')
  anime.start(function () {
    startModuleAnimeRelatedEntries()
  })

  // eslint-disable-next-line no-undef, no-new
  const manga = new Bootstrapper(['://myanimelist.net/manga/'], 'ModuleMangaRelatedEntries')
  manga.start(function () {
    startModuleMangaRelatedEntries()
  })
}
