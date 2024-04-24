@extends('layouts.app')

@section('content')

    <h1>Min konto</h1>

    <form action="{{ route('users.saveMe') }}" method="post">
        <div class="row">
        {{ csrf_field() }}
        {{ method_field('PUT') }}
            <div class="col-md-6 mx-auto">
                @if (session('updated', false))
                    <div class="alert alert-success">
                        Dit password er blevet opdateret.
                    </div>
                @endif
                <div class="card">
                    <div class="card-body">
                        <h4 class="card-title">Bruger information</h4>
                        <div class="form-group">
                            <label for="name">Navn</label>
                            <input type="text" name="name" value="{{ $user->name }}" class="form-control" title="name" disabled/>
                        </div>
                        <div class="form-group">
                            <label for="email">E-mail</label>
                            <input type="email" name="email" value="{{ $user->email }}" class="form-control" title="E-mail" disabled/>
                        </div>
                        <div class="form-group">
                            <label for="password">Angiv nyt password</label>
                            <input type="password" name="password" value="" title="Set new password" class="form-control {{ $errors->has('password') ? 'is-invalid' : '' }}"/>
                            @if ($errors->has('password'))
                                <span class="invalid-feedback">{{ $errors->first('password') }}</span>
                            @endif
                        </div>
                    </div>
                    <div class="card-footer">
                        <button style="float:right;" type="submit" class="btn btn-warning">{{ 'Opdater' }}</button>
                    </div>
                </div>
            </div>
        </div>
    </form>
@endsection