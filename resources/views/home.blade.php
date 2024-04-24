<?php
/**
 * @var WSD\BrightSignApi\Entity\Application\DynamicPlaylist[] $playlists
 */
?>
@extends('layouts.app')

@section('content')
    <div class="col-md-8 col-lg-8 mx-auto mt-5 homePage" style="align-items: center;">
        <h1>VELKOMMEN TIL <span class="h1-orange">INSTORE-X</span></h1>
        <h5>Klik på kasserne nedenfor for at udføre ønsket handling</h5>
        <div class="row">
            <div class="col-md-4">
                <a href="{{ route('image-editor.index') }}">
                    <div class="menu-item">
                        <i class="fa fa-pencil"></i>
                        <h4>SKAB CONTENT</h4>
                    </div>
                </a>
            </div>
            <div class="col-md-4">
                <a href="{{ route('contents.index') }}">
                    <div class="menu-item">
                        <i class="fa fa-upload"></i>
                        <h4>HÅNDTER CONTENT</h4>
                    </div>
                </a>
            </div>
            <div class="col-md-4">
                <a href="{{ route('playlists.index') }}">
                    <div class="menu-item">
                        <i class="fa fa-podcast"></i>
                        <h4>LIVE CONTENT</h4>
                    </div>
                </a>
            </div>
        </div>
    </div>
@endsection



