<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UniformSize extends Model
{
    use HasFactory, SoftDeletes;

    const SIZE_GROUP_CHILD = 'child';
    const SIZE_GROUP_ADULT = 'adult';

    protected $fillable = [
        'size_label',
        'size_group',
        'sort_order',
        'description',
        'height_min',
        'height_max',
        'is_active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function collections()
    {
        return $this->hasMany(Collection::class, 'size_id');
    }

    public function inventory()
    {
        return $this->hasMany(Inventory::class, 'size_id');
    }

    public function reservationItems()
    {
        return $this->hasMany(ReservationItem::class, 'size_id');
    }

    public function originalSizeChanges()
    {
        return $this->hasMany(SizeChange::class, 'original_size_id');
    }

    public function newSizeChanges()
    {
        return $this->hasMany(SizeChange::class, 'new_size_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByGroup($query, $group)
    {
        return $query->where('size_group', $group);
    }

    public function scopeSorted($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('size_label', 'asc');
    }
}
