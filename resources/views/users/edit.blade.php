@extends('layouts.app')

@section('content')
    <div class="container">
        <h1>{{ $edit ? 'Edit user' : 'Create new user' }}</h1>
        <form action="{{ $edit ? action('UsersController@update', [$user->id]) : action('UsersController@store') }}" method="post">
            {{ csrf_field() }}
            {{ method_field($edit ? 'PUT' : 'POST') }}
            <div class="row">

                <div class="col-md-6 mx-auto">
                    <div class="card">
                        <div class="card-body">
                            <h4 class="card-title">User information</h4>
                            <div class="form-group">
                                <label for="name">Name</label>
                                <input type="text" name="name" value="{{ old('name') ?: $user->name }}" class="form-control {{ $errors->has('name') ? 'is-invalid' : '' }}" title="Name"/>
                                @if ($errors->has('name'))
                                    <span class="invalid-feedback">{{ $errors->first('name') }}</span>
                                @endif
                            </div>
                            <div class="form-group">
                                <label for="email">E-mail</label>
                                <input type="email" name="email" value="{{ old('email') ?: $user->email }}" class="form-control {{ $errors->has('email') ? 'is-invalid' : '' }}" title="E-mail"/>
                                @if ($errors->has('email'))
                                    <span class="invalid-feedback">{{ $errors->first('email') }}</span>
                                @endif
                            </div>
                            <div class="form-group">
                                <label for="password">Password</label>
                                <input type="password" name="password" value="" class="form-control {{ $errors->has('password') ? 'is-invalid' : '' }}" title="Password"/>
                                @if ($errors->has('password'))
                                    <span class="invalid-feedback">{{ $errors->first('password') }}</span>
                                @endif
                                @if ($edit)
                                    <span class="help-block">Please only enter a password, if you want to change the current password. Else just leave this field blank.</span>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>

                @if (!$edit || !$user->admin)
                    <div class="col-md-6 mt-3 mt-md-0 mx-auto">
                        <div class="card">
                            <div class="card-body">
                                <h4 class="card-title">BrightSign</h4>
                                @if ($errors->has('api'))
                                    <span class="text-danger">{{ $errors->first('api') }}</span>
                                @endif
                                <div class="form-group">
                                    <label for="api_login">Username</label>
                                    <input type="text" name="api_login"
                                           value="{{ old('api_login') ?: $user->api_login }}"
                                           class="form-control {{ $errors->has('api_login') ? 'is-invalid' : '' }}" title="Username"/>
                                    @if ($errors->has('api_login'))
                                        <span class="invalid-feedback">{{ $errors->first('api_login') }}</span>
                                    @endif
                                </div>
                                <div class="form-group">
                                    <label for="api_network">Network Name</label>
                                    <input type="text" name="api_network"
                                           value="{{ old('api_network') ?: $user->api_network }}"
                                           class="form-control {{ $errors->has('api_network') ? 'is-invalid' : '' }}" title="Network Name"/>
                                    @if ($errors->has('api_network'))
                                        <span class="invalid-feedback">{{ $errors->first('api_network') }}</span>
                                    @endif
                                </div>
                                <div class="form-group">
                                    <label for="api_password">Password</label>
                                    <input type="password" name="api_password" class="form-control {{ $errors->has('api_password') ? 'is-invalid' : '' }}" title="Password"/>
                                    @if ($errors->has('api_password'))
                                        <span class="invalid-feedback">{{ $errors->first('api_password') }}</span>
                                    @endif
                                    @if ($edit)
                                        <span class="help-block">Please only enter a password, if you want to change the current password. Else just leave this field blank.</span>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                @endif
            </div>
            <div class="row">
                <div class="col text-right mt-3">
                    <button type="submit" class="btn btn-warning">{{ $edit ? 'Update' : 'Create' }}</button>
                </div>
            </div>
        </form>
    </div>
@endsection