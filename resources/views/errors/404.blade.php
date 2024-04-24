<?php
/**
 * @var \Symfony\Component\HttpKernel\Exception\HttpException $exception
 */
?>

@extends('layouts.unauthorized')

@section('content')
    <div class="row">
        <div class="col-6 mx-auto">
            <div class="card mt-3 ">
                <div class="card-body">
                    <h4 class="card-title">Error {{ $exception->getStatusCode() ?: '' }}</h4>

                    @if ($exception->getMessage())
                        <p class="card-text">The error was: </p>
                        <p class="card-text">{{ join('</p><p class="card-text">', (array)$exception->getMessage()) }}</p>
                    @else
                        <p class="card-text">An unknown error happened and we couldn't process with the request.</p>
                    @endif
                </div>
            </div>
        </div>
    </div>

@endsection
