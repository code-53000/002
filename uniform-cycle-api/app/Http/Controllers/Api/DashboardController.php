<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CleaningBatch;
use App\Models\Collection;
use App\Models\Inventory;
use App\Models\Reservation;
use App\Models\ScrapRecord;
use App\Models\UniformStyle;
use App\Models\UniformSize;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->start_date ?? now()->subMonth()->toDateString();
        $endDate = $request->end_date ?? now()->toDateString();

        $stats = [
            'total_collections' => Collection::count(),
            'pending_cleaning' => Collection::byStatus(Collection::STATUS_PENDING_CLEANING)->count(),
            'in_cleaning' => Collection::byStatus(Collection::STATUS_IN_CLEANING)->count(),
            'cleaned' => Collection::byStatus(Collection::STATUS_CLEANED)->count(),
            'in_stock' => Collection::byStatus(Collection::STATUS_IN_STOCK)->count(),
            'distributed' => Collection::byStatus(Collection::STATUS_DISTRIBUTED)->count(),
            'scrapped' => Collection::byStatus(Collection::STATUS_SCRAPPED)->count(),
        ];

        $inventoryStats = [
            'total' => Inventory::count(),
            'available' => Inventory::available()->count(),
            'reserved' => Inventory::byStatus(Inventory::STATUS_RESERVED)->count(),
            'distributed' => Inventory::byStatus(Inventory::STATUS_DISTRIBUTED)->count(),
            'returned' => Inventory::byStatus(Inventory::STATUS_RETURNED)->count(),
            'scrapped' => Inventory::byStatus(Inventory::STATUS_SCRAPPED)->count(),
        ];

        $cleaningStats = [
            'total_batches' => CleaningBatch::count(),
            'pending' => CleaningBatch::pending()->count(),
            'in_progress' => CleaningBatch::inProgress()->count(),
            'completed' => CleaningBatch::byStatus(CleaningBatch::STATUS_COMPLETED)->count(),
        ];

        $reservationStats = [
            'total' => Reservation::count(),
            'pending' => Reservation::pending()->count(),
            'approved' => Reservation::approved()->count(),
            'rejected' => Reservation::byStatus(Reservation::STATUS_REJECTED)->count(),
            'picked_up' => Reservation::byStatus(Reservation::STATUS_PICKED_UP)->count(),
            'cancelled' => Reservation::byStatus(Reservation::STATUS_CANCELLED)->count(),
        ];

        $periodStats = [
            'collections_period' => Collection::whereBetween('collected_at', [$startDate, $endDate])->count(),
            'distributed_period' => Collection::byStatus(Collection::STATUS_DISTRIBUTED)
                ->whereBetween('updated_at', [$startDate, $endDate])->count(),
            'scrapped_period' => ScrapRecord::whereBetween('created_at', [$startDate, $endDate])->count(),
        ];

        $inventoryByStyle = Inventory::query()
            ->selectRaw('style_id, COUNT(*) as count')
            ->groupBy('style_id')
            ->with('style')
            ->get()
            ->map(function ($item) {
                return [
                    'style' => $item->style?->name,
                    'style_code' => $item->style?->code,
                    'count' => $item->count,
                ];
            });

        $inventoryBySize = Inventory::query()
            ->selectRaw('size_id, COUNT(*) as count')
            ->groupBy('size_id')
            ->with('size')
            ->orderByRaw('(SELECT sort_order FROM uniform_sizes WHERE id = inventory.size_id) ASC')
            ->get()
            ->map(function ($item) {
                return [
                    'size' => $item->size?->size_label,
                    'size_group' => $item->size?->size_group,
                    'count' => $item->count,
                ];
            });

        $recentCollections = Collection::with(['style', 'size', 'collectedBy'])
            ->latest('collected_at')
            ->limit(10)
            ->get();

        $recentReservations = Reservation::with(['items.style', 'items.size'])
            ->latest('reserved_at')
            ->limit(10)
            ->get();

        return response()->json([
            'stats' => $stats,
            'inventory' => $inventoryStats,
            'cleaning' => $cleaningStats,
            'reservations' => $reservationStats,
            'period' => $periodStats,
            'inventory_by_style' => $inventoryByStyle,
            'inventory_by_size' => $inventoryBySize,
            'recent_collections' => $recentCollections,
            'recent_reservations' => $recentReservations,
        ]);
    }

    public function inventorySummary()
    {
        $styles = UniformStyle::active()->orderBy('name')->get();
        $sizes = UniformSize::active()->sorted()->get();

        $matrix = [];

        foreach ($styles as $style) {
            foreach ($sizes as $size) {
                $count = Inventory::available()
                    ->where('style_id', $style->id)
                    ->where('size_id', $size->id)
                    ->count();

                if ($count > 0) {
                    $matrix[] = [
                        'style_id' => $style->id,
                        'style_name' => $style->name,
                        'style_code' => $style->code,
                        'size_id' => $size->id,
                        'size_label' => $size->size_label,
                        'size_group' => $size->size_group,
                        'available' => $count,
                    ];
                }
            }
        }

        return response()->json([
            'styles' => $styles,
            'sizes' => $sizes,
            'matrix' => $matrix,
        ]);
    }

    public function statusOverview()
    {
        $collectionStatusCounts = Collection::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $inventoryStatusCounts = Inventory::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $reservationStatusCounts = Reservation::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $batchStatusCounts = CleaningBatch::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'collections' => [
                'pending_cleaning' => $collectionStatusCounts[Collection::STATUS_PENDING_CLEANING] ?? 0,
                'in_cleaning' => $collectionStatusCounts[Collection::STATUS_IN_CLEANING] ?? 0,
                'cleaned' => $collectionStatusCounts[Collection::STATUS_CLEANED] ?? 0,
                'in_stock' => $collectionStatusCounts[Collection::STATUS_IN_STOCK] ?? 0,
                'distributed' => $collectionStatusCounts[Collection::STATUS_DISTRIBUTED] ?? 0,
                'scrapped' => $collectionStatusCounts[Collection::STATUS_SCRAPPED] ?? 0,
            ],
            'inventory' => [
                'available' => $inventoryStatusCounts[Inventory::STATUS_AVAILABLE] ?? 0,
                'reserved' => $inventoryStatusCounts[Inventory::STATUS_RESERVED] ?? 0,
                'distributed' => $inventoryStatusCounts[Inventory::STATUS_DISTRIBUTED] ?? 0,
                'returned' => $inventoryStatusCounts[Inventory::STATUS_RETURNED] ?? 0,
                'scrapped' => $inventoryStatusCounts[Inventory::STATUS_SCRAPPED] ?? 0,
            ],
            'reservations' => [
                'pending' => $reservationStatusCounts[Reservation::STATUS_PENDING] ?? 0,
                'approved' => $reservationStatusCounts[Reservation::STATUS_APPROVED] ?? 0,
                'rejected' => $reservationStatusCounts[Reservation::STATUS_REJECTED] ?? 0,
                'picked_up' => $reservationStatusCounts[Reservation::STATUS_PICKED_UP] ?? 0,
                'cancelled' => $reservationStatusCounts[Reservation::STATUS_CANCELLED] ?? 0,
                'expired' => $reservationStatusCounts[Reservation::STATUS_EXPIRED] ?? 0,
            ],
            'batches' => [
                'pending' => $batchStatusCounts[CleaningBatch::STATUS_PENDING] ?? 0,
                'in_progress' => $batchStatusCounts[CleaningBatch::STATUS_IN_PROGRESS] ?? 0,
                'completed' => $batchStatusCounts[CleaningBatch::STATUS_COMPLETED] ?? 0,
                'cancelled' => $batchStatusCounts[CleaningBatch::STATUS_CANCELLED] ?? 0,
            ],
        ]);
    }
}
