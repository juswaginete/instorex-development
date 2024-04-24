const Vue = require('vue');
import InstoreX from './custom-functions'


console.log('Is loaded?');

Vue.config.devtools = true;
new Vue( {
    el: '#file-chooser',
    data: {
        playlist: [],
        currentFolder: '#',
        allFolders: [],
        allFiles: [],
        breadcrumbs: [],
        playlistId: $('input[name="playlistId"]').val(),
        currentListCount: 0,
        isSaved: true
    },
    created() {
        this.getAllFolders();
        this.initPlaylist();

        // Warn user if data hasn't been saved
        $(window).on('beforeunload', (event) => {
            if (this.isSaved == true && this.currentListCount == $('#playlist').find('.file').length) {
                return;
            }

            event.preventDefault();
            const text = 'You have changed the playlist, but haven\'t saved it yet.\nAare you sure you want to leave this page without saving?';
            event.returnValue = text;
            return text;
        })
    },
    methods: {
        initPlaylist: function () {
            axios.get(document.location.href).then((response) => {
                this.playlist = response.data.contents;
                this.currentListCount = this.playlist.length;
                setTimeout(() => {
                    $('#playlist').sortable({
                      helper: true,
                      revert: false,
                      placeholder: 'file-thumb placeholder',
                      items: '.file',
                      snap: true,
                      update: (event, ui) => {
                          var $element = $(ui.item[0]);
                          this.playlist.push({
                              date_end: $element.attr('data-end') ? $element.attr('data-end') : null,
                              date_start: $element.attr('data-start') ? $element.attr('data-start') : null,
                              duration: $element.attr('data-duration'),
                              id: $element.attr('data-id'),
                              show: false,
                              text: $element.attr('data-filename'),
                              type: $element.attr('data-type'),
                              thumb: $element.find('.file-preview-background img').attr('src')
                          });
                          $element.remove();
                      }
                    })
                    .selectable({
                      filter: '.file'
                    })
                    .attr('data-empty-text', 'Træk filer her, for at lave en spilleliste...')
                }, 10);
                this.playlist.forEach((item, index) => {
                    item.show = false;
                });
            });
        },
        savePlaylist: function() {
            InstoreX.setLoading($('#playlist'), true);
            let files = [];
            let $elements = $('#playlist').find('.file');
            $elements.each((index, element) => {
                const $element = $(element);
                files.push({
                    id: $element.attr('data-id'),
                    filename: $element.attr('data-filename'),
                    duration: $element.attr('data-duration'),
                    start: $element.attr('data-start') ? $element.attr('data-start') : null,
                    end: $element.attr('data-end') ? $element.attr('data-end') : null,
                });
            });
            axios.put('/playlists/' + this.playlistId, {files: files}).then((response) => {
                this.isSaved = true;
                this.currentListCount = $('#playlist').find('.file').length;
                InstoreX.setLoading($('#playlist'), false);
            }).catch(error => {
                InstoreX.setLoading($('#playlist'), false);
                InstoreX.dialogs.error({
                        title: 'Fejl ved at gemme spilleliste',
                        message: '<p>Vi kunne ikke gemme spillelisten.</p><p>Fejl:</p><ul><li>' + error.response.data.error + '</li></ul>'
                    })
                })
        },
        getAllFolders: function () {
            axios.get('/folders').then((response) => {
                this.allFolders = response.data;
            });
        },
        getFolderFiles: function (folder) {
            axios.get(URI('/contents/').filename(folder.id + '').toString()).then((response) => {
                this.allFiles = response.data;
                setTimeout(function () {
                    $('.file').draggable({
                      addClasses: false,
                      helper: 'clone',
                      revert: 'invalid',
                      connectToSortable: $('#playlist')
                    });
                }, 10);
            });
        },
        chooseFolder: function(folder) {
            this.allFiles = [];
            if (folder.id == '#') {
                this.breadcrumbs = [];
                this.currentFolder = folder.id;
                this.getFolderFiles(folder);
                return;
            }
            this.breadcrumbs.forEach((breadcrumb, index) => {
                if (breadcrumb.id == folder.id) {
                    //this folder already exists in path, we should go to this and clear the rest of the array
                    this.currentFolder = folder.id;
                    this.getFolderFiles(folder);
                    this.breadcrumbs.length = index;
                    return;
                }
            });
            this.breadcrumbs.push(folder);
            this.currentFolder = folder.id;
            this.getFolderFiles(folder);
        },
        toggleFileShow(index) {
            this.playlist[index].show = !this.playlist[index].show;
            this.$forceUpdate();
        },
        removeFile(e) {
            $(e.target).closest('.file').remove()
        },
        showDurationDialog: function(event) {
            const $file = $(event.currentTarget).closest('.file');
            InstoreX.dialogs.custom(bootbox.dialog({
                title: 'Angiv varighed',
                message: '<div class="form-inline">Vælg varighed: ' +
                '<input type="number" min="1" max="120" value="' + $file.attr('data-duration') + '" style="width: 4rem;" ' +
                'class="mx-2 form-control text-right px-1"/> sekunder' +
                '</div>',
                onEscape: true,
                buttons: {
                    cancel: {
                        label: 'Fortryd',
                        className: 'btn btn-default'
                    },
                    save: {
                        label: 'Gem',
                        className: 'btn btn-warning',
                        callback: (result) => {
                            if (!result) {
                                return
                            }
                            this.isSaved = false;
                            $file.attr('data-duration', $('.bootbox .modal-body input').val())
                        }
                    }
                }
            }));
        },
        showLimitDialog: function (event) {
            let $start;
            let $end;
            const $file = $(event.currentTarget).closest('.file')
            const startDate = $file.attr('data-start') || ''
            const endDate = $file.attr('data-end') || ''

            InstoreX.dialogs.custom(bootbox.dialog({
                title: 'Angiv start og slut dato',
                size: 'large',
                onEscape: true,
                message:
                '<p>Vælg start og slut dato for denne fil</p>' +
                '<div style="display: none;" class="alert alert-danger">Angiv venligst en dato i begge felter.</div>' +
                '<div class="row"><div class="col-md-6"><div class="form-group">' +
                '<label>Start dato</label>' +
                '<div class="input-group date" id="validityStartDate" data-target-input="nearest">' +
                '<span class="input-group-addon" data-target="#validityStartDate" data-toggle="datetimepicker"><span class="fa fa-calendar"></span></span>' +
                '<input type="text" class="form-control datetimepicker-input text-center" data-target="#validityStartDate" value="' + startDate + '"/>' +
                '</div></div></div>' +
                '<div class="col-md-6">' +
                '<div class="form-group">' +
                '<label>Slut dato</label>' +
                '<div class="input-group date" id="validityEndDate" data-target-input="nearest">' +
                '<span class="input-group-addon" data-target="#validityEndDate" data-toggle="datetimepicker"><span class="fa fa-calendar"></span></span>' +
                '<input type="text" class="form-control datetimepicker-input text-center" data-target="#validityEndDate" value="' + endDate + '"/>' +
                '</div></div></div></div>',
                buttons: {
                    clear: {
                        label: 'Fjern datoer',
                        className: 'btn btn-danger',
                        callback: () => {
                            $start.find('input').val('')
                            $end.find('input').val('')
                            return false
                        }
                    },
                    cancel: {
                        label: 'Fortryd',
                        className: 'btn btn-default'
                    },
                    save: {
                        label: 'Gem',
                        className: 'btn btn-warning',
                        callback: (event) => {
                            const s = $start.find('input').val()
                            const e = $end.find('input').val()
                            if (InstoreX.XOR(s === '', e === '')) {
                                $(event.target).closest('.modal').find('.alert').show()
                                return false
                            }
                            this.playlist.forEach((item, index) => {
                                if (item.id == $file.attr('data-id')) {
                                    item.date_start = $start.find('input').val()
                                    item.date_end = $end.find('input').val()
                                }
                            });
                            this.isSaved = false;
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
                        format: 'YYYY-MM-DD HH:mm',
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
    }
})