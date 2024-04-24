<?php

namespace App\Http\Controllers;

use App\Facades\BSApi;
use Illuminate\Http\Request;
use WSD\BrightSignApi\Entity\Application\ArrayOfContentFolder;
use WSD\BrightSignApi\Entity\Application\ArrayOfint;
use WSD\BrightSignApi\Entity\Application\ContentFolder;
use WSD\BrightSignApi\Entity\Application\CreateContentFolder;
use WSD\BrightSignApi\Entity\Application\DeleteContent;
use WSD\BrightSignApi\Entity\Application\GetContentFolders;
use WSD\BrightSignApi\Entity\Application\MainService;

class FoldersController extends Controller
{

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
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $cf = new GetContentFolders("\\");
        $contentFolderList = $this->getAC()->GetContentFolders($cf);
        return response()->json($this->foldersToJson($contentFolderList->getGetContentFoldersResult()));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $contentFolder = new ContentFolder();
        $contentFolder->setName($request->get('folder'));
        $contentFolder->setVirtualPath($request->get('path'));
        try {
            $cf = $this->getAC()->CreateContentFolder(new CreateContentFolder($contentFolder));
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 409);
        }
        return response()->json([
            'id' => $cf->getCreateContentFolderResult()->getId(),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $response = $this->getAC()->DeleteContent(new DeleteContent((new ArrayOfint())->setInt([$id])));
        if ($response->getDeleteContentResult()) {
            return response(null, 204);
        }
        return response(null, 409);
    }

    /**
     * @param ArrayOfContentFolder $folders
     * @return array
     * @author Jesper Skytte Marcussen <jsm@westsoftdevelopment.dk>
     */
    private function foldersToJson(ArrayOfContentFolder $folders)
    {
        $data = [];
        foreach ($folders as $folder) {
            $data[] = [
                'id' => $folder->getVirtualPath() . $folder->getName() . '\\',
                'internal_id' => $folder->getId(),
                'parent' => $folder->getVirtualPath() === '\\' ? '#' : $folder->getVirtualPath(),
                'text' => $folder->getName(),
                'state' => [
                    'opened' => false,
                    'disabled' => false,
                    'selected' => false,
                ],
                'li_attr' => [],
                'a_attr' => [],
            ];
        }
        return $data;
    }
}
