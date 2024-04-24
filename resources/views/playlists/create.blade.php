<?php /*

@extends('layouts.app')

@section('content')
    <div class="card mb-3">
        <div class="card-body">
            <h4 class="card-title">Create new Dynamic Playlist</h4>

            <form id="newDynamicPlaylistForm">
                <div class="form-group">
                    <label>Type of Dynamic Playlist</label>
                    <div class="form-check">
                        <label class="form-check-label">
                            <input class="form-check-input" type="radio" name="type" value="audio" checked>
                            AudioDynamicPlaylist - Playlist containing audio
                        </label>
                    </div>
                    <div class="form-check">
                        <label class="form-check-label">
                            <input class="form-check-input" type="radio" name="type" value="imagevideo">
                            ImageVideoDynamicPlaylist - Playlist containing videos and images
                        </label>
                    </div>
                </div>
                <div class="form-group">
                  <label for="name=">Name of the Dynamic Playlist</label>
                  <input type="text" class="form-control" name="name" required aria-required="true" />
              </div>
                <div class="form-group text-right">
                    <button type="submit" class="btn btn-primary">Create</button>
                </div>
            </form>
        </div>
    </div>

@endsection
