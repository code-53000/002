<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UniformStyle extends Model
{
    use HasFactory, SoftDeletes;

    const GENDER_MALE = 'male';
    const GENDER_FEMALE = 'female';
    const GENDER_UNISEX = 'unisex';

    const CATEGORY_SUMMER = 'summer';
    const CATEGORY_WINTER = 'winter';
    const CATEGORY_SPORTS = 'sports';
    const CATEGORY_CEREMONY = 'ceremony';

    protected $fillable = [
        'name',
        'code',
        'description',
        'gender',
        'category',
        'original_price',
        'cycle_price',
        'is_active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'original_price' => 'decimal:2',
            'cycle_price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function collections()
    {
        return $this->hasMany(Collection::class, 'style_id');
    }

    public function inventory()
    {
        return $this->hasMany(Inventory::class, 'style_id');
    }

    public function reservationItems()
    {
        return $this->hasMany(ReservationItem::class, 'style_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByGender($query, $gender)
    {
        return $query->where('gender', $gender);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}
