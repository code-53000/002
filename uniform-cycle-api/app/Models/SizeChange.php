<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SizeChange extends Model
{
    use HasFactory;

    protected $fillable = [
        'collection_id',
        'inventory_id',
        'original_size_id',
        'new_size_id',
        'reason',
        'performed_by',
        'notes',
    ];

    public function collection()
    {
        return $this->belongsTo(Collection::class, 'collection_id');
    }

    public function inventory()
    {
        return $this->belongsTo(Inventory::class, 'inventory_id');
    }

    public function originalSize()
    {
        return $this->belongsTo(UniformSize::class, 'original_size_id');
    }

    public function newSize()
    {
        return $this->belongsTo(UniformSize::class, 'new_size_id');
    }

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    public function scopeByCollection($query, $collectionId)
    {
        return $query->where('collection_id', $collectionId);
    }

    public function scopeByInventory($query, $inventoryId)
    {
        return $query->where('inventory_id', $inventoryId);
    }

    public function scopeRecent($query, $limit = 20)
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }
}
