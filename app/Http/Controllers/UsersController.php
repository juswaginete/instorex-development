<?php

namespace App\Http\Controllers;

use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\MessageBag;
use Illuminate\Validation\Rule;
use Validator;
use WSD\BrightSignApi\Api;
use WSD\BrightSignApi\Entity\Application\Authenticate;

class UsersController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('users.index', [
            'users' => User::all()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return view('users.edit', [
            'edit' => false,
            'user' => new User()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        Validator::make($request->all(), [
            'name' => 'required',
            'email' => [
                'required',
                Rule::unique('users'),
            ],
            'password' => 'required|min:8',
            'api_login' => 'required',
            'api_password' => 'required',
            'api_network' => 'required',
        ])->validate();

        $user = new User([
            'name' => $request->get('name'),
            'email' => $request->get('email'),
            'api_login' => $request->get('api_login'),
            'api_network' => $request->get('api_network'),
        ]);
        $user->setPassword($request->get('password'));
        $user->setApiPassword($request->get('api_password'));

        if (!$this->testApi($user->api_login, $user->getApiPassword(), $user->api_network)) {
            return back()
                ->withErrors(new MessageBag(['api' => 'We couldn\'t connect to the API with the given credentials.']))
                ->withInput($request->except(['password', 'api_password']));
        }

        if (!$user->save()) {
            return back()->withInput($request->except(['password', 'api_password']));
        }
        return redirect('/users');
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        return view('users.edit', [
            'edit' => true,
            'user' => User::find($id),
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        $validation = [
            'name' => 'required',
            'email' => [
                'required',
                Rule::unique('users')->ignore($id),
            ],
            'password' => 'nullable|min:8',
        ];
        if (!$user->isAdmin()) {
            $validation += [
                'api_login' => 'required',
                'api_network' => 'required',
            ];
        }
        Validator::make($request->all(), $validation)->validate();

        $user->fill($request->all());

        if ($request->has('password')) {
            $user->setPassword($request->get('password'));
        }
        if ($request->has('api_password')) {
            $user->setApiPassword($request->get('api_password'));
        }

        if (!$user->isAdmin() && !$this->testApi($user->api_login, $user->getApiPassword(), $user->api_network)) {
            return back()
                ->withErrors(new MessageBag(['api' => 'We couldn\'t connect to the API with the given credentials.']))
                ->withInput($request->except(['password', 'api_password']));
        }

        if (!$user->save()) {
            return back()->withInput($request->except(['password', 'api_password']));
        }
        return redirect('/users');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            abort(404);
        }
        if (!$user->delete()) {
            abort(500);
        }
        return redirect('/users');
    }

    public function me()
    {
        return view('users.me', [
            'user' => auth()->user()
        ]);
    }

    public function saveMe(Request $request)
    {
        Validator::make($request->all(), [
            'password' => [
                'required',
                'min:8'
            ],
        ])->validate();

        $user = Auth::user();
        if (!$user->setPassword($request->get('password'))->save()) {
            return back(500)->withErrors(new MessageBag([
                'internal' => "An internal error happened, and we couldn't update the password. Please try again."
            ]));
        }
        return back()->with('updated', true);
    }

    private function testApi($user, $password, $network)
    {
        $api = new Api();
        $api->setAuthenticationOptions($user, $password, $network);
        try {
            $response = $api->getApplicationClient()->Authenticate(new Authenticate())->getAuthenticateResult();
        } catch (\Exception $e) {
            $response = false;
        }
        return !!$response;
    }
}
