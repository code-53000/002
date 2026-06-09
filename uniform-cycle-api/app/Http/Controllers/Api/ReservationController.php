<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ApproveReservationRequest;
use App\Http\Requests\PickupReservationRequest;
use App\Http\Requests\RejectReservationRequest;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Requests\UpdateReservationRequest;
use App\Models\Collection;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\Reservation;
use App\Models\ReservationItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $query = Reservation::with(['approvedBy', 'distributedBy']);

        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        if ($request->has('pending')) {
            $query->pending();
        }

        if ($request->has('approved')) {
            $query->approved();
        }

        if ($request->has('phone')) {
            $query->byPhone($request->phone);
        }

        if ($request->has('child_grade')) {
            $query->where('child_grade', $request->child_grade);
        }

        $reservations = $query->orderBy('reserved_at', 'desc')->paginate($request->per_page ?? 15);

        return response()->json($reservations);
    }

    public function store(StoreReservationRequest $request)
    {
        $reservationNo = 'RES-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));

        $reservation = Reservation::create([
            ...$request->validated(),
            'reservation_no' => $reservationNo,
            'status' => Reservation::STATUS_PENDING,
        ]);

        foreach ($request->items as $item) {
            ReservationItem::create([
                'reservation_id' => $reservation->id,
                'style_id' => $item['style_id'],
                'size_id' => $item['size_id'],
                'quantity' => $item['quantity'],
                'status' => ReservationItem::STATUS_PENDING,
                'notes' => $item['notes'] ?? null,
            ]);
        }

        return response()->json([
            'message' => 'Reservation created successfully',
            'reservation' => $reservation->load('items.style', 'items.size'),
        ], 201);
    }

    public function show(Reservation $reservation)
    {
        return response()->json([
            'reservation' => $reservation->load([
                'approvedBy',
                'distributedBy',
                'items.style',
                'items.size',
                'items.inventory',
            ]),
        ]);
    }

    public function update(UpdateReservationRequest $request, Reservation $reservation)
    {
        if ($reservation->status !== Reservation::STATUS_PENDING) {
            return response()->json([
                'message' => 'Only pending reservations can be updated',
            ], 400);
        }

        $reservation->update($request->validated());

        return response()->json([
            'message' => 'Reservation updated successfully',
            'reservation' => $reservation->load('items.style', 'items.size'),
        ]);
    }

    public function destroy(Reservation $reservation)
    {
        if (! $reservation->canCancel()) {
            return response()->json([
                'message' => 'This reservation cannot be cancelled',
            ], 400);
        }

        $reservation->items()->update([
            'status' => ReservationItem::STATUS_CANCELLED,
        ]);

        $reservation->items->each(function ($item) {
            if ($item->inventory) {
                $item->inventory->update([
                    'status' => Inventory::STATUS_AVAILABLE,
                ]);

                InventoryLog::create([
                    'inventory_id' => $item->inventory_id,
                    'action' => InventoryLog::ACTION_STATUS_CHANGE,
                    'old_status' => Inventory::STATUS_RESERVED,
                    'new_status' => Inventory::STATUS_AVAILABLE,
                    'reason' => '预约取消',
                    'performed_by' => auth()->id(),
                ]);
            }
        });

        $reservation->update([
            'status' => Reservation::STATUS_CANCELLED,
        ]);

        return response()->json([
            'message' => 'Reservation cancelled successfully',
        ]);
    }

    public function approve(ApproveReservationRequest $request, Reservation $reservation)
    {
        if (! $reservation->canApprove()) {
            return response()->json([
                'message' => 'This reservation cannot be approved',
            ], 400);
        }

        $reservation->update([
            'status' => Reservation::STATUS_APPROVED,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'notes' => $request->notes,
        ]);

        if ($request->allocate_items) {
            $this->autoAllocateItems($reservation);
        }

        return response()->json([
            'message' => 'Reservation approved successfully',
            'reservation' => $reservation->load('items.style', 'items.size', 'items.inventory'),
        ]);
    }

    public function reject(RejectReservationRequest $request, Reservation $reservation)
    {
        if (! $reservation->canReject()) {
            return response()->json([
                'message' => 'This reservation cannot be rejected',
            ], 400);
        }

        $reservation->update([
            'status' => Reservation::STATUS_REJECTED,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => $request->rejection_reason,
        ]);

        $reservation->items()->update([
            'status' => ReservationItem::STATUS_CANCELLED,
        ]);

        return response()->json([
            'message' => 'Reservation rejected successfully',
            'reservation' => $reservation->fresh(),
        ]);
    }

    public function pickup(PickupReservationRequest $request, Reservation $reservation)
    {
        if (! $reservation->canPickup()) {
            return response()->json([
                'message' => 'This reservation cannot be picked up',
            ], 400);
        }

        $pickedUpAt = $request->picked_up_at ?? now();
        $itemIds = $request->item_ids;

        $items = $reservation->items();

        if ($itemIds) {
            $items->whereIn('id', $itemIds);
        }

        $items = $items->get();

        foreach ($items as $item) {
            if (! $item->canPickup()) {
                continue;
            }

            $oldStatus = $item->inventory->status;

            $item->update([
                'status' => ReservationItem::STATUS_PICKED_UP,
            ]);

            $item->inventory->update([
                'status' => Inventory::STATUS_DISTRIBUTED,
            ]);

            $item->inventory->collection->update([
                'status' => Collection::STATUS_DISTRIBUTED,
            ]);

            InventoryLog::create([
                'inventory_id' => $item->inventory_id,
                'action' => InventoryLog::ACTION_DISTRIBUTE,
                'old_status' => $oldStatus,
                'new_status' => Inventory::STATUS_DISTRIBUTED,
                'reason' => '领取发放',
                'performed_by' => auth()->id(),
                'notes' => "家长: {$reservation->parent_name}, 学生: {$reservation->child_name}",
            ]);
        }

        $allPickedUp = $reservation->items()->where('status', '!=', ReservationItem::STATUS_PICKED_UP)->count() === 0;

        if ($allPickedUp) {
            $reservation->update([
                'status' => Reservation::STATUS_PICKED_UP,
                'picked_up_at' => $pickedUpAt,
                'distributed_by' => auth()->id(),
            ]);
        }

        return response()->json([
            'message' => 'Reservation picked up successfully',
            'reservation' => $reservation->fresh()->load('items.inventory'),
        ]);
    }

    protected function autoAllocateItems(Reservation $reservation)
    {
        $items = $reservation->items()->where('status', ReservationItem::STATUS_PENDING)->get();

        foreach ($items as $item) {
            for ($i = 0; $i < $item->quantity; $i++) {
                $inventory = Inventory::available()
                    ->where('style_id', $item->style_id)
                    ->where('size_id', $item->size_id)
                    ->where('gender', function ($query) use ($item) {
                        $query->where('gender', $item->reservation->child_name ? 'unisex' : 'unisex')
                              ->orWhere('gender', 'unisex');
                    })
                    ->first();

                if ($inventory) {
                    $oldStatus = $inventory->status;

                    $item->update([
                        'inventory_id' => $inventory->id,
                        'status' => ReservationItem::STATUS_ALLOCATED,
                    ]);

                    $inventory->update([
                        'status' => Inventory::STATUS_RESERVED,
                    ]);

                    InventoryLog::create([
                        'inventory_id' => $inventory->id,
                        'action' => InventoryLog::ACTION_ALLOCATE,
                        'old_status' => $oldStatus,
                        'new_status' => Inventory::STATUS_RESERVED,
                        'reason' => '自动分配预约',
                        'performed_by' => auth()->id(),
                    ]);
                }
            }
        }
    }
}
