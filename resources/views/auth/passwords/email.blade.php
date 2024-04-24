@extends('layouts.unauthorized')

@section('content')
    <div class="col-md-8 col-lg-6 mx-auto mt-5 loginPage">
        <div class="card">
            <div class="card-body">
                <h4 class="card-title">Reset Password</h4>
                @if (session('status'))
                    <div class="alert alert-success">
                        {{ session('status') }}
                    </div>
                @endif

                <form method="POST" action="{{ route('password.email') }}">
                    {{ csrf_field() }}

                    <div class="form-group{{ $errors->has('email') ? ' has-error' : '' }}">
                        <label for="email">E-Mail Address</label>

                        <input id="email" type="email" class="form-control" name="email"
                               value="{{ old('email') }}" required>

                        @if ($errors->has('email'))
                            <span class="help-block">
                                <strong>{{ $errors->first('email') }}</strong>
                            </span>
                        @endif
                    </div>

                    <div class="form-group text-right">
                        <button type="submit" class="btn btn-warning">
                            Nulstil kodeord
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection
