<?php

namespace App;

use App\Facades\BSApi;
use WSD\BrightSignApi\Entity\ContentUpload\AppendChunk;
use WSD\BrightSignApi\Entity\ContentUpload\CancelFileUpload;
use WSD\BrightSignApi\Entity\ContentUpload\CompleteFileUpload;
use WSD\BrightSignApi\Entity\ContentUpload\ContentType;
use WSD\BrightSignApi\Entity\ContentUpload\ContentUploadArguments;
use WSD\BrightSignApi\Entity\ContentUpload\StartFileUpload;

class Helper
{

    const UPLOAD_CHUNK_SIZE = 256 * 1000;

    /**
     * @param \Symfony\Component\HttpFoundation\File\File $file
     * @param string $fileName
     * @param \WSD\BrightSignApi\Entity\ContentUpload\ContentType $contentType
     * @param string $virtualPath
     * @return array
     */
    public static function storeFileBrightSign($file, $fileName, $contentType, $virtualPath)
    {
        $splFile = $file->openfile();
        $fileSize = $splFile->getSize();

        $chunksCount = ceil($fileSize / self::UPLOAD_CHUNK_SIZE);

        // Create start arguments
        $arguments = new ContentUploadArguments();
        $arguments->setFileName($fileName);
        $arguments->setFileSize($fileSize);
        /** @noinspection PhpParamsInspection */
        $arguments->setContentType($contentType);
        $arguments->setChunksCount($chunksCount);
        $arguments->setVirtualPath($virtualPath);

        /** @var \WSD\BrightSignApi\Entity\Application\MainService $client */
        $client = BSApi::getContentUploadClient();
        $startFileUploadStatus = $client->StartFileUpload(new StartFileUpload($arguments));
        $contentUploadStatus = $startFileUploadStatus->getStartFileUploadResult();
        $error = false;

        for ($i = 0; $i < $chunksCount; $i++) {
            $offset = $i * self::UPLOAD_CHUNK_SIZE;
            $splFile->fseek($offset);
            try {
                /** @noinspection PhpParamsInspection */
                $appendStatus = $client->AppendChunk(
                    new AppendChunk(
                        null,
                        $contentUploadStatus->getUploadToken(),
                        $i,
                        $splFile->fread(self::UPLOAD_CHUNK_SIZE),
                        $offset
                    )
                );
                if ($appendStatus->getAppendChunkResult() !== true) {
                    $error = $appendStatus->getAppendChunkResult();
                    break;
                }
            } catch (\Exception $e) {
                $error = $e->getMessage();
            }
        }

        // Clean up
        $tmpFile = $splFile->getPathname();
        // Reset file pointer by setting $file to null
        $splFile = null;
        unlink($tmpFile);

        if ($error !== false) {
            $client->CancelFileUpload(new CancelFileUpload($contentUploadStatus->getUploadToken()));
            return [$fileName => $error];
        }

        $arguments->setUploadToken($contentUploadStatus->getUploadToken());
        try {
            $client->CompleteFileUpload(new CompleteFileUpload($arguments));
        } catch (\Exception $e) {
            $msg = $e->getMessage();
            if ($msg === 'The creator of this fault did not specify a Reason.' &&
                isset($e->detail) && is_object($e->detail) &&
                isset($e->detail->FileUploadFault) &&
                is_object($e->detail->FileUploadFault)) {
                $msg = $e->detail->FileUploadFault->Message;
            }

            return [$fileName => $msg];
        }
        return [$fileName => false];
    }
}
