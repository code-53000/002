<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    const ROLE_ADMIN = 'admin';
    const ROLE_VOLUNTEER = 'volunteer';
    const ROLE_LAUNDRY = 'laundry';
    const ROLE_PARENT = 'parent';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'real_name',
        'department',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function collections()
    {
        return $this->hasMany(Collection::class, 'collected_by');
    }

    public function inspectedCollections()
    {
        return $this->hasMany(Collection::class, 'inspected_by');
    }

    public function cleaningBatches()
    {
        return $this->hasMany(CleaningBatch::class, 'created_by');
    }

    public function checkedCleaningItems()
    {
        return $this->hasMany(CleaningItem::class, 'checked_by');
    }

    public function stockedInventory()
    {
        return $this->hasMany(Inventory::class, 'stocked_by');
    }

    public function approvedReservations()
    {
        return $this->hasMany(Reservation::class, 'approved_by');
    }

    public function distributedReservations()
    {
        return $this->hasMany(Reservation::class, 'distributed_by');
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class, 'performed_by');
    }

    public function sizeChanges()
    {
        return $this->hasMany(SizeChange::class, 'performed_by');
    }

    public function approvedScrapRecords()
    {
        return $this->hasMany(ScrapRecord::class, 'approved_by');
    }

    public function performedScrapRecords()
    {
        return $this->hasMany(ScrapRecord::class, 'performed_by');
    }

    public function createdStyles()
    {
        return $this->hasMany(UniformStyle::class, 'created_by');
    }

    public function createdSizes()
    {
        return $this->hasMany(UniformSize::class, 'created_by');
    }

    public function isAdmin()
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isVolunteer()
    {
        return $this->role === self::ROLE_VOLUNTEER;
    }

    public function isLaundry()
    {
        return $this->role === self::ROLE_LAUNDRY;
    }

    public function isParent()
    {
        return $this->role === self::ROLE_PARENT;
    }
}
