@extends('layouts.app')

@section('content')

    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <h1 style="text-align: left;">Bruger</h1>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-body">
                        <table class="table table-striped table-hover table-white-bg">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            @foreach ($users as $user)
                                <tr>
                                    <td>{{ $user->name }}</td>
                                    <td>{{ $user->email }}</td>
                                    <td>
                                        <a href="{{ action('UsersController@edit', ['id' => $user->id]) }}" class="mr-3 color-orange">Edit</a>
                                        @if (!$user->admin)
                                            <a href="{{ action('UsersController@destroy', ['id' => $user->id]) }}" class="color-orange">Delete</a>
                                        @endif
                                    </td>
                                </tr>
                            @endforeach
                            </tbody>
                        </table>
                    </div>
                    <div class="card-footer">
                        <a class="btn btn-warning pull-right" href="{{ action('UsersController@create') }}">Create new user</a>
                    </div>
                </div>

            </div>
        </div>
    </div>
@endsection