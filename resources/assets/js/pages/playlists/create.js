import InstoreX from '../../components/custom-functions'

const $form = $('#newDynamicPlaylistForm')
$form.submit(e => {
  e.preventDefault()
  axios
    .post('/playlists', {
      type: $form.find('[name="type"]').val(),
      name: $form.find('[name="name"]').val()
    })
    .then(response => {
      if (response.data.success !== true) {
        throw new Error('An unkown error occured and the Dynamic Playlist wasn\'t created.')
      }
      document.location.href = '/playlists/' + response.data.id + '/edit'
    })
    .catch(error => {
      InstoreX.dialogs.error({
        title: 'Error',
        message: _.get(error, 'response.data.error', error.message)
      })
    })
})
