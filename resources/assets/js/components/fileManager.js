const Vue = require('vue');
import massAssign from './mass-assign';
import massRemoval from './mass-removal'
import FileUpload from './fileupload';

Vue.config.devtools = true;
new Vue( {
    el: '.file-manager',
    data: {
        currentFolder: '#',
        allFolders: [],
        allFiles: [],
        breadcrumbs: [],
        isLoading: true
    },
    created() {
        this.getAllFolders();
    },
    methods: {
        toggleFileShow: function(index) {
            this.allFiles[index].show = !this.allFiles[index].show;
            this.$forceUpdate();
        },
        getAllFolders: function () {
            axios.get('/folders').then((response) => {
                this.allFolders = response.data;

                // Added option for deep linking
                if (document.location.hash != "") {
                    let self = this;
                    let lastFolder = {
                        id: '',
                        text: '',
                    };
                    document.location.hash.split("\\").forEach(function(el){
                        if (el != "#" && el != "") {
                            lastFolder = {
                                id: lastFolder.id+'\\'+el,
                                text: el
                            };
                            self.breadcrumbs.push(lastFolder)
                        }
                    });
                    lastFolder.id += "\\";
                    this.chooseFolder(lastFolder);
                } else {
                    this.getFolderFiles({id: '#'});
                }
            });
        },
        getFolderFiles: function (folder) {
            axios.get(URI('/contents/').filename(folder.id + '').toString()).then((response) => {
                this.allFiles = response.data;
                this.allFiles.forEach((file, index) => {
                    file.show = false;
                });
                this.isLoading = false;
            });
        },
        chooseFolder: function(folder) {
            this.isLoading = true;

            $('#selectedFolder').val(folder.id);
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

            this.breadcrumbs.forEach(function(element) {
                document.location.hash =  element.id;
            });
        },
        addToPlaylist: function(file) {
            massAssign(file, () => {
                //done adding file
                //selectFolder(selectedFolder, false, true, selectedFile.id)
            })
        },
        deleteFile: function(file) {
            massRemoval(file, () => {
                //done removing file
            })
        }
    }
})