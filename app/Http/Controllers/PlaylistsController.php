<?php

namespace App\Http\Controllers;

use App\Facades\BSApi;
use Illuminate\Http\Request;
use WSD\BrightSignApi\Entity\Application\ArrayOfDynamicPlaylistContent;
use WSD\BrightSignApi\Entity\Application\ArrayOfint;
use WSD\BrightSignApi\Entity\Application\AudioDynamicPlaylist;
use WSD\BrightSignApi\Entity\Application\Content;
use WSD\BrightSignApi\Entity\Application\DynamicPlaylist;
use WSD\BrightSignApi\Entity\Application\DynamicPlaylistContent;
use WSD\BrightSignApi\Entity\Application\GetDynamicPlaylist;
use WSD\BrightSignApi\Entity\Application\GetDynamicPlaylists;
use WSD\BrightSignApi\Entity\Application\GetSpecifiedContent;
use WSD\BrightSignApi\Entity\Application\ImageVideoDynamicPlaylist;
use WSD\BrightSignApi\Entity\Application\MainService;
use WSD\BrightSignApi\Entity\Application\UpdateDynamicPlaylist;

class PlaylistsController extends Controller
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
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            return response()->json([
                'playlists' => $this->getPlaylists(
                    $request->get('type')
                )->values()
            ]);
        }
        return view('playlists.index', [
            'playlists' => $this->getPlaylists(),
        ]);
    }
//
//    /**
//     * Show the form for creating a new resource.
//     *
//     * @return \Illuminate\Http\Response
//     */
//    public function create()
//    {
//        return view('playlists.create', []);
//    }
//
//    /**
//     * Store a newly created resource in storage.
//     *
//     * @param  \Illuminate\Http\Request $request
//     *
//     * @return \Illuminate\Http\Response
//     */
//    public function store(Request $request)
//    {
//        if (!$request->isJson()) {
//            return response('Wrong request type', 409);
//        }
//        if ($request->get('type') == 'audio') {
//            $dp = new AudioDynamicPlaylist();
//        } else {
//            $dp = new ImageVideoDynamicPlaylist();
//        }
//        $dp->setName($request->get('name'));
//
//        try {
//            $request = $this->getAC()->CreateDynamicPlaylist(new CreateDynamicPlaylist($dp));
//        } catch (\Exception $e) {
//            return response()->json([
//                'error' => $e->getMessage()
//            ], 409);
//        }
//        return response()->json([
//            'success' => true,
//            'id' => $request->getCreateDynamicPlaylistResult()->getId()
//        ]);
//    }
//
//    /**
//     * Display the specified resource.
//     *
//     * @param  int $id
//     *
//     * @return \Illuminate\Http\Response
//     */
//    public function show($id)
//    {
//        try {
//            $dpl = $this->getDynamicPlaylistData($id);
//        } catch (\Exception $e) {
//            return response()
//                ->view('errors.error', [
//                    'statusCode' => 404,
//                    'errorMsg' => $e->getMessage(),
//                ]);
//        }
//        return view('playlists.show', $dpl);
//    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request, $id)
    {
        try {
            $dpl = $this->getDynamicPlaylistData($id);
        } catch (\Exception $e) {
            return abort(404, $e->getMessage());
        }
        if ($request->expectsJson()) {
            return response()->json($dpl)->header('Vary', 'Accept');
        }
        return view('playlists.edit', [
            'list' => $dpl['list'],
            'deletable' => $dpl['deletable'],
            'type' => $dpl['type'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $dynamicPlaylistId
     *
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $dynamicPlaylistId)
    {
        $files = collect($request->get('files'))
            ->map(function ($file) {
                /** @noinspection PhpParamsInspection */
                return (new DynamicPlaylistContent())
                    ->setContentId($file['id'])
                    ->setFileName($file['filename'])
                    ->setDisplayDuration('PT' . $file['duration'] . 'S')
                    ->setValidityStartDate(isset($file['start']) ? (new \DateTime($file['start'])) : null)
                    ->setValidityEndDate(isset($file['end']) ? (new \DateTime($file['end'])) : null);
            });

        $list = $this
            ->getAC()
            ->GetDynamicPlaylist(new GetDynamicPlaylist($dynamicPlaylistId, true))
            ->getGetDynamicPlaylistResult();
        $list
            ->setContent((new ArrayOfDynamicPlaylistContent())->setDynamicPlaylistContent($files->toArray()));

        try {
            $updated = $this
                ->getAC()
                ->UpdateDynamicPlaylist(new UpdateDynamicPlaylist($list))
                ->getUpdateDynamicPlaylistResult();
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 409);
        }

        return response()->json([
            'success' => $updated
        ]);
    }

    /**
     * Add a single content file to multiple playlists at once.
     *
     * @param Request $request
     * @author Jesper Skytte Marcussen <jsm@westsoftdevelopment.dk>
     * @return \Illuminate\Http\JsonResponse
     */
    public function massAdd(Request $request)
    {
        ini_set('max_execution_time', 0);
        $contentId = $request->get('content_id');
        $playlists = $request->get('playlist_ids');
        $dateStart = $request->get('start_date');
        $dateEnd = $request->get('end_date');

        /** @noinspection PhpParamsInspection */
        $dynamicPlaylistContent = (new DynamicPlaylistContent())
            ->setContentId($contentId)
            ->setFileName($request->get('file_name'))
            ->setDisplayDuration('PT' . ($request->get('duration') ?: 0) . 'S')
            ->setValidityStartDate($dateStart ? (new \DateTime($dateStart . ':00')) : null)
            ->setValidityEndDate($dateEnd ? (new \DateTime($dateEnd . ':00')) : null);

        $status = [];

        foreach ($playlists as $playlistId) {
            $list = $this
                ->getAC()
                ->GetDynamicPlaylist(new GetDynamicPlaylist($playlistId, true))
                ->getGetDynamicPlaylistResult();
            $list->getContent()->offsetSet(null, $dynamicPlaylistContent);

            try {
                $updated = $this
                    ->getAC()
                    ->UpdateDynamicPlaylist(new UpdateDynamicPlaylist($list))
                    ->getUpdateDynamicPlaylistResult();
            } catch (\Exception $e) {
                $updated = $e->getMessage();
            }
            $status[$playlistId] = $updated;
        }

        return response()->json(['status' => $status]);
    }

    /**
     * Remove a single content file from multiple playlists at once.
     *
     * @param Request $request
     * @author Jesper Skytte Marcussen <jsm@westsoftdevelopment.dk>
     * @return \Illuminate\Http\JsonResponse
     */
    public function massRemove(Request $request)
    {
        ini_set('max_execution_time', 0);
        $contentId = $request->get('content_id');
        $playlists = $request->get('playlist_ids');

        $status = [];

        foreach ($playlists as $playlistId) {
            $list = $this
                ->getAC()
                ->GetDynamicPlaylist(new GetDynamicPlaylist($playlistId, true))
                ->getGetDynamicPlaylistResult();


            $contents = $list->getContent()->getDynamicPlaylistContent();

            foreach ($contents as $key => $content) {
                if ($content->getContentId() === $contentId) {
                    unset($contents[$key]);
                }
            }
            $list = $list->setContent((new ArrayOfDynamicPlaylistContent())->setDynamicPlaylistContent($contents));

            try {
                $updated = $this
                    ->getAC()
                    ->UpdateDynamicPlaylist(new UpdateDynamicPlaylist($list))
                    ->getUpdateDynamicPlaylistResult();
            } catch (\Exception $e) {
                $updated = $e->getMessage();
            }
            $status[$playlistId] = $updated;
        }

        return response()->json(['status' => $status]);
    }

//    /**
//     * Remove the specified resource from storage.
//     *
//     * @param  int $id
//     *
//     * @return \Illuminate\Http\Response
//     */
//    public function destroy($id)
//    {
//        $json = ['success' => false];
//        try {
//            $request = $this
//                ->getAC()
//                ->DeleteDynamicPlaylists(new DeleteDynamicPlaylists((new ArrayOfint())->setInt([$id])));
//            $json['success'] = $request->getDeleteDynamicPlaylistsResult();
//        } catch (\Exception $e) {
//            return response()->json(['error' => $e->getMessage()], 409);
//        }
//        return response()->json($json);
//    }

    private static function intervalToSeconds($interval)
    {
        $interval = new \DateInterval($interval);
        return $interval->d * 86400 + $interval->h * 3600 + $interval->i * 60 + $interval->s;
    }

    /**
     *
     *
     * @param $dynamicPlaylistId
     * @return array
     * @throws \Exception
     * @author Jesper Skytte Marcussen <jsm@westsoftdevelopment.dk>
     */
    private function getDynamicPlaylistData($dynamicPlaylistId)
    {
        $result = $this->getAC()->GetDynamicPlaylist(new GetDynamicPlaylist($dynamicPlaylistId, true));
        $list = $result->getGetDynamicPlaylistResult();

        if ($list === null) {
            throw new \Exception('No such Dynamic Playlist');
        }

        $dynamicPlaylistContents = $list->getContent()->getDynamicPlaylistContent() ?: [];

        $contents = $this->getContent(array_map(function (DynamicPlaylistContent $dpc) {
            return $dpc->getContentId();
        }, $dynamicPlaylistContents));

        $tz = new \DateTimeZone('Europe/Copenhagen');
        $contents = array_map(function (DynamicPlaylistContent $dpc) use ($contents, $tz) {
            $content = $contents[$dpc->getContentId()];
            return [
                'id' => $dpc->getContentId(),
                'text' => $dpc->getFileName(),
                'duration' => self::intervalToSeconds($dpc->getDisplayDuration()),
                'date_start' => $dpc
                    ->getValidityStartDate() ? $dpc->getValidityStartDate()->setTimezone($tz)->format('Y-m-d H:i:s') :
                    null,
                'date_end' => $dpc
                    ->getValidityEndDate() ? $dpc->getValidityEndDate()->setTimezone($tz)->format('Y-m-d H:i:s') :
                    null,
                'thumb' => str_replace('http://', 'https://', $content->getThumbPath()),
                'type' => $content->getType(),

            ];
        }, $dynamicPlaylistContents);

        return [
            'list' => $list,
            'type' => $list instanceof AudioDynamicPlaylist ? 'audio' : 'imagevideo',
            'deletable' => $list->getPresentations()->count() === 0,
            'contents' => $contents,
        ];
    }

    /**
     * Return a list of content based on an array of content ids, keyed by id.
     *
     * @param int[] $ids
     * @return Content[]
     * @author Jesper Skytte Marcussen <jsm@westsoftdevelopment.dk>
     */
    private function getContent($ids)
    {
        $contents = $this
            ->getAC()
            ->GetSpecifiedContent(new GetSpecifiedContent((new ArrayOfint())->setInt($ids)))
            ->getGetSpecifiedContentResult();
        $contents = $contents ? $contents->getContent() : [];
        return array_reduce($contents, function ($result, Content $item) {
            $result[$item->getId()] = $item;
            return $result;
        }, []);
    }

    /**
     *
     *
     * @param null $type
     * @return \Illuminate\Support\Collection
     * @throws \SoapFault
     * @author Jesper Skytte Marcussen <jsm@westsoftdevelopment.dk>
     */
    private function getPlaylists($type = null)
    {
        $lists = collect();
        $nextMarker = null;
        try {
            do {
                $result = $this
                    ->getAC()
                    ->GetDynamicPlaylists(new GetDynamicPlaylists($nextMarker, 100))
                    ->getGetDynamicPlaylistsResult();
                $nextMarker = $result->getNextMarker();
                $lists = $lists->merge($result->getItems()->getDynamicPlaylist());
            } while ($result->getIsTruncated());
        } catch (\SoapFault $e) {
            throw $e;
        }
        if ($type !== null) {
            $instance = strtolower($type) === 'audio' ? AudioDynamicPlaylist::class : ImageVideoDynamicPlaylist::class;
            $lists = $lists->filter(function (DynamicPlaylist $playlist) use ($instance) {
                return $playlist instanceof $instance;
            });
        }
        return $lists;
    }
}
