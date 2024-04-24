import axios from 'axios'
import $ from 'jquery'
import InstoreX from '../../components/custom-functions'

jQuery(document).ready(function () {
  const $editor = $('#editor');
  const editor = angular.element($editor).scope();
  const fonts = angular.element($('#text')).scope().fonts;
  const topPanel = angular.element($('#top-panel')).scope();
  const services = angular.element($editor).injector();
  window.PixieParams = window.PixieParams || {};

  let imageName = null;
  let imageId = null;

  if (document.location.search.indexOf('?id') >= 0) {
    // We wait for the history.loaded event to set a new history entry.
    editor.$on('history.loaded', function loadedHistory (event) {
      // We only want to listen for this event the first time the history is loaded, so we need to unlisten after first call
      // I don't know how to unlisten in angular, so this is a simple, quite unelegant and probably dead-wrong way of doing it - feel free to correct it.
      event.targetScope.$$listeners['history.loaded'].forEach(function (f, i) {
        if (f.name === 'loadedHistory') {
          event.targetScope.$$listeners['history.loaded'].splice(i, 1)
        }
      })
      services.get('history').add('Original loaded data', 'open-in-browser', null)
    })
    imageId = document.location.search.split('?id=')[1]
    axios
      .get(`/image-editor-resource/${imageId}`)
      .then((response) => {
        const historyObject = topPanel.showImagePreview(response.data.resource)
        imageName = response.data.name

        // Load fonts if necessary
        historyObject.state.objects
          .filter(function (object) { return object.name === 'text' })
          .forEach(function (object) {
            const $link = fonts.createLinkToFont(fonts.getByFontFamily(object.fontFamily))
            $link.on('load', function () {
              setTimeout(function () {
                services.get('canvas').fabric.renderAll()
              }, 500)
            })
          })

      })
  } else {
    const $mdDialog = services.get('$mdDialog')
    $mdDialog.show({
      template: $('#main-start-create-image').html(),
      controller: 'TopPanelController',
      clickOutsideToClose: false
    })
  }

  /**
   * Override pixie editor functions
   */
  editor.isIntegrationMode = true
  editor.pixie = {
    close () { return undefined },
    getParams () {
      return {
        onSave (data, _, name) {
          const encodedJson = data.split('data:text/json;charset=utf-8,')
          const json = JSON.parse(decodeURIComponent(encodedJson[1]))
          const canvas = services.get('canvas')
          const image = canvas.fabric.toDataURL({
            format: 'png',
            quality: 10
          })

          InstoreX.setLoading($editor, true)

          let postPut = null
          if (imageId) {
            postPut = axios
              .put(`/image-editor-resource/${imageId}`, {
                name: name,
                resource: json,
                image: image,
                virtualPath: JSON.parse(window.localStorage.getItem('jstree')).state.core.selected[0]
              })
          } else {
            postPut = axios
              .post('/image-editor-resource', {
                name: name,
                resource: json,
                image: image,
                virtualPath: JSON.parse(window.localStorage.getItem('jstree')).state.core.selected[0]
              })
          }
          postPut
            .then(response => {
              if (response.status !== 200) {
                throw new Error('Could not save image on InstoreX storage')
              }
              InstoreX.setLoading($editor, false)

              if (!document.location.search) {
                document.location.search = `id=${response.data.id}`
              }
            })
            .catch(error => {
              InstoreX.setLoading($editor, false)
              InstoreX.dialogs.error({
                title: 'Error',
                message: error.message
              })
            })
        },
        onSaveButtonClick () {
          setTimeout(function () {
            $('#save-image').attr('disabled', 'disabled')
            const $folders = $('#folders')

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
              .on('select_node.jstree', () => {
                if ($('#image-name').val().length) {
                  $('#save-image').attr('disabled', false)
                } else {
                  $('#save-image').attr('disabled', 'disabled')
                }
              })

            const modalScope = angular.element($('.upload-file-dialog.save-dialog')).scope()
            modalScope.imageName = imageName
            modalScope.$apply()
          }, 200)
        }
      }
    }
  }
})
