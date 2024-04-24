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
function massRemoval (selectedFile, onFinishCallback) {
  const file = selectedFile

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
      title: 'FJERN FIL FRA AFSPILNINGSLISTE',
      message: 'Henter indhold...',
      closeButton: false,
      onEscape: false,
      buttons: {
          cancel: {
              label: "FORTRYD"
          },
          confirm: {
              label: "GEM",
              className: 'btn-warning'
          }
      },
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
      playlist_ids: _.map($dialog.find('.modal-body input:checked'), element => {
        return _.toNumber($(element).val())
      }),
      content_id: file.id
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
      showError('No playlist selected', 'Please select at least one playlist to remove the file from.')
      valid = false
    }
    return valid
  }

  /**
   *
   */
  function save () {
    blockDialog(true, 'Fjern fil fra afspilningslister...')
    axios
      .post('/playlists/mass_remove', postData)
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
        $playlistsList.find('[data-playlist-id=' + key + ']').remove()
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
    $playlistsList.find('li input').each((key, input) => {
      $(input).prop('checked', select)
    })
  }

  const renderPlaylistsList = ($container, playlists) => {
    $container.empty().append(_
      .chain(playlists)
      .sortBy('Name')
      .filter(playlist => {
        return _.has(file.playlists, playlist.Id)
      })
      .map((playlist) => {
        return '<li data-playlist-id="' + playlist.Id + '">' +
          '<div class="form-check">' +
          '<label class="form-check-label">' +
          '<input class="" type="checkbox" name="playlist[]" value="' + playlist.Id + '" /> ' +
          playlist.Name +
          '</label>' +
          '</div>' +
          '</li>'
      })
      .join('')
      .value()
    )
  }

  function render (playlists) {
    $dialog.find('.modal-body').empty().append($(`
      <div class="row">
      <div class="col-12">
      <div style="display: none;" id="errorList"><div class="alert alert-danger">
      <h6>The following errors occured</h6>
      <ul class="pl-3"></ul>
      </div></div>
      <div class="card" style="max-height: calc(100vh - 15rem); overflow-y: auto;">
      <div class="card-body">
      <h6 class="card-title">Afspilningslister</h6>
      <div class="form-group"><div class="input-group">
      <span class="input-group-addon" id="playlist-search"><span class="fa fa-search"></span></span>
      <input id="playlistSearch" type="text" class="form-control" placeholder="Søg på afspilningslister navn" aria-label="Playlist search" aria-describedby="playlist-search">
      </div></div>
      <p>Mærker de afspilningslister, du vil fjerne filen fra.</p>
      <div class="btn-group mb-3" role="group" aria-label="Select or remove all playlists">
      <button data-action="select-all" class="btn btn-default">VÆLG ALLE</button>
      <button data-action="remove-all" class="btn btn-default">FJERN ALLE</button>
      </div>
      <ul class="list-unstyled" id="playlistsList"></ul>
      </div></div>
      </div>
      </div>
    `))

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

    blockDialog(false)
  }
}

export default massRemoval
