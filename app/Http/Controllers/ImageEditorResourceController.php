<?php

namespace App\Http\Controllers;

use App\DataURIFile;
use App\Helper;
use App\ImageEditorResource;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\Serializer\Normalizer\DataUriNormalizer;
use WSD\BrightSignApi\Entity\ContentUpload\ContentType;

class ImageEditorResourceController extends Controller
{
    private $imageEditorResource;

    public function __construct(ImageEditorResource $imageEditorResource)
    {
        $this->imageEditorResource = $imageEditorResource;
    }

    /**
     * Display a index list!
     * @return \Illuminate\Support\Collection
     */
    public function index()
    {
        return $this->imageEditorResource->where('user_id', Auth::user()->id)->get();
    }

    /**
     * Show a giving content!
     * @param ImageEditorResource $imageEditorResource
     * @return ImageEditorResource
     */
    public function show(ImageEditorResource $imageEditorResource)
    {
        $this->authorize('update', $imageEditorResource);

        return $imageEditorResource;
    }

    /**
     * Update giving content!
     * @param Request $request
     * @param ImageEditorResource $imageEditorResource
     * @return ImageEditorResource|\Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    public function update(Request $request, ImageEditorResource $imageEditorResource)
    {
        $this->authorize('update', $imageEditorResource);

        $this->validate($request, [
            'name' => 'required|string',
            'resource' => 'required',
            'image' => 'required|string',
            'virtualPath' => 'required|string',
        ]);
        $data = $request->only(['name', 'resource', 'image', 'virtualPath']);
        $data['resource'] = json_encode($data['resource']);

        $imageEditorResource->update($data);

        $image = new DataURIFile($data['image'], $data['name']);
        Helper::storeFileBrightSign($image, $data['name'].'.png', ContentType::Image, $data['virtualPath']);

        return $imageEditorResource;
    }

    public function create(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|string',
            'resource' => 'required',
            'image' => 'required|string',
            'virtualPath' => 'required|string',
        ]);
        $data = $request->only(['name', 'resource', 'image', 'virtualPath']);
        $data['resource'] = json_encode($data['resource']);
        $data['user_id'] = Auth::user()->id;


        /**
         * Pixieditor fix!
         * Breaks in no main image exists in the resource
         */
        $resource = request('resource');
        $hasMainImage = false;
        foreach ($resource['state']['objects'] as $object) {
            if ($object['type'] == "image" && $object['name'] == "mainImage") {
                $hasMainImage = true;
            }
        }

        if (!$hasMainImage) {
            foreach ($resource['state']['objects'] as &$object) {
                $object['name'] = 'mainImage';
                break;
            }
        }
        // End pixi editor fix!


        $data['resource'] = json_encode($resource); // Bind resources
        $created = ImageEditorResource::create($data);

        $image = new DataURIFile($data['image'], $data['name']);
        Helper::storeFileBrightSign($image, $data['name'].'.png', ContentType::Image, $data['virtualPath']);

        return $created;
    }
}
