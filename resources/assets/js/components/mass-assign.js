import InstoreX from './custom-functions'

/**
 * @typedef {{
 *   Id: number,
 *   Name: string,
 *   Content: Array
 * }} playlist
 */

/**
 * @param {{
 *   type: string,
 *   id: number,
 *   playlists: Array<string>,
 *   text: string
 * }} selectedFile
 * @param {Function} onFinishCallback
 */
function massAssign (selectedFile, onFinishCallback) {
  const dateFormat = 'YYYY-MM-DD HH:mm'
  const file = selectedFile

  let $startDate
  let $endDate
  let $duration
  let $playlistsList
  let $playlistSearch
  let $playlistSelectAll
  let $playlistRemoveAll
  let $errorContainer
  let postData = {}

  let dialogIsBlocked = false

  let playlists

  const $dialog = InstoreX.dialogs.custom(
    bootbox.confirm({
      title: 'PLANLÆG CONTENT',
      message: 'Vent venligst imens vi henter spillelisterne...',
      closeButton: false,
      buttons: {
        cancel: {
          label: "FORTRYD"
        },
        confirm: {
          label: "GEM",
          className: 'btn-warning'
        }
      },
      size: 'large',
      onEscape: false,
      callback: function (result) {
        if (dialogIsBlocked) {
          return false
        }
        if (!result) {
          return true
        }
        gatherData() && validate() && save()
        return false
      }
    }),
    {
      type: 'primary',
      init: () => {
        blockDialog(true, 'Loading')
      }
    })

  axios
    .get(URI('/playlists').addQuery('type', file.type === 'Audio' ? 'Audio' : 'ImageVideo').toString())
    .then(result => {
      playlists = result.data.playlists
      render(playlists)
    })
    .catch(() => {
      InstoreX.dialogs.error({
        message: [
          'An error occured while trying to fetch the playlists. Please try again.',
          'If the problem persists, please contact InstoreX support.'
        ]
      })
    })

  function getPlaylistById (id) {
    return _
      .chain(playlists)
      .filter(playlist => {
        return playlist.Id === id
      })
      .head()
      .value()
  }

  function blockDialog (block, saveBtnText) {
    dialogIsBlocked = block
    InstoreX.getCurrentModal('confirm', $dialog)
      .prop('disabled', block)
      .html(block ? '<span class="fa fa-spinner spinner"></span> ' + saveBtnText + '...' : 'GEM')
    InstoreX.getCurrentModal('cancel', $dialog).prop('disabled', block)
  }

  function gatherData () {
    postData = {
      playlist_ids: _.map($dialog.find('.modal-body input:checked:not(:disabled)'), element => {
        return _.toNumber($(element).val())
      }),
      content_id: file.id,
      file_name: file.text,
      duration: $duration.length > 0 ? _.toNumber($duration.val()) : null,
      start_date: $startDate.find('input').val(),
      end_date: $endDate.find('input').val()
    }
    return true
  }

  function showError (error, help) {
    $errorContainer.show().find('ul').append(
      '<li>' +
      error +
      (help !== undefined ? '<br/><span class="small">' + help + '</span>' : '') +
      '</li>'
    )
  }

  function validate () {
    $errorContainer.hide().find('ul').empty()
    let valid = true
    if (postData.playlist_ids.length === 0) {
      showError('Ingen spilleliste valgt', 'Vælg venligst mindst en spilleliste, filen skal tilknyttes til.')
      valid = false
    }
    if (postData.duration !== null && (postData.duration < 1 || postData.duration > 120)) {
      showError('Forkert varighed', 'Vælg venligst en varighed mellem 1 og 120.')
      valid = false
    }
    if (InstoreX.XOR(postData.start_date === '', postData.end_date === '')) {
      showError('Forkert dato', 'Vælg venligst en dato i begge, eller ingen af felterne. Ikke kun i en af dem.')
      valid = false
    }
    return valid
  }

  /**
   *
   */
  function save () {
    blockDialog(true, 'Saving')
    axios
      .post('/playlists/mass_add', postData)
      .then(result => {
        onSaveFinished(result.data.status)
      })
      .catch(error => {
        if (_.has(error, 'response.data.error')) {
          showError(_.get(error, 'response.data.error'))
        } else {
          showError('An unknown error happened', 'We recommend, that you reload the page to ensure data integrity.')
        }
        blockDialog(false)
      })
    return true
  }

  /**
   *
   * @param {Object.<number, boolean|string>} playlists
   */
  function onSaveFinished (playlists) {
    let hasErrors = false
    _.forEach(playlists, (status, key) => {
      const error = status !== true
      if (error) {
        hasErrors = true
        showError('The playlist "' + getPlaylistById(_.toNumber(key)).Name + '" wasn\'t saved: ' + status)
      } else {
        const $li = $playlistsList.find('[data-playlist-id=' + key + ']')
        $li.find('.form-check').addClass('disabled')
        $li.find('input').prop('disabled', true).prop('checked', true)
      }
    })
    onFinishCallback()
    if (hasErrors) {
      blockDialog(false)
      return
    }
    $dialog.modal('hide')
  }

  const selectRemoveAll = (select) => {
    $playlistsList.find('li input:not(:disabled)').each((key, input) => {
      $(input).prop('checked', select)
    })
  }

  const renderPlaylistsList = ($container, playlists) => {
    $container.empty().append(
      _.chain(playlists).sortBy('Name').map((playlist) => {
        const alreadyAdded = _.has(file.playlists, playlist.Id)

        return '<li data-playlist-id="' + playlist.Id + '">' +
          '<div class="form-check' + (alreadyAdded ? ' disabled' : '') + '">' +
          '<label class="form-check-label">' +
          '<input class="" type="checkbox" name="playlist[]" value="' + playlist.Id + '" ' +
          (alreadyAdded ? ' checked disabled' : '') + '/> ' +
          playlist.Name +
          '</label>' +
          '</div>' +
          '</li>'
      }).join('').value()
    )
  }

  function render (playlists) {
    const showDuration = file.type === 'Image'
    $dialog.find('.modal-body').empty().append($(
      '<div class="row">' +
      '<div class="col-12" style="display: none;" id="errorList"><div class="alert alert-danger">' +
      '<h6>The following errors occured</h6>' +
      '<ul class="pl-3"></ul>' +
      '</div></div>' +
      '<div class="col-6">' +
      '<div class="card" style="max-height: calc(100vh - 15rem); overflow-y: auto;">' +
      '<div class="card-body">' +
      '<h5 class="card-title">Spillelister</h5>' +
      '<div class="form-group"><div class="input-group">' +
      '<span class="input-group-addon" id="playlist-search"><span class="fa fa-search"></span></span>' +
      '<input id="playlistSearch" type="text" class="form-control" placeholder="Søg efter spilleliste navn" aria-label="Playlist search" aria-describedby="playlist-search">' +
      '</div></div>' +
      '<p>Vælg spillelisterne du vil tilføje filen til.</p>' +
      '<div class="btn-group mb-3" role="group" aria-label"Select or remove all playlists">' +
      '<button data-action="select-all" class="btn btn-default">VÆLG ALLE</button>' +
      '<button data-action="remove-all" class="btn btn-default">SLET ALLE</button>' +
      '</div>' +
      '<ul class="list-unstyled" id="playlistsList"></ul>' +
      '</div></div>' +
      '</div>' +
      '<div class="col-6">' +
      '<div class="card">' +
      '<div class="card-body">' +
      '<h5 class="card-title">Fil information</h5>' +
      (
        showDuration ? '<div class="form-group">' +
          '<label for="duration">Varighed i sekunder</label>' +
          '<input type="number" value="15" name="duration" class="form-control text-right" min="1" max="120">' +
          '</div>' : ''
      ) +
      '<div class="form-group">' +
      '<label>Start dato</label>' +
      '<div class="input-group date" id="validityStartDate" data-target-input="nearest">' +
      '<span class="input-group-addon" data-target="#validityStartDate" data-toggle="datetimepicker"><span class="fa fa-calendar"></span></span>' +
      '<input type="text" class="form-control datetimepicker-input text-center" data-target="#validityStartDate" value=""/>' +
      '</div></div>' +
      '<div class="form-group">' +
      '<label>Slut dato</label>' +
      '<div class="input-group date" id="validityEndDate" data-target-input="nearest">' +
      '<span class="input-group-addon" data-target="#validityEndDate" data-toggle="datetimepicker"><span class="fa fa-calendar"></span></span>' +
      '<input type="text" class="form-control datetimepicker-input text-center" data-target="#validityEndDate" value=""/>' +
      '</div></div>' +
      '</div></div>' +
      '</div>' +
      '</div>'
    ))

    $duration = $dialog.find('.modal-body').find('[name=duration]')
    $startDate = $dialog.find('.modal-body').find('#validityStartDate')
    $endDate = $dialog.find('.modal-body').find('#validityEndDate')
    $playlistsList = $dialog.find('.modal-body').find('#playlistsList')
    $playlistSearch = $dialog.find('.modal-body').find('#playlistSearch')
    $playlistSelectAll = $dialog.find('.modal-body').find('[data-action="select-all"]')
    $playlistRemoveAll = $dialog.find('.modal-body').find('[data-action="remove-all"]')
    $errorContainer = $dialog.find('.modal-body').find('#errorList')

    $playlistSearch.keyup(() => {
      renderPlaylistsList($playlistsList, InstoreX.search(playlists, (playlist, search) => {
        return _.includes(playlist.Name.toLowerCase(), search)
      }, $playlistSearch.val()))
    })

    $playlistSelectAll.click(() => {
      $playlistSelectAll.blur()
      selectRemoveAll(true)
    })
    $playlistRemoveAll.click(() => {
      $playlistRemoveAll.blur()
      selectRemoveAll(false)
    })

    renderPlaylistsList($playlistsList, playlists)

    $dialog.find('[data-action="clear-start-date"]').click(() => {
      $startDate.find('input').val('')
    })
    $dialog.find('[data-action="clear-end-date"]').click(() => {
      $endDate.find('input').val('')
    })

    const pickerOptions = {
      format: dateFormat,
      allowInputToggle: true,
      locale: 'da',
      keepOpen: true,
      icons: {
        clear: 'fa fa-trash'
      },
      buttons: {
        showToday: true,
        showClear: true
      },
      useCurrent: false
    }

    $startDate.datetimepicker(pickerOptions)
    $startDate.on('change.datetimepicker', function (e) {
      $endDate.datetimepicker('minDate', e.date)
    })

    $startDate.find('input').click(() => {
      $startDate.datetimepicker('show')
    })

    $endDate.datetimepicker(pickerOptions)
    $endDate.on('change.datetimepicker', function (e) {
      $endDate.datetimepicker('maxDate', e.date)
    })
    $endDate.find('input').click(() => {
      $endDate.datetimepicker('show')
    })

    blockDialog(false)
  }
}

export default massAssign
