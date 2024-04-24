<?php

use WSD\BrightSignApi\Entity\Application\DynamicPlaylist;

/**
 * @type DynamicPlaylist $list
 * @type boolean $deletable
 */
?>

@extends('layouts.app')

@section('content')
    <style>
        .file-chooser a.file-header {
            display: none;
        }
        #playlist .file a.file-header:first-child {
            display: block;
        }
    </style>
<div id="file-chooser">
    <div class="row">
        <div class="col-md-8">
            <div class="card">
                <div class="card-body">
                    <h2 class="orange-text">RET SPILLELISTE - {{$list->getName()}}</h2>
                    <p>Aktive filer er vist nedenfor i prioriteret rækkefølge</p>
                    <div id="playlist" class="file-thumbs editable" data-playlist-type="{{ $type }}"
                         data-empty-text="Loading playlist...">
                        <div class="file"
                             v-for="(file, index) in playlist"
                             :data-id="file.id"
                             :data-duration="file.duration"
                             :data-start="file.date_start"
                             :data-end="file.date_end"
                             :data-filename="file.text"
                             :data-type="file.type.toLowerCase()">
                            <a class="file-header" @click="toggleFileShow(index)"><i class="fa fa-plus"></i></a>
                            <div class="file-overlay" v-show="file.show">
                                <a class="file-header" @click="toggleFileShow(index)"><i class="fa fa-minus"></i></a>
                                <div class="file-edit">
                                    <a class="file-edit-btn" @click="showLimitDialog($event)"><i class="fa fa-calendar">Planlæg</i></a>
                                    <a class="file-edit-btn" @click="showDurationDialog($event)"><i class="fa fa-clock-o">Varighed</i></a>
                                    <a class="file-edit-btn" @click="removeFile($event)"><i class="fa fa-times">Slet</i></a>
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
                <div class="card-footer">
                    <button style="float: right" class="btn btn-warning" @click="savePlaylist()">GEM</button>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card">
                <div class="card-body">
                    <h3><span class="orange-text">TILFØJ</span> CONTENT</h3>
                    <p>Træk udvalgt fil over for at tilføje til spillelisten</p>
                    <div class="file-chooser">
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
                                <div class="file-container col-md-4" v-for="(folder, index) in allFolders" v-if="folder.parent == currentFolder"  @click="chooseFolder(folder)">
                                    <div class="folder">
                                        <i class="fa fa-folder"></i>
                                        <span class="folder-title">@{{ folder.text }}</span>
                                    </div>
                                </div>
                                <div class="file-container col-md-4" v-for="(file, index) in allFiles" :key="file.id" style="cursor: pointer;">
                                    <div :class="['file']"
                                         :data-id="file.id"
                                         :data-duration="file.duration ? file.duration : 15"
                                         :data-start="file.date_start ? file.date_start : ''"
                                         :data-end="file.date_end ? file.date_end : ''"
                                         :data-filename="file.text"
                                         :data-type="file.type.toLowerCase()">
                                        <a class="file-header" @click="toggleFileShow(index)"><i class="fa fa-plus"></i></a>
                                        <div class="file-overlay" v-show="file.show">
                                            <a class="file-header" @click="toggleFileShow(index)"><i class="fa fa-minus"></i></a>
                                            <div class="file-edit">
                                                <a class="file-edit-btn" @click="showLimitDialog($event)"><i class="fa fa-calendar">Planlæg</i></a>
                                                <a class="file-edit-btn" @click="showDurationDialog($event)"><i class="fa fa-clock-o">Varighed</i></a>
                                                <a class="file-edit-btn" @click="removeFile($event)"><i class="fa fa-times">Slet</i></a>
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

<input type="hidden" name="playlistId" value="{{ $list->getId() }}"/>
<input type="hidden" name="type" id="type" value="{{ $type }}"/>

@endsection