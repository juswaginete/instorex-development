<?php

namespace App;

use App\Http\Controllers\ImageEditorResourceController;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\DatabaseNotificationCollection;
use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;

/**
 * App\User
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $password
 * @property int $admin
 * @property string|null $api_login
 * @property string|null $api_password
 * @property string|null $api_network
 * @property string|null $remember_token
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property-read DatabaseNotificationCollection|DatabaseNotification[] $notifications
 * @method static Builder|self whereAdmin($value)
 * @method static Builder|self whereApiLogin($value)
 * @method static Builder|self whereApiPassword($value)
 * @method static Builder|self whereCreatedAt($value)
 * @method static Builder|self whereEmail($value)
 * @method static Builder|self whereId($value)
 * @method static Builder|self whereName($value)
 * @method static Builder|self whereNetworkKey($value)
 * @method static Builder|self wherePassword($value)
 * @method static Builder|self whereRememberToken($value)
 * @method static Builder|self whereUpdatedAt($value)
 * @mixin \Illuminate\Database\Eloquent\Builder
 * @property string|null $network_key
 */
class User extends Authenticatable
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'email',
        'api_login',
        'api_network',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
        'api_password',
    ];

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    /**
     *
     *
     * @param string $password
     * @return $this
     * @author Jesper Skytte Marcussen <jsm@westsoftdevelopment.dk>
     */
    public function setPassword($password)
    {
        $this->password = Hash::make($password);
        return $this;
    }

    /**
     *
     *
     * @param string $apiPassword
     * @return $this
     * @author Jesper Skytte Marcussen <jsm@westsoftdevelopment.dk>
     */
    public function setApiPassword($apiPassword)
    {
        $this->api_password = Crypt::encryptString($apiPassword);
        return $this;
    }

    /**
     *
     *
     * @return string
     * @author Jesper Skytte Marcussen <jsm@westsoftdevelopment.dk>
     */
    public function getApiPassword()
    {
        return Crypt::decryptString($this->api_password);
    }

    public function isAdmin()
    {
        return $this->admin;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function imageEditorResources()
    {
        return $this->hasMany(ImageEditorResourceController::class);
    }
}
