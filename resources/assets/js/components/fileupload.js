import * as _ from 'lodash'
import InstoreX from '../components/custom-functions'

const typesToFiles = {
  Audio: ['mp3', 'wav'],
  Image: ['jpg', 'jpeg', 'png', 'bmp'],
  Video: ['mpg', 'mp4', 'ts', 'mov', 'vob', 'wmv']
}

const verifyOptions = (options) => {
  if (!_.has(options, 'folderPath')) {
    throw new Error('Missing option "folderPath"')
  }
}

class FileUpload {
  constructor (options) {
    verifyOptions(options)
    /**
     * @type {string}
     */
    this.folderPath = options.folderPath

    this.successCallback = options.success

    this.errorCallback = options.error

    this.$dialog = null
    this.$form = null
    this.$inputField = null
    this.$status = null
    this.$submitBtn = null
    this.$filesChosen = null

    /**
     * @type {FormData}
     */
    this.data = null

    this.showUploadFileDialog()
  }

  static run (opts) {
    return new FileUpload(opts)
  }

  static get chooseFileText () {
    return 'Choose file...'
  }

  /**
   *
   * @returns {null|*}
   * @private
   */
  createUploadForm () {
    this.$form = $('<div><form>' +
      '<div class="form-group mb-3">' +
      '<label for="file">Vælg fil</label>' +
      '<div class="form-control custom-file">' +
      '<input type="file" name="file" class="custom-file-input" multiple />' +
      '<span class="custom-file-control" data-filename="' + FileUpload.chooseFileText + '"></span>' +
      '</label>' +
      '</div></div>' +
      '<ul class="files-chosen list-unstyled"></ul>' +
      '</form>' +
      '<div id="uploadStatus" style="display: none;"></div>' +
      '</div>')
    this.$inputField = this.$form.find('input[type=file]')
    this.$status = this.$form.find('#uploadStatus')
    this.$filesChosen = this.$form.find('.files-chosen')
    return this.$form
  }

  /**
   * Add an error alert box to a dialog
   *
   * @param {string|jQuery} html
   * @private
   */
  showDialogError (html) {
    const $modal = this.$form.closest('.bootbox.modal')
    let $error = $modal.find('.modal-body .alert')
    if ($error.length === 0) {
      $error = $('<div class="alert alert-danger">')
      $modal.find('.modal-body').prepend($error)
    }
    if (html instanceof jQuery) {
      $error.append(html)
    } else {
      $error.html(html)
    }
  }

  /**
   * Remove an error alert box from a dialog
   */
  removeDialogError () {
    this.$dialog.find('.modal-body .alert.alert-danger').remove()
  }

  setFileUploadStatus (type, percent) {
    let uploadPercent = 0
    let processPercent = 0
    switch (type) {
      case 'upload':
        uploadPercent = percent
        break
      case 'process':
        uploadPercent = 100
        processPercent = percent
        break
    }
    this.$status.empty()
    if (type !== 'hide') {
      this.$status.append(
        '<ul class="list-unstyled">' +
        '<li>Upload fil<br />' +
        '<div class="progress">' +
        '<div class="progress-bar' + (uploadPercent === 100 ? ' bg-success' : '') + '" role="progressbar" ' +
        'style="width: ' + uploadPercent + '%;" aria-valuenow="' + uploadPercent + '" aria-valuemin="0" ' +
        'aria-valuemax="100">' + uploadPercent + '%</div>' +
        '</div></li>' +
        '<li>Process fil<br />' +
        '<div class="progress">' +
        '<div class="progress-bar ' + (processPercent === 100 ? 'bg-success' : 'bg-light') + '" ' + 'role="progressbar" ' +
        'style="' + (processPercent !== 100 ? 'color:#000;' : '') + 'width: 100%;" aria-valuenow="100" aria-valuemin="0" ' +
        'aria-valuemax="100">' +
        (uploadPercent === 100 && processPercent !== 100 ? '<i class="fa fa-spinner spinner"></i>' : processPercent + '%') +
        '</div>' +
        '</div></li>' +
        '</ul>'
      )
    }
  }

  /**
   *
   * @param {Event} event
   */
  onFileInputChange (event) {
    this.updateFileInput(false, event.currentTarget.files)
    this.removeDialogError()
  }

  /**
   *
   * @param {boolean} clear
   * @param {FileList=} files
   */
  updateFileInput (clear, files) {
    this.$filesChosen.empty()
    if (clear) {
      this.$inputField.wrap('<form>').closest('form').get(0).reset()
      this.$inputField.unwrap()
    } else {
      _.forEach(files, file => {
        this.$filesChosen.append('<li><span class="text-danger fa fa-close"></span> ' + file.name + '</li>')
      })
    }
    this.$submitBtn.attr('disabled', clear)
    this.$inputField.next().attr('data-filename', clear ? FileUpload.chooseFileText : 'Files chosen')
  }

  /**
   *
   * @param result
   */
  uploadSuccess (result) {
    if (_.isFunction(this.successCallback)) {
      this.successCallback(result)
    }
  }

  parseFile (file) {
    const extension = _.last(file.name.split('.')).toLowerCase()

    let fileType = null
    _.forEach(typesToFiles, function (extensions, type) {
      if (_.includes(extensions, extension)) {
        fileType = type
      }
    })

    if (fileType === null) {
      this.updateFileInput(true)
      this.showDialogError('<h5>Invalid file type</h5>' +
        '<p>The file "' + file.name + '" isn\'t of a valid type</p>' +
        '<p>Valid file types are:</p>' +
        '<ul>' +
        _.chain(typesToFiles)
          .map((value, key) => {
            return '<li>' + key + ': ' + _.join(value, ', ') + '</li>'
          })
          .join('')
          .value() +
        '</ul>')
      return true
    }

    this.data.append('type[]', fileType)
    this.data.append('file[]', file)

    return false
  }

  doFileUpload () {
    const files = this.$inputField.get(0).files
    this.data = new window.FormData()
    this.data.append('path', this.folderPath)

    if (_.some(files, this.parseFile.bind(this))) {
      this.data = null
      return false
    }

    this.$status.show()
    this.updateFileInput(true)
    this.$form.find('form').hide()
    this.setFileUploadStatus('upload', 0)

    axios
      .post('/contents', this.data, {
        /**
         *
         * @param {{lengthComputable: boolean, loaded: number, total: number}} progressEvent
         */
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.ceil((progressEvent.loaded * 100) / progressEvent.total)
          this.setFileUploadStatus('upload', percentCompleted)
          if (percentCompleted === 100) {
            this.setFileUploadStatus('process', 0)
          }
        }
      })
      .then(this.cbUploadSuccess.bind(this))
      .catch(this.cbUploadError.bind(this))
  }

  cbUploadSuccess (result) {
    this.setFileUploadStatus('process', 100)
    this.updateFileInput(true)
    this.uploadSuccess(result)
    window.setTimeout(() => {
      bootbox.hideAll()
    }, 500)
  }

  cbUploadError (error) {
    const status = error.response.data.status
    let hasSuccessfulFiles = false
    const errors = []

    _.forEach(status, (status, file) => {
      if (status === false) {
        hasSuccessfulFiles = true
        return
      }
      errors.push('<dt>' + file + '</dt><dd>' + status + '</dd>')
    })

    this.showDialogError(
      '<h5>Fejl under upload af filer</h5>' +
      '<p>' + _
        .chain([
          'We encountered an error while trying to upload the following file(s).',
          '<dl>',
          errors.join(''),
          '</dl>',
          'If you want to, you can try and upload the files with errors again.',
          hasSuccessfulFiles ? 'The rest of the files were uploaded successfully and shouldn\'t be uploaded again' : ''
        ])
        .filter()
        .join('</p><p>')
        .value() +
      '</p>'
    )
    if (hasSuccessfulFiles) {
      this.uploadSuccess(error.response.data)
    }
    this.setFileUploadStatus('hide')
    this.$form.find('form').show()
    this.updateFileInput(true)
  }

  showUploadFileDialog () {
    this.$dialog = InstoreX.dialogs.custom(bootbox.dialog({
      title: 'Upload fil',
      message: this.createUploadForm(),
      type: 'primary',
      buttons: {
        cancel: {
          label: 'Fortryd',
          className: 'btn-btn-default',
          callback: () => {
            this.updateFileInput(true)
          }
        },
        upload: {
          label: 'Upload',
          className: 'btn btn-warning',
          callback: () => {
            this.doFileUpload()
            return false
          }
        }
      }
    }), {
      init: (dialog) => {
        this.$submitBtn = $(dialog).find('[data-bb-handler="upload"]')
          .attr('disabled', true)
      }
    })

    this.$inputField.change(this.onFileInputChange.bind(this))
  }
}

export default FileUpload
