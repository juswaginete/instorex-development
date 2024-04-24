@extends('layouts.unauthorized')

@section('content')
    <div class="row">
        <div class="col-6 mx-auto">
            <div class="card mt-3 ">
                <div class="card-body">
                    <h4 class="card-title">Error {{ $statusCode ?: '' }}</h4>

                    @if ($errorMsg)
                        <p class="card-text">The error was: </p>
                        <p class="card-text">{{ join('</p><p class="card-text">', (array)$errorMsg) }}</p>
                    @else
                        <p class="card-text">An unknown error happened and we couldn't process with the request.</p>
                    @endif
                </div>
            </div>
        </div>
    </div>

@endsection
