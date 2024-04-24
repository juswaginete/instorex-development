<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('login', 'Auth\LoginController@showLoginForm')->name('login');
Route::post('login', 'Auth\LoginController@login');
Route::get('logout', 'Auth\LoginController@logout')->name('logout');

// Password Reset Routes...
Route::get('password/reset', 'Auth\ForgotPasswordController@showLinkRequestForm')->name('password.request');
Route::post('password/email', 'Auth\ForgotPasswordController@sendResetLinkEmail')->name('password.email');
Route::get('password/reset/{token}', 'Auth\ResetPasswordController@showResetForm')->name('password.reset');
Route::post('password/reset', 'Auth\ResetPasswordController@reset');

Route::middleware(['auth'])->group(function () {
    Route::get('/', function () {
        if (!Auth::user()->admin) {
            return redirect('home');
        }
        return redirect('users');
    });

    Route::get('home', function () {
        return view('home');
    });

    Route::post('playlists/mass_add', 'PlaylistsController@massAdd');
    Route::post('playlists/mass_remove', 'PlaylistsController@massRemove');
    Route::resource('playlists', 'PlaylistsController', ['only' => ['index', 'edit', 'update']]);

    Route::resource('folders', 'FoldersController', ['only' => ['index', 'store', 'destroy']]);

    Route::get('contents/files', 'ContentsController@files');
    Route::resource('contents', 'ContentsController', ['only' => ['index', 'store', 'show', 'destroy']]);

    Route::get('me', 'UsersController@me')->name('users.me');
    Route::put('me', 'UsersController@saveMe')->name('users.saveMe');

    Route::get('image-editor/list', 'ImageEditorController@index')->name('image-editor.index');
    Route::get('image-editor', 'ImageEditorController@show')->name('image-editor.show');
    Route::get('image-editor-resource/{imageEditorResource}/delete', 'ImageEditorController@delete')->name('image-editor.delete');

    Route::prefix('image-editor-resource')->group(function () {
        Route::get('', 'ImageEditorResourceController@index')->name('image-editor-resource.index');
        Route::post('', 'ImageEditorResourceController@create')->name('image-editor-resource.create');
        Route::get('{imageEditorResource}', 'ImageEditorResourceController@show')->name('image-editor-resource.show');
        Route::put('{imageEditorResource}', 'ImageEditorResourceController@update')->name('image-editor-resource.update');
    });

    Route::middleware(['admin'])->group(function () {
        Route::get('users/{id}/delete', 'UsersController@destroy')->name('users.destroy');
        Route::resource('users', 'UsersController', ['except' => [
            'show', 'destroy'
        ]]);
    });
});
