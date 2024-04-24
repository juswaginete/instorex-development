import InstoreX from '../../components/custom-functions'
import FileUpload from '../../components/fileupload'
import * as _ from 'lodash'
import '../../components/fileChooser'


const dateFormat = 'YYYY-MM-DD HH:mm';

const $saveBtn = $('[data-action="save-playlist"]');
const $playlist = $('#playlist');
const $folders = $('#folders');
const $files = $('#files');

const $uploadFilesBtn = $('[data-action="upload-file"]');

const playlistIsAudio = $files.attr('data-playlist-type') === 'audio';

const playlistId = $('input[name="playlistId"]').val();

const noFilesText = $files.attr('data-empty-text');

/**
 * @type {Array}
 */
let lastSavedList;

// Global variables for validityStart and -End elements
let $start;
let $end;

/**
 * @type {string}
 */
let selectedFolder = '#';

const setSaveBtnState = (saving) => {
  if (saving) {
    $saveBtn.attr('disabled', true).html('<span class="fa fa-spinner spinner"></span> Saving playlist')
  } else {
    $saveBtn.attr('disabled', false).text('Save')
  }
}

const getPlaylistData = ($playlist) => {
  const files = []
  $playlist.find('.file').each((index, element) => {
    const $element = $(element);
    files.push({
      id: $element.attr('data-id'),
      filename: $element.attr('data-filename'),
      duration: $element.attr('data-duration'),
      start: $element.attr('data-start'),
      end: $element.attr('data-end')
    })
  })
  return files;
}

const savePlaylist = () => {
  InstoreX.setLoading($playlist, true)
  setSaveBtnState(true)

  const files = getPlaylistData($playlist)

  axios
    .put('/playlists/' + playlistId, {
      files: files
    })
    .then(() => {
      $('.bootbox.modal').modal('hide')
      lastSavedList = files
      InstoreX.setLoading($playlist, false)
      setSaveBtnState(false)
    })
    .catch(error => {
      InstoreX.setLoading($playlist, false)
      setSaveBtnState(false)
      InstoreX.dialogs.error({
        title: 'Error saving playlist',
        message: '<p>We werent\'t able to save the playlist.</p><p>The error returned was:</p><ul><li>' + error.response.data.error + '</li></ul>'
      })
    })
}

const showDurationDialog = (event) => {
  const $file = $(event.currentTarget).closest('.file-thumb')
  InstoreX.dialogs.custom(bootbox.dialog({
    title: 'Set duration',
    message: '<div class="form-inline">Select the duration: ' +
    '<input type="number" min="1" max="120" value="' + $file.attr('data-duration') + '" style="width: 4rem;" ' +
    'class="mx-2 form-control text-right px-1"/> seconds' +
    '</div>',
    onEscape: true,
    buttons: {
      cancel: {
        label: 'Cancel',
        className: 'btn btn-default'
      },
      save: {
        label: 'Save',
        className: 'btn btn-primary',
        callback: (result) => {
          if (!result) {
            return
          }
          $file.attr('data-duration', $('.bootbox .modal-body input').val())
        }
      }
    }
  }))
}

const showLimitDialog = (event) => {
  const $file = $(event.currentTarget).closest('.file-thumb')
  const startDate = $file.attr('data-start') || ''
  const endDate = $file.attr('data-end') || ''

  InstoreX.dialogs.custom(bootbox.dialog({
    title: 'Set start and end dates',
    size: 'large',
    onEscape: true,
    message:
    '<p>Select the start and end dates of this file</p>' +
    '<div style="display: none;" class="alert alert-danger">Please enter a date in both or none of the fields.</div>' +
    '<div class="row"><div class="col-md-6"><div class="form-group">' +
    '<label>Start date</label>' +
    '<div class="input-group date" id="validityStartDate" data-target-input="nearest">' +
    '<span class="input-group-addon" data-target="#validityStartDate" data-toggle="datetimepicker"><span class="fa fa-calendar"></span></span>' +
    '<input type="text" class="form-control datetimepicker-input text-center" data-target="#validityStartDate" value="' + startDate + '"/>' +
    '</div></div></div>' +
    '<div class="col-md-6">' +
    '<div class="form-group">' +
    '<label>End date</label>' +
    '<div class="input-group date" id="validityEndDate" data-target-input="nearest">' +
    '<span class="input-group-addon" data-target="#validityEndDate" data-toggle="datetimepicker"><span class="fa fa-calendar"></span></span>' +
    '<input type="text" class="form-control datetimepicker-input text-center" data-target="#validityEndDate" value="' + endDate + '"/>' +
    '</div></div></div></div>',
    buttons: {
      clear: {
        label: 'Unset dates',
        className: 'btn btn-danger',
        callback: () => {
          $start.find('input').val('')
          $end.find('input').val('')
          return false
        }
      },
      cancel: {
        label: 'Cancel',
        className: 'btn btn-default'
      },
      save: {
        label: 'Save',
        className: 'btn btn-primary',
        callback: (event) => {
          const s = $start.find('input').val()
          const e = $end.find('input').val()
          if (InstoreX.XOR(s === '', e === '')) {
            $(event.target).closest('.modal').find('.alert').show()
            return false
          }
          $file.attr('data-start', $start.find('input').val())
          $file.attr('data-end', $end.find('input').val())
        }
      }
    }
  }), {
    init: (dialog) => {
      $start = $('#validityStartDate')
      $end = $('#validityEndDate')

      $(dialog).find('[data-action="clear-start-date"]').click(() => {
        $start.find('input').val('')
      })
      $(dialog).find('[data-action="clear-end-date"]').click(() => {
        $end.find('input').val('')
      })

      const pickerOptions = {
        format: dateFormat,
        allowInputToggle: true,
        locale: 'da',
        keepOpen: true,
        ignoreReadonly: true,
        buttons: {
          showToday: true,
          showClear: true
        },
        useCurrent: false
      }

      $start.datetimepicker(pickerOptions)
      $start.on('change.datetimepicker', function (e) {
        $end.datetimepicker('minDate', e.date)
      })

      $start.find('input').click(() => {
        $start.datetimepicker('show')
      })

      $end.datetimepicker(pickerOptions)
      $end.on('change.datetimepicker', function (e) {
        $start.datetimepicker('maxDate', e.date)
      })
      $end.find('input').click(() => {
        $end.datetimepicker('show')
      })
    }
  })
}

const initializeAndPopulatePlaylist = (result) => {}


// Handle save button
$saveBtn.click(savePlaylist);

lastSavedList = getPlaylistData($playlist);
