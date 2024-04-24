<?php
/*
 * @var WSD\BrightSignApi\Entity\Application\DynamicPlaylist $list
 * /
?>
@extends('layouts.app')

@section('content')
    <h1>Show Dynamic Playlist</h1>

    <div class="card">
        <div class="card-body">
            <dl>
                <dt>Name: </dt>
                <dd>{{ $list->getName() }}</dd>

                <dt>Date Created: </dt>
                <dd>{{ $list->getCreationDate()->format('Y-m-d H:i:s') }}</dd>

                <dt>Number of presentations using this playlist: </dt>
                <dd>{{ $list->getPresentations()->count() }}</dd>
            </dl>

            <table class="table">
                <thead>
                <tr>
                    <td></td>
                    <td>Filename</td>
                    <td>Display Duration</td>
                    <td>Start Date</td>
                    <td>End Date</td>
                </tr>
                </thead>
                <tbody>
                @foreach ($contents as $content)
                    <tr>
                        <td><img class="img-thumbnail" src="{{ $content['thumb'] }}" alt="Thumbnail" /></td>
                        <td>{{ $content['text'] }}</td>
                        <td>{{ $content['duration'] }}</td>
                        <td>{{ $content['date_start'] }}</td>
                        <td>{{ $content['date_end'] }}</td>
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
    </div>
@endsection
