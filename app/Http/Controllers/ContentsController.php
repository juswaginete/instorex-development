<?php

namespace App\Http\Controllers;

use App\Facades\BSApi;
use App\Helper;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use WSD\BrightSignApi\Entity\Application\ArrayOfContent;
use WSD\BrightSignApi\Entity\Application\ArrayOfint;
use WSD\BrightSignApi\Entity\Application\DeleteContent;
use WSD\BrightSignApi\Entity\Application\GetFolderContent;
use WSD\BrightSignApi\Entity\Application\MainService;
use WSD\BrightSignApi\Entity\Application\GetContentFolders;
use WSD\BrightSignApi\Entity\ContentUpload\AppendChunk;
use WSD\BrightSignApi\Entity\ContentUpload\CancelFileUpload;
use WSD\BrightSignApi\Entity\ContentUpload\CompleteFileUpload;
use WSD\BrightSignApi\Entity\ContentUpload\ContentUploadArguments;
use WSD\BrightSignApi\Entity\ContentUpload\ContentUploadService;
use WSD\BrightSignApi\Entity\ContentUpload\StartFileUpload;

class ContentsController extends Controller
{

    const CHUNK_SIZE = 256 * 1000;

    /**
     * @return MainService
     * @author Jesper Skytte Marcussen <jsm@westsoftdevelopment.dk>
     */
    private function getAC()
    {
        /** @noinspection PhpUndefinedMethodInspection */
        return BSApi::getApplicationClient();
    }

    /**
     * @return ContentUploadService
     * @author Jesper Skytte Marcussen <jsm@westsoftdevelopment.dk>
     */
    private function getUC()
    {
        /** @noinspection PhpUndefinedMethodInspection */
        return BSApi::getContentUploadClient();
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $cf = new GetContentFolders("\\");
        $contentFolderList = $this->getAC()->GetContentFolders($cf);
        $folders = $contentFolderList->getGetContentFoldersResult();

        return view('contents.index', ['folders' => $folders]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Receive upload file
        $contentTypes = $request->get('type'); // 'Image' or Video or Audio
        $virtualPath = $request->get('path');
        $files = $request->file('file');
        if (!is_array($files)) {
            return response()->json(['error' => 'No files received'], 409);
        }

        /**
         * Developer: Anders Andersen (West soft)
         * Comment: Quick fix before presentation
         */
        if ($virtualPath == "#") {
            $virtualPath = '\\';
        }

        $errors = [];

        collect($files)->each(function ($file, $index) use ($contentTypes, $virtualPath, &$errors) {
            /** @var UploadedFile $file */
            $fileName = $file->getClientOriginalName();
            $contentType = $contentTypes[$index];

            $errors += Helper::storeFileBrightSign($file, $fileName, $contentType, $virtualPath);
        });

        // If all files has no errors
        if (collect($errors)->every(null, false)) {
            return response()->json(null, 204);
        }
        return response()->json([
            'status' => $errors
        ], 409);
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     *
     * @return \Illuminate\Http\Response
     * @throws \SoapFault
     */
    public function show($id)
    {
        return $this->files($id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     *
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            $response = $this->getAC()->DeleteContent(new DeleteContent((new ArrayOfint())->setInt([$id])));
        } catch (\Exception $e) {
            $response = false;
        }

        if ($response !== false && $response->getDeleteContentResult()) {
            return response(null, 204);
        }
        return response(null, 409);
    }

    private function filesToJson(ArrayOfContent $files)
    {
        if ($files->count() === 0) {
            return [];
        }
        $data = [];
        foreach ($files as $file) {
            $playlists = [];
            foreach ($file->getDynamicPlaylists()->getDynamicPlaylistInfo() ?: [] as $dpi) {
                $playlists[$dpi->getId()] = $dpi->getName();
            }
            $data[] = [
                'id' => $file->getId(),
                'parent' => '#',
                'text' => $file->getFileName(),
                'path' => $file->getPhysicalPath(),
                'virtual_path' => $file->getVirtualPath(),
                'type' => $file->getType(),
                'size' => $file->getFileSize(),
                'thumb' => str_replace('http://', 'https://', $file->getThumbPath()),
                'date_uploaded' => $file->getUploadDate()->format('Y-m-d H:i:s'),
                'playlists' => $playlists,
                'deletable' => (count($playlists) + $file->getPresentations()->count()) === 0
            ];
        }
        return $data;
    }

    private function files($folder)
    {
        $files = [];
        $lastFetched = null;

        if ($folder == "#") {
            $folder = "\\";
        }

        do {
            $folderContent = $this->getAC()->GetFolderContent(new GetFolderContent($folder, $lastFetched, 100));
            $content = $folderContent->getGetFolderContentResult();
            $files = array_merge($files, $this->filesToJson($content->getItems()));
            $lastFetched = $content->getNextMarker();
        } while ($content->getIsTruncated());

        return response()->json($files);
    }
}
