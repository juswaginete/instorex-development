<?php

namespace App;

use Illuminate\Http\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use \Mimey\MimeTypes;
use UnexpectedValueException;

class DataURIFile extends UploadedFile
{
    /**
     *
     * Regex adapted from Brian Grinstead code.
     *
     * @see https://gist.github.com/bgrins/6194623
     *
     * @param string $data
     * @param string $originalName The original file name
     * @param bool   $strict Fails if input contains character from outside the base64
     *
     */
    public function __construct($data, $originalName, $strict = true)
    {
        if (!preg_match('/^data:([a-z0-9][a-z0-9\!\#\$\&\-\^\_\+\.]{0,126}\/[a-z0-9][a-z0-9\!\#\$\&\-\^\_\+\.]{0,126}(;[a-z0-9\-]+\=[a-z0-9\-]+)?)?(;base64)?,([a-z0-9\!\$\&\\\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$)/i', $data, $matches)) {
            throw new UnexpectedValueException('The provided "data:" URI is not valid.');
        }

        $mimes = new MimeTypes();
        $extension =  $mimes->getExtension($matches[1]);

        parent::__construct(
            $this->restoreToTemporary($matches[4], $extension, $strict),
            $originalName,
            $matches[1]
        );
    }

    /**
     * @param string $encoded base64 encoded file content
     * @param string $extension
     *
     * @param bool $strict
     * @return string
     */
    private function restoreToTemporary($encoded, $extension, $strict = true)
    {
        if (false === $decoded = base64_decode($encoded, $strict)) {
            throw new FileException('Unable to decode strings as base64');
        }

        $directory =  sys_get_temp_dir() . DIRECTORY_SEPARATOR;
        $fileName =  Str::random(40) . '.' . $extension;
        $path = $directory . $fileName;

        if (false === touch($path)) {
            throw new FileException(
                sprintf('Unable to create the file "%s" into the "%s" directory', $fileName, $directory)
            );
        }

        if (false === file_put_contents($path, $decoded, FILE_BINARY)) {
            throw new FileException(sprintf('Unable to write the file "%s"', $path));
        }

        return $path;
    }
}
