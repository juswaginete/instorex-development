<?php

namespace App\Http\Controllers;

use App\ImageEditorResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImageEditorController extends Controller
{

    /**
     * Display content list
     * @param ImageEditorResource $imageEditorResource
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function index(ImageEditorResource $imageEditorResource)
    {
        $userResources = $imageEditorResource->where('user_id', Auth::user()->id)->get();
        return view('image-editor.index', [
            'imageResources' => $userResources,
        ]);
    }

    /**
     * Show a single content
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function show()
    {
        return view('image-editor.show', [
            'templateSizes' => [
                ['name' => 'Stor skærm - Landskab', 'w' => 1920, 'h' => 1080],
                ['name' => 'Lille skærm - Landskab', 'w' => 640, 'h' => 480],
                ['name' => 'Stor skærm - Portræt', 'w' => 1080, 'h' => 1920],
                ['name' => 'Lille skærm - Portræt', 'w' => 480, 'h' => 640],
             ],
        ]);
    }

    /**
     * Delete a giving content
     * @param ImageEditorResource $imageEditorResource
     * @return \Illuminate\Http\RedirectResponse
     */
    public function delete(ImageEditorResource $imageEditorResource)
    {
        $this->authorize('update', $imageEditorResource);

        $imageEditorResource->delete();
        return redirect()->back();
    }
}
