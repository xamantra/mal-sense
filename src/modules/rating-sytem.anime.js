// eslint-disable-next-line no-unused-vars
class AnimeRatingSystem {
  static getOwnUsername() {
    const base = '://myanimelist.net/profile/'
    const tabUrl = window.location.href
    const key = 'malextsa_username'
    if (tabUrl.includes(base)) {
      const username = $('#header-menu > div.header-menu-unit.header-profile.js-header-menu-unit.link-bg.pl8.pr8 > a').text()
      if (username) {
        localStorage.setItem(key, username)
      } else {
        return localStorage.getItem(key)
      }
      return username
    }
    return localStorage.getItem(key)
  }

  static fieldIdPrefix() {
    return `malextsa_${AnimeRatingSystem.getOwnUsername()}_field_`
  }

  static fieldIdAddScorePrefix() {
    return `malextsa_${AnimeRatingSystem.getOwnUsername()}_add_anime_score_`
  }

  static overallScoreLabel() {
    return 'malextsa_overall_score_label'
  }

  static fieldSettingsListKey() {
    return `malextsa_${AnimeRatingSystem.getOwnUsername()}_field_settings_list_key`
  }

  static async sleep(timeout = 1000) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, timeout)
    })
  }

  static calculate(scores = [], appendElement = true) {
    var scoresParsed = scores.map(function (d) {
      if (d.includes('undefined')) {
        return 0
      }
      return Number(d.split(': ')[1])
    })
    var sum = 0
    var count = 0
    for (let i = 0; i < scoresParsed.length; i++) {
      const scoreItem = scoresParsed[i]
      if (scoreItem && scoreItem > 0) {
        sum += scoreItem
        count++
      }
    }
    var average = (sum / count).toFixed(2)
    console.log(`(${sum} / ${count}).toFixed(2)`)
    if (isNaN(average)) {
      if (appendElement) {
        $(`#${AnimeRatingSystem.overallScoreLabel()}`).text('Overall')
      }
    } else {
      if (appendElement) {
        $(`#${AnimeRatingSystem.overallScoreLabel()}`).text(`Overall (${average})`)
      }
    }
    return average
  }

  static getDefaultFields() {
    var ratingSystemFields = ['Story', 'Art', 'Sound', 'Characters', 'Enjoyment']
    return ratingSystemFields
  }

  static initializeFieldSettingsData() {
    const base = '://myanimelist.net/animelist/'
    const tabUrl = window.location.href
    if (tabUrl.includes(base)) {
      return undefined
    }
    var ratingSystemFields = AnimeRatingSystem.getDefaultFields()
    var existingData = localStorage.getItem(AnimeRatingSystem.fieldSettingsListKey())
    if (existingData) {
      ratingSystemFields = JSON.parse(existingData)
    } else {
      localStorage.setItem(AnimeRatingSystem.fieldSettingsListKey(), JSON.stringify(ratingSystemFields))
    }
    return ratingSystemFields
  }

  static getRatingCategoryEditValues() {
    const result = ['']
    result.pop()
    $('.anime_rating_category_name').each(function () {
      result.push($(this).text())
    })
    return result
  }

  static saveRatingFields(data = []) {
    localStorage.setItem(AnimeRatingSystem.fieldSettingsListKey(), JSON.stringify(data))
  }

  static generateHTMLForRatingFields(data = []) {
    var html = ''
    for (let i = 0; i < data.length; i++) {
      var id = `${AnimeRatingSystem.fieldIdPrefix()}${data[i]}`
      html += `<li class="draggable_list">
                      <span class="float_right">
                          <a class="lightLink" id="${id}"><small>Remove</small></a>
                      </span>
                      <em class="anime_rating_category_name">${data[i]}</em>
                  </li>`
    }
    return html
  }

  static insertRatingSystemSettings(initialData) {
    var unsecure = 'http://myanimelist.net/editprofile.php?go=listpreferences'
    var secure = 'https://myanimelist.net/editprofile.php?go=listpreferences'
    if (window.location.href === unsecure || window.location.href === secure) {
      console.log('Inserting Rating System Settings into view.')
      var settingsData = initialData
      if (!settingsData) {
        settingsData = AnimeRatingSystem.initializeFieldSettingsData()
      }
      var settingsHtml = AnimeRatingSystem.generateHTMLForRatingFields(settingsData)
      $('#rating_system_settings').remove()
      var html = `<tr id="rating_system_settings">
      <td valign="top">Rating System</td>
      <td>
          <table width="300px">
              <tbody>
                  <tr>
                      <td><b>Categories</b></td>
                  </tr>
                  <tr>
                      <td>
                      <ul id="anime_rating_category_list" class="draggable_list ui-sortable">
                          ${settingsHtml}
                      </ul>
                          <button style="margin-top: 16px" id="mal_score_assist_add_new_field_button"
                              name="mal_score_assist_add_new_field_button" type="button">Add New</button>
                              <button style="margin-top: 16px" id="mal_score_assist_save_field_button"
                              name="mal_score_assist_save_field_button" type="button">Save</button>
                              <button style="margin-top: 16px" id="mal_score_assist_reset_field_button"
                              name="mal_score_assist_reset_field_button" type="button">Set Defaults</button>
                      </td>
                  </tr>
              </tbody>
          </table>
      </td>
  </tr>`
      $(html).insertAfter('#content > div:nth-child(2) > form > table > tbody > tr:nth-child(9)')
      $(function () {
        $('#anime_rating_category_list').sortable()
        $('#anime_rating_category_list').disableSelection()
      })
      for (let i = 0; i < settingsData.length; i++) {
        const name = settingsData[i]
        const id = `${AnimeRatingSystem.fieldIdPrefix()}${name}`
        $(`#${id}`).on('click', function () {
          $(this).parent().parent().remove()
        })
      }
      $('#mal_score_assist_add_new_field_button').on('click', function () {
        var name = prompt('Rating Field Name')
        if (name) {
          settingsData = AnimeRatingSystem.initializeFieldSettingsData()
          var check = settingsData.map(function (n) { return n.toLowerCase() })
          if (check.includes(name)) {
            alert(`The rating category item "${name}" already exists.`)
            return
          }
          name = name.replace(/[^a-zA-Z0-9]/g, '_')
          var id = `${AnimeRatingSystem.fieldIdPrefix()}${name}`
          const newCategoryHtml = `<li class="draggable_list">
                                              <span class="float_right">
                                                  <a class="lightLink" id="${id}"><small>Remove</small></a>
                                              </span>
                                              <em class="anime_rating_category_name">${name}</em>
                                          </li>`
          $('#anime_rating_category_list').append(newCategoryHtml)
          $(`#${id}`).on('click', function () {
            $(this).parent().parent().remove()
          })
        }
      })
      $('#mal_score_assist_reset_field_button').on('click', function () {
        settingsData = AnimeRatingSystem.getDefaultFields()
        AnimeRatingSystem.insertRatingSystemSettings(settingsData)
      })
      $('#mal_score_assist_save_field_button').on('click', function () {
        const newCategories = AnimeRatingSystem.getRatingCategoryEditValues()
        AnimeRatingSystem.saveRatingFields(newCategories)
      })
    }
  }

  static inputRatings(ratings = '', overall = '') {
    let tags = ''
    tags = $('#add_anime_tags').val()
    if (tags.includes('Score: ')) {
      const s = tags.split(',')
      tags = s.slice(1, s.length).join(',').trim()
    }
    if (overall !== '0' && overall !== 'NaN') {
      const newTags = [`Score: ${overall}`, tags].join(',')
      $('#add_anime_tags').val(newTags)
    }

    let comments = ''
    comments = $('#add_anime_comments').val()
    if (comments.includes('<scores>')) {
      const index = comments.lastIndexOf('</scores>') + 10
      comments = comments.substring(index, comments.length).trim()
    }
    const newComments = [`-\n${ratings}`, comments].join('\n')
    $('#add_anime_comments').val(newComments)
  }

  static getFieldsScore() {
    let comments = ''
    const fields = this.initializeFieldSettingsData()
    comments = $('#add_anime_comments').val()
    const start = comments.indexOf('<scores>') + 9
    const end = comments.indexOf('</scores>')
    const rawScores = comments.substring(start, end)
    const parsed = rawScores.split('\n').map((s) => { return s.replace('\n', '').trim() })
    const filtered = []
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i].toLowerCase()
      const r = parsed.findIndex((x) => {
        const y = x.split(':')[0].trim().toLowerCase()
        return y === f
      })
      if (r > -1) {
        filtered.push(parsed[r])
      }
    }
    // for (let i = 0; i < parsed.length; i++) {
    //   const score = parsed[i]
    //   if (score && score.replace('\n', '').trim() !== '') {
    //     const f = score.split(':')[0].trim()
    //     if (fields.includes(f)) {
    //       filtered.push(score)
    //     }
    //   }
    // }
    console.log(filtered)
    return filtered
  }

  static cleanInputs() {
    const currentTags = $('#add_anime_tags').val()
    const currentComments = $('#add_anime_comments').val()

    if (currentTags.includes('Score: ')) {
      const removeTag = currentTags.substr(0, 12)
      $('#add_anime_tags').val(currentTags.replace(removeTag, '').trim())
    }

    const index = currentComments.lastIndexOf('</scores>') + 10
    if (index > -1) {
      const removeComment = currentComments.substring(0, index)
      $('#add_anime_comments').val(currentComments.replace(removeComment, '').trim())
    }
  }

  static getFieldRating(data = [''], field = '') {
    const selected = data.find((d) => {
      return d.split(': ')[0] === field
    })
    if (selected) {
      return selected
    }
    return undefined
  }

  static formatRating(ratings = ['']) {
    const ratingsFormatted = ['']
    ratingsFormatted.pop()
    for (let i = 0; i < ratings.length; i++) {
      const rating = ratings[i]
      const defined = !rating.includes('undefined')
      const notNull = !rating.includes('null')
      if (defined && notNull) {
        const r = rating.replace('\n', '').trim()
        const s = r.split(': ')[1]
        if (r.length > 0 && s !== '0') {
          ratingsFormatted.push(rating.replace('\n', '').trim())
        }
      }
    }
    return ratingsFormatted
  }

  static async insertScoreAssist() {
    var unsecure = window.location.href.indexOf('http://myanimelist.net/ownlist/anime')
    var secure = window.location.href.indexOf('https://myanimelist.net/ownlist/anime')
    if (unsecure === 0 || secure === 0) {
      var total = 0
      var ratings = AnimeRatingSystem.getFieldsScore()
      var ratingsFormatted = []

      console.log('Inserting Score Assist into view.')
      $('#main-form > table:nth-child(1) > tbody > tr:nth-child(4) > td:nth-child(1)').text('Overall')
      $('#main-form > table:nth-child(1) > tbody > tr:nth-child(4) > td:nth-child(1)').attr('id', AnimeRatingSystem.overallScoreLabel())

      $('#top-submit-buttons > input').on('click', async function () {
        for (let i = 0; i < ratings.length; i++) {
          const rating = ratings[i]
          ratingsFormatted.push(rating)
        }

        ratingsFormatted = AnimeRatingSystem.formatRating(ratings)
        if (ratingsFormatted.length > 0) {
          total = AnimeRatingSystem.calculate(ratings)
          AnimeRatingSystem.inputRatings(`<scores>\n${ratingsFormatted.join('\n')}\n</scores>`, total.toString())
          await AnimeRatingSystem.sleep(200)
        }
        $('#main-form').submit()
      })

      $('#dialog > tbody > tr > td > div.mt8.mb8 > input').on('click', async function () {
        for (let i = 0; i < ratings.length; i++) {
          const rating = ratings[i]
          ratingsFormatted.push(rating)
        }

        ratingsFormatted = AnimeRatingSystem.formatRating(ratings)
        if (ratingsFormatted.length > 0) {
          total = AnimeRatingSystem.calculate(ratings)
          AnimeRatingSystem.inputRatings(`<scores>\n${ratingsFormatted.join('\n')}\n</scores>`, total.toString())
          await AnimeRatingSystem.sleep(200)
        }
        $('#main-form').submit()
      })

      var fields = AnimeRatingSystem.initializeFieldSettingsData()
      var html = ''
      const data = AnimeRatingSystem.getFieldsScore()
      console.log(data)
      if (data) {
        AnimeRatingSystem.calculate(data)
      }
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i]
        const id = `${AnimeRatingSystem.fieldIdAddScorePrefix()}${field}`
        var selectedRating
        if (data) {
          const selected = data.find((d) => {
            return d.split(': ')[0] === field
          })
          if (selected) {
            selectedRating = selected.split(': ')[1]
            console.log(`Rating for "${field}" found: ${selectedRating}`)
          } else {
            selectedRating = undefined
          }
        }
        var element = `<tr><td class="borderClass">${field}</td>
          <td class="borderClass">
              <select id="${id}" class="inputtext">
                  <option value="">Select score</option>
                  <option value="10"${selectedRating === '10' ? ' selected="selected"' : ''}>10</option>
                  <option value="9"${selectedRating === '9' ? ' selected="selected"' : ''}>9</option>
                  <option value="8"${selectedRating === '8' ? ' selected="selected"' : ''}>8</option>
                  <option value="7"${selectedRating === '7' ? ' selected="selected"' : ''}>7</option>
                  <option value="6"${selectedRating === '6' ? ' selected="selected"' : ''}>6</option>
                  <option value="5"${selectedRating === '5' ? ' selected="selected"' : ''}>5</option>
                  <option value="4"${selectedRating === '4' ? ' selected="selected"' : ''}>4</option>
                  <option value="3"${selectedRating === '3' ? ' selected="selected"' : ''}>3</option>
                  <option value="2"${selectedRating === '2' ? ' selected="selected"' : ''}>2</option>
                  <option value="1"${selectedRating === '1' ? ' selected="selected"' : ''}>1</option>
              </select>
          </td></tr>`
        console.log(element)
        html += element
      }

      $(html).insertAfter('#main-form > table:nth-child(1) > tbody > tr:nth-child(3)')

      for (let i = 0; i < fields.length; i++) {
        const field = fields[i]
        const existing = ratings.findIndex((e) => {
          return e.includes(`${field}:`)
        })
        var r = AnimeRatingSystem.getFieldRating(data, field)
        if (r) {
          if (existing >= 0) {
            ratings[existing] = r
          } else {
            ratings.push(r)
          }
        }
        const id = `${AnimeRatingSystem.fieldIdAddScorePrefix()}${field}`
        $(`#${id}`).change(function () {
          var rate
          if (this.value) {
            rate = this.value
          } else {
            rate = '0'
          }
          console.log(`${field} Score: "${rate}"`)
          ratings[i] = `${field}: ${rate}`
          total = AnimeRatingSystem.calculate(ratings)
          console.log(`Overall: "${total}"`)
          $('#add_anime_score').val(`${Math.round(total)}`)
        })
      }
      $('#add_anime_score').on('change', function () {
        for (let i = 0; i < fields.length; i++) {
          var rate
          if (this.value) {
            rate = this.value
          } else {
            rate = '0'
          }
          const field = fields[i]
          const id = `${AnimeRatingSystem.fieldIdAddScorePrefix()}${field}`
          ratings[i] = `${field}: ${rate}`
          total = AnimeRatingSystem.calculate(ratings)
          $(`#${id}`).val(`${rate}`)
        }
        console.log(`Edit Overall: "${rate}"`)
      })

      console.log(ratings)
      this.cleanInputs()
    }
  }
}

// eslint-disable-next-line no-unused-vars
async function startModuleAnimeRatingSystem() {
  // await AnimeRatingSystem.sleep(2000);
  AnimeRatingSystem.initializeFieldSettingsData()
  AnimeRatingSystem.insertScoreAssist()
  AnimeRatingSystem.insertRatingSystemSettings()
}
