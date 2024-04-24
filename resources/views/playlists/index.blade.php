<?php
/**
 * @var WSD\BrightSignApi\Entity\Application\DynamicPlaylist[] $playlists
 */
?>
@extends('layouts.app')

@section('content')
    <div class="col-md-10 col-lg-10 mx-auto mt-5">
        <h3>
            <span class="h3-orange"><i class="fa fa-podcast"></i> LIVE</span> CONTENT - HQ
        </h3>

        <table class="table table-striped table-hover table-theme">
            <thead>
            <tr>
                <td align="left">SPILLELISTER</td>
                <td class="pull-right">
                    <!--
                    <div class="input-group search-field">
                        <span class="input-group-addon" id="basic-addon1"><i class="fa fa-search"></i> </span>
                        <input type="text" class="form-control" placeholder="Søg playlister" aria-describedby="basic-addon1">
                    </div>
                    -->
                </td>
            </tr>
            </thead>
            <tbody>
            @foreach ($playlists as $list)
                <tr data-dpl-id="{{ $list->getId() }}">
                    <td align="left">
                        {{ $list->getName() }}
                    </td>
                    <td class="text-right">
                        <a class="btn btn-outline-warning" href="{{url('/playlists/' . $list->getId() . '/edit')}}">
                            <i class="fa fa-pencil"></i>RET
                        </a>
                    </td>
                </tr>
            @endforeach
            </tbody>
        </table>
    </div>

@endsection
