import InstoreX from '../../components/custom-functions'
import * as _ from 'lodash'

const deletePlaylist = (event) => {
  const $tr = $(event.target).closest('tr')
  const dplId = $tr.attr('data-dpl-id')
  const name = $tr.find('td').first().text()
  InstoreX.dialogs.custom(bootbox.confirm({
    title: 'Delete Dynamic Playlist',
    message: '<p>' + _.join([
      'You\'re about to delete the Dynamic Playlist "' + name + '".',
      'Are you sure you want to continue?'
    ], '</p><p>') + '</p>',
    buttons: {
      cancel: {
        label: 'No, keep it',
        className: 'btn btn-default'
      },
      confirm: {
        label: 'Yes, delete it',
        className: 'btn btn-danger'
      }
    },
    callback: (result) => {
      if (!result) {
        return
      }
      InstoreX.setLoading($tr, true)
      axios
        .delete('/playlists/' + dplId)
        .then((response) => {
          if (response.data.success !== true) {
            throw new Error('An unknown error happened and the Dynamic Playlist wasn\'t deleted')
          }
          InstoreX.setLoading($tr, false)
          $tr.remove()

          // eslint-disable-next-line no-new
          InstoreX.notify({
            title: 'Dynamic Playlist deleted',
            text: ' The Dynamic Playlist "' + name + '" was deleted successfully.',
            type: 'success'
          })
        })
        .catch((error) => {
          InstoreX.setLoading($tr, false)
          InstoreX.dialogs.custom(bootbox.alert({
            title: 'Error deleting Dynamic Playlist',
            message: _.get(error, 'response.data.error', error.message)
          }))
        })
    }
  }))
}

$('#main').on('click', '[data-action="delete-playlist"]', deletePlaylist)
