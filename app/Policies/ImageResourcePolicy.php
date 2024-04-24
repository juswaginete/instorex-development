<?php

namespace App\Policies;

use App\ImageEditorResource;
use App\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ImageResourcePolicy
{
    use HandlesAuthorization;

    /**
     * Override everything else if admin!
     * @param $user
     * @param $ability
     * @return bool
     */
    public function before($user, $ability)
    {
        if ($user->admin == 1) {
            return true;
        }
    }


    /**
     * @param User $user
     * @param ImageEditorResource $resource
     * @return bool
     */
    public function show(User $user, ImageEditorResource $resource)
    {
        return $resource->user_id === $user->id;
    }

    /**
     * @param User $user
     * @param ImageEditorResource $resource
     * @return bool
     */
    public function update(User $user, ImageEditorResource $resource)
    {
        return $resource->user_id === $user->id;
    }

    /**
     * @param User $user
     * @param ImageEditorResource $resource
     * @return bool
     */
    public function delete(User $user, ImageEditorResource $resource)
    {
        return $resource->user_id === $user->id;
    }
}
