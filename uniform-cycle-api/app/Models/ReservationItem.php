<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReservationItem extends Model
{
    use HasFactory;

    const STATUS_PENDING = 'pending';
    const STATUS_ALLOCATED = 'allocated';
    const STATUS_PICKED_UP = 'picked_up';
    const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'reservation_id',
        'inventory_id',
        'style_id',
        'size_id',
        'quantity',
        'status',
        'notes',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class, 'reservation_id');
    }

    public function inventory()
    {
        return $this->belongsTo(Inventory::class, 'inventory_id');
    }

    public function style()
    {
        return $this->belongsTo(UniformStyle::class, 'style_id');
    }

    public function size()
    {
        return $this->belongsTo(UniformSize::class, 'size_id');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByReservation($query, $reservationId)
    {
        return $query->where('reservation_id', $reservationId);
    }

    public function canAllocate()
    {
        return $this->status === self::STATUS_PENDING && $this->inventory_id === null;
    }

    public function canPickup()
    {
        return $this->status === self::STATUS_ALLOCATED;
    }

    public function canCancel()
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_ALLOCATED]);
    }
}
