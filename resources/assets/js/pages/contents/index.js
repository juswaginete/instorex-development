import moment from 'moment'
import * as _ from 'lodash'
import InstoreX from '../../components/custom-functions'
import FileUpload from '../../components/fileupload'
import massAssign from '../../components/mass-assign'
import massRemoval from '../../components/mass-removal'
import '../../components/fileManager'

const $folders = $('#folders')
const $files = $('#fileList')
const $fileInfo = $('#fileInfo')

const $createFolderBtn = $('[data-action="create-folder"]')

const $deleteFolderBtn = $('[data-action="delete-folder"]')

const $uploadFileBtn = $('[data-action="upload-file"]')

const $deleteFileBtn = $('[data-action="delete-file"]')
const $fetchFileButtons = $('[data-action="view-file"]').add('[data-action="download-file"]')

const $addToPlaylistsBtn = $('[data-action="add-to-playlists"]')
const $deleteFromPlaylistsBtn = $('[data-action="delete-from-playlists"]')
const $fileActions = $fetchFileButtons.add($deleteFileBtn).add($addToPlaylistsBtn).add($deleteFromPlaylistsBtn)

/**
 * @type {string}
 */
let selectedFolder = '#'
/**
 * @type {Object}
 */
let selectedFile = null

// ----- Contextless helper functions ----- //

/**
 *
 * @param path
 * @param newFolder
 * @returns {string}
 */
const createFolderNode = (path, newFolder) => {
  return $folders.jstree(true).create_node(path, newFolder)
}
/**
 *
 * @param {string} folder
 * @returns {JSTreeNode}}
 */
const getFolderNode = (folder) => {
  return $folders.jstree(true).get_node(folder)
}

/**
 *
 * @param {string} folder
 * @returns {boolean}
 */
const deleteFolderNode = (folder) => {
  return $folders.jstree(true).delete_node(folder)
}

/**
 * Add an error alert box to a dialog
 *
 * @param {string|jQuery} html
 */
const addDialogError = (html) => {
  let $error = InstoreX.getCurrentModal('alert')
  if ($error.length === 0) {
    $error = $('<div class="alert alert-danger">')
    InstoreX.getCurrentModal('body').prepend($error)
  }
  if (html instanceof jQuery) {
    $error.append(html)
  } else {
    $error.html(html)
  }
}

function createFolder (folder) {
  InstoreX.dialogs.custom(bootbox.prompt({
    title: 'Please write a folder name',
    callback: function (newFolderName) {
      if (newFolderName === null) {
        return
      }
      newFolderName = _.trim(newFolderName)
      if (newFolderName.length === 0) {
        addDialogError('No folder name given.')
        return false
      }
      // Get parent folder
      const $folder = getFolderNode(folder)

      // Check if specified folder name already exists
      const exists = _.some($folder.children, (child) => {
        return child.replace(/\\/g, '') === newFolderName
      })
      if (exists) {
        addDialogError('Folder with that name already exists. Please select a new name.')
        return false
      }

      // Add the folder to the tree
      const parentFolderId = ($folder.id !== '#' ? $folder.id : '\\')

      // Set the loading spinner
      InstoreX.setLoading($folders, true)

      // Send the new folder name
      axios.post('/folders', {
        folder: newFolderName,
        path: parentFolderId
      }).then((result) => {
        const id = parentFolderId + newFolderName + '\\'
        createFolderNode(folder, {
          id: id,
          text: newFolderName,
          internal_id: result.data.id
        })
        $folders.jstree('deselect_all')
        $folders.jstree('select_node', getFolderNode(id))
        InstoreX.setLoading($folders, false)
        // eslint-disable-next-line no-new
        InstoreX.notify({
          title: 'Folder created',
          text: 'The folder "' + newFolderName + '" was successfully created',
          type: 'success'
        })
      }).catch((error) => {
        InstoreX.dialogs.custom(bootbox.alert({
          message: error.response.data.error,
          type: 'error'
        }))
        InstoreX.setLoading($folders, false)
      })
    }
  }))
}

function deleteFolder (folder) {
  const $folder = getFolderNode(folder)
  InstoreX.dialogs.custom(bootbox.confirm({
    message: 'Are you sure, that you want to delete the folder \'' + $folder.text + '\'?',
    callback: (result) => {
      if (result) {
        // Set the loading spinner
        InstoreX.setLoading($folders, true)

        axios
          .delete(URI('/folders/').filename($folder.original.internal_id + '').toString())
          .then(() => {
            // eslint-disable-next-line no-new
            InstoreX.notify({
              title: 'Folder deleted',
              text: 'The folder "' + $folder.text + '" was successfully created',
              type: 'success'
            })
            deleteFolderNode(folder)
            InstoreX.setLoading($folders, false)
            selectFolder('#', true)
          })
          .catch(() => {
            InstoreX.dialogs.error({
              title: 'Error deleting folder',
              message: '<p>There was an error deleting the folder "' + $folder.text + '".</p>' +
              '<p>Are there any files within the folder or subfolders that are in use in a playlist or presentation?</p>'
            })
            InstoreX.setLoading($folders, false)
          })
      }
    }
  }))
}

function selectFile (data, hide) {
  selectedFile = data
  $fileInfo.empty()
  if (hide) {
    $fileActions.addClass('invisible')
    $fileInfo.append('<p>No file selected</p>')
    return
  }

  const emptyPlaylists = _.isEmpty(data.playlists)
  $fileActions.not(emptyPlaylists ? $deleteFromPlaylistsBtn : $()).removeClass('invisible')
  $deleteFileBtn.attr('disabled', !data.deletable)
  $fetchFileButtons.attr('href', data.path)
  const pl = !emptyPlaylists ? _.chain(data.playlists).sortBy().values().join('<br/>').value() : '-'
  $fileInfo.append(
    '<dl>' +
    '<dt>File name</dt>' +
    '<dd>' + data.text + '</dd>' +
    '<dt>Location</dt>' +
    '<dd>' + data.virtual_path + '</dd>' +
    '<dt>File size</dt>' +
    '<dd>' + pretty(data.size) + '</dd>' +
    '<dt>Upload date</dt>' +
    '<dd>' + moment(data.date_uploaded).format('MMMM Do YYYY, H:mm:ss') + '</dd>' +
    '<dt>Playlists</dt>' +
    '<dd>' + pl + '</dd>' +
    (data.type !== 'Audio'
      ? '<dt>Thumbnail</dt><dd><img class="img-fluid" src="' + data.thumb + '" alt="Thumbnail" /></dd>'
      : '') +
    '</dl>'
  )
}

/**
 * Delete a file
 *
 * @param {Object} file
 */
function deleteFile (file) {
  InstoreX.dialogs.custom(bootbox.confirm({
    title: 'Delete file',
    message: 'Are you sure, that you want to delete the file \'' + file.text + '\'?',
    callback: (result) => {
      if (result) {
        // Set the loading spinner
        axios
          .delete(URI('/contents/').filename(file.id + '').toString())
          .then(() => {
            InstoreX.getCurrentModal().modal('hide')
            InstoreX.notify({
              title: 'File deleted',
              text: 'The file "' + file.text + '" was successfully deleted.',
              type: 'success'
            })
            selectFolder(selectedFolder, false, true)
          })
          .catch(() => {
            addDialogError(
              '<h5>Error deleting file</h5>' +
              '<p>There was an error deleting the file "' + file.text + '".</p>' +
              '<p>The following is a list of probable causes for this error:</p>' +
              '<ul>' +
              '<li>The file has already been deleted, but for some reason it isn\'t reflected in the current list. </li>' +
              '<li>The file is in use in either a playlist or a presentation</li>' +
              '</ul>' +
              '<p>We recommend that you reload the page to make sure your list reflects the most up-to-date version.</p>'
            )
            InstoreX.getCurrentModal('confirm')
              .replaceWith($('<a class="btn btn-primary" href="' + document.location.href + '"><span class="fa fa-refresh"></span> Refresh</a>'))
          })
        InstoreX.getCurrentModal('confirm')
          .prop('disabled', true)
          .html('<span class="fa fa-spinner spinner"></span> Deleting...')
        return false
      }
    }
  }), {
    type: 'danger',
    init: (dialog) => {
      InstoreX.getCurrentModal('confirm', $(dialog))
        .removeClass('btn-primary')
        .addClass('btn-danger')
    }
  })
}

/**
 *
 * @param {string} folder
 * @param {(boolean|undefined)=} hide
 * @param {boolean=} forceReload
 * @param {Object=} preselectFile
 */
const selectFolder = (folder, hide, forceReload, preselectFile) => {
  // If the same folder is selected again, don't do anything
  if (folder === selectedFolder && !hide && !forceReload) {
    return
  }

  // Set the global selected folder var
  selectedFolder = hide ? '#' : folder

  // Set hide as actual boolean
  hide = !!hide

  // Toggle the visibility of the folder actions based on hide
  $uploadFileBtn.toggleClass('invisible', hide)

  // Toggle the disabled stated of the delete folder btn based on the hide
  $deleteFolderBtn.attr('disabled', hide)

  // Hide the currently selected file (if any)
  selectFile(null, true)

  // Destroy the
  $files.jstree('destroy')

  $files.empty()

  $files.attr('data-empty-text', hide ? 'No folder selected' : 'This folder contains no files')

  if (!hide) {
    $files
      .jstree({
        core: {
          icon: false,
          check_callback: true,
          themes: {'stripes': true},
          data: {
            url: URI('/contents/').filename(folder + '').toString(),
            success: (result) => {
              if (result.length === 0) {
                $files.jstree('destroy')
              }
            },
            error: () => {
              InstoreX.dialogs.custom(bootbox.alert({
                title: 'Error loading folder contents',
                message: '<p>' + _.join([
                  'There was an error loading the contents of the folder.',
                  'Please try again or click another folder and see, it that one works.',
                  'If no folders can be loaded, please contact support.'
                ], '</p><p>') + '</p>',
                buttons: {
                  ok: {
                    label: 'OK',
                    className: 'btn btn-primary'
                  }
                }
              }), {
                type: 'error'
              })
            }
          },
          multiple: false
        },
        plugins: ['sort']
      })
      .on('ready.jstree', () => {
        if (preselectFile) {
          $files.jstree(true).select_node($('#' + preselectFile))
          return
        }
        const uri = URI(document.location.hash)
        const fragment = uri.fragment(true)
        if (fragment.file) {
          // find file
          const $elements = $files.find('li:contains("' + fragment.file + '")')
          if ($elements.length > 0) {
            $files.jstree(true).deselect_all()
            $files.jstree(true).select_node($elements.get(0))
          }
          document.location.hash = uri.removeFragment('file').toString()
        }
      })
      .on('select_node.jstree', (event, selected) => {
        /**
         * @type {{node: JSTreeNode}} selected
         */
        selectFile(selected.node.original)
      })
      .on('deselect_node.jstree', (event, selected) => {
        /**
         * @type {{node: JSTreeNode}} selected
         */
        selectFile(selected.node.original, true)
      })
  }
}

// ----- Setup ----- //

$folders
  .jstree({
    core: {
      check_callback: true,
      themes: {'stripes': true},
      data: {
        url: '/folders',
        error: () => {
          InstoreX.dialogs.custom(bootbox.alert({
            title: 'Error loading folders',
            message: '<p>' + _.join([
              'There was an error loading the folders from the server.',
              'Please try and reload the page and see if it helps.'
            ], '</p><p>') + '</p>',
            buttons: {
              ok: {
                label: '<i class="fa fa-refresh"></i> Reload page',
                className: 'btn btn-danger'
              }
            },
            callback: () => {
              document.location.reload()
            }
          }), {
            type: 'error'
          })
          $folders.remove()
        }
      },
      multiple: false
    },
    plugins: ['sort', 'state']
  })

$createFolderBtn.click(() => {
  $deleteFolderBtn.blur()
  createFolder(selectedFolder)
})
$deleteFolderBtn.click(() => {
  $deleteFolderBtn.blur()
  deleteFolder(selectedFolder)
})
$uploadFileBtn.click(() => {
  $uploadFileBtn.blur()
  // eslint-disable-next-line no-new
  FileUpload.run({
    folderPath: $('#selectedFolder').val(),
    success: () => {
        window.location.reload();
        selectFolder(selectedFolder, false, true)
    }
  })
})
$deleteFileBtn.click(() => {
  $deleteFileBtn.blur()
  deleteFile(selectedFile)
})
$('body').on('click', '[data-action="add-to-playlists"]', () => {
  $addToPlaylistsBtn.blur()
  massAssign(selectedFile, () => {
    selectFolder(selectedFolder, false, true, selectedFile.id)
  })
})
$deleteFromPlaylistsBtn.click(() => {
  $deleteFromPlaylistsBtn.blur()
  massRemoval(selectedFile, () => {
    selectFolder(selectedFolder, false, true, selectedFile.id)
  })
})
$folders
  .on('select_node.jstree', (event, selected) => {
    selectFolder(selected.node.id, false)
  })
  .on('deselect_node.jstree', (event, selected) => {
    selectFolder(selected.node.id, true)
  })
  .on('loaded.jstree', () => {
    setTimeout(() => {
      const uri = URI(document.location.hash)
      const fragment = uri.fragment(true)
      if (fragment.folder) {
        $folders.jstree(true).deselect_all()
        $folders.jstree(true).select_node(fragment.folder)
        uri.removeFragment('folder')
        document.location.hash = uri.toString()
      }
    }, 50)
  })
