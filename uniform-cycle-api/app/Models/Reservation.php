<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reservation extends Model
{
    use HasFactory, SoftDeletes;

    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';
    const STATUS_PICKED_UP = 'picked_up';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_EXPIRED = 'expired';

    protected $fillable = [
        'reservation_no',
        'parent_name',
        'parent_phone',
        'child_name',
        'child_grade',
        'child_class',
        'status',
        'reserved_at',
        'expires_at',
        'picked_up_at',
        'approved_by',
        'approved_at',
        'distributed_by',
        'rejection_reason',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'reserved_at' => 'datetime',
            'expires_at' => 'datetime',
            'picked_up_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    public function items()
    {
        return $this->hasMany(ReservationItem::class, 'reservation_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function distributedBy()
    {
        return $this->belongsTo(User::class, 'distributed_by');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function scopeByPhone($query, $phone)
    {
        return $query->where('parent_phone', $phone);
    }

    public function canApprove()
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function canReject()
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function canPickup()
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function canCancel()
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_APPROVED]);
    }

    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast() && $this->status === self::STATUS_APPROVED;
    }
}
