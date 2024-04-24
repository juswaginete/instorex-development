@extends('layouts.unauthorized')

@section('content')
    <div class="container-fluid">
        <div class="row loginPage">
            <div class="col-md-8 col-lg-5 mx-auto mt-5">
                <h1>VELKOMMEN TIL <span class="h1-orange">INSTORE-X</span></h1>
                <div class="card">
                    <div class="card-body">
                        <div class="card-title"><h3 class="orange-text">LOG IND</h3></div>
                        <form method="POST" action="{{ route('login') }}">
                            {{ csrf_field() }}

                            <div class="form-group">
                                <input id="email" type="email" required autofocus
                                       class="form-control{{ $errors->has('email') ? ' is-invalid' : '' }}"
                                       name="email" value="{{ old('email') }}"
                                       placeholder="Indtast brugernavn (email adresse)">

                                @if ($errors->has('email'))
                                    <span class="invalid-feedback">
                                    <strong>{{ $errors->first('email') }}</strong>
                                </span>
                                @endif
                            </div>

                            <div class="form-group{{ $errors->has('password') ? ' has-error' : '' }}">

                                <input id="password" type="password" class="form-control" name="password" required
                                       placeholder="Indtast kodeord">

                                @if ($errors->has('password'))
                                    <span class="help-block">
                                    <strong>{{ $errors->first('password') }}</strong>
                                </span>
                                @endif
                            </div>

                            <div class="form-group">
                                <div class="checkbox">
                                    <label>
                                        <input type="checkbox" name="remember" {{ old('remember') ? 'checked' : '' }}>
                                        Husk mig
                                    </label>
                                </div>
                            </div>

                            <div class="form-group">
                                <button class="btn btn-warning">LOG IND</button>
                                <span class="forgot-pasword">Glemt dit kodeord?<a class="btn btn-link "
                                                                                   href="{{ route('password.request') }}">Klik her</a></span>
                            </div>
                        </form>
                    </div>
                </div>
                <img src="{{ URL::to('/assets/images/auditive-logo.png') }}">

            </div>
        </div>
    </div>
@endsection
