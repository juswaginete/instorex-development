<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ImageEditorResource extends Model
{
    protected $fillable = [
        'name',
        'resource',
        'user_id',
        'image',
        'virtualPath'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function user()
    {
        return $this->hasOne(User::class);
    }

    public function getResourceAttribute($value)
    {
        return json_decode($value);
    }
}
