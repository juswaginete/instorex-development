@extends('layouts.app')

@section('content')
    <div class="container" xmlns:v-on="http://www.w3.org/1999/xhtml">
        <h1 class="d-inline-flex justify-content-between w-100">
            <div><span class="orange-text"><i class="fa fa-upload"></i> HÅNDTER</span></div>
            <button type="button" class="btn btn-warning" data-action="upload-file">
                UPLOAD
            </button>
        </h1>

        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-body">
                        <div class="file-manager" id="tester">
                            <input type="hidden" id="selectedFolder" :value="currentFolder">
                            <div class="file-manager-header">
                                <div class="manager-path">
                                    <div class="manager-step" :class="[(currentFolder == '#') ? 'active' : '']" @click="chooseFolder({id: '#'})">
                                        <i class="fa fa-3 fa-folder"></i>
                                        <span>ALT</span>
                                    </div>
                                    <div class="manager-step" v-for="(folder, index) in breadcrumbs" :class="[(currentFolder == folder.id) ? 'active' : '']" @click="chooseFolder(folder)">
                                        <i class="fa fa-3 fa-folder"></i>
                                        <span>@{{ folder.text }}</span>
                                    </div>
                                </div>
                                <div class="manager-search">

                                </div>
                            </div>
                            <div class="file-manager-content">
                                <div class="row">
                                    <div class="col-md-12 loading-content" v-if="isLoading">
                                        Loading content...
                                    </div>

                                    <div class="file-container col-md-2" v-for="(folder, index) in allFolders" v-if="folder.parent == currentFolder && !isLoading"  @click="chooseFolder(folder)">
                                        <div class="folder">
                                            <i class="fa fa-folder"></i>
                                            <span class="folder-title">@{{ folder.text }}</span>
                                        </div>
                                    </div>
                                    <div class="file-container col-md-2" v-if="!isLoading" v-for="(file, index) in allFiles" :key="file.id">
                                        <div class="file">
                                            <a class="file-header" @click="toggleFileShow(index)"><i class="fa fa-plus"></i></a>
                                            <div class="file-overlay" v-show="file.show">
                                                <a class="file-header" @click="toggleFileShow(index)"><i class="fa fa-minus"></i></a>
                                                <div class="file-edit">
                                                    <a class="file-edit-btn" @click="addToPlaylist(file)"><i class="fa fa-calendar">Planlæg</i></a>
                                                    <a class="file-edit-btn" @click="deleteFile(file)"><i class="fa fa-times">Slet</i></a>
                                                </div>
                                            </div>
                                            <div class="file-preview">
                                                <div class="file-preview-background">
                                                    <img :src="file.thumb">
                                                </div>
                                            </div>
                                            <div class="file-info">
                                                <p class="file-name"><strong>Filnavn: </strong>@{{ file.text }}</p>
                                                <p class="file-type"><strong>Type: </strong>@{{ file.type }}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

@endsection