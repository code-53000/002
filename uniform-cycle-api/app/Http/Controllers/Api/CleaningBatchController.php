<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddCleaningItemsRequest;
use App\Http\Requests\CompleteCleaningBatchRequest;
use App\Http\Requests\StoreCleaningBatchRequest;
use App\Http\Requests\UpdateCleaningBatchRequest;
use App\Models\CleaningBatch;
use App\Models\CleaningItem;
use App\Models\Collection;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CleaningBatchController extends Controller
{
    public function index(Request $request)
    {
        $query = CleaningBatch::with('createdBy');

        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        if ($request->has('pending')) {
            $query->pending();
        }

        if ($request->has('in_progress')) {
            $query->inProgress();
        }

        $batches = $query->orderBy('received_at', 'desc')->paginate($request->per_page ?? 15);

        return response()->json($batches);
    }

    public function store(StoreCleaningBatchRequest $request)
    {
        $batchNo = 'BAT-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));

        $batch = CleaningBatch::create([
            ...$request->validated(),
            'batch_no' => $batchNo,
            'created_by' => auth()->id(),
            'status' => CleaningBatch::STATUS_PENDING,
        ]);

        if ($request->has('collection_ids') && count($request->collection_ids) > 0) {
            $this->addCollectionsToBatch($batch, $request->collection_ids);
            $batch->updateCounts();
        }

        return response()->json([
            'message' => 'Cleaning batch created successfully',
            'batch' => $batch->load('createdBy', 'items'),
        ], 201);
    }

    public function show(CleaningBatch $cleaningBatch)
    {
        return response()->json([
            'batch' => $cleaningBatch->load([
                'createdBy',
                'items.collection.style',
                'items.collection.size',
                'items.checkedBy',
                'inventory',
            ]),
        ]);
    }

    public function update(UpdateCleaningBatchRequest $request, CleaningBatch $cleaningBatch)
    {
        $cleaningBatch->update($request->validated());

        return response()->json([
            'message' => 'Cleaning batch updated successfully',
            'batch' => $cleaningBatch->load('createdBy'),
        ]);
    }

    public function destroy(CleaningBatch $cleaningBatch)
    {
        if ($cleaningBatch->status !== CleaningBatch::STATUS_PENDING) {
            return response()->json([
                'message' => 'Only pending batches can be deleted',
            ], 400);
        }

        $cleaningBatch->items()->delete();
        $cleaningBatch->delete();

        return response()->json([
            'message' => 'Cleaning batch deleted successfully',
        ]);
    }

    public function addItems(AddCleaningItemsRequest $request, CleaningBatch $cleaningBatch)
    {
        if (! $cleaningBatch->canAddItems()) {
            return response()->json([
                'message' => 'Cannot add items to this batch',
            ], 400);
        }

        $added = $this->addCollectionsToBatch($cleaningBatch, $request->collection_ids);
        $cleaningBatch->updateCounts();

        return response()->json([
            'message' => "Added {$added} items to batch successfully",
            'batch' => $cleaningBatch->load('items.collection'),
        ]);
    }

    public function start(CleaningBatch $cleaningBatch)
    {
        if (! $cleaningBatch->canStart()) {
            return response()->json([
                'message' => 'This batch cannot be started',
            ], 400);
        }

        $cleaningBatch->update([
            'status' => CleaningBatch::STATUS_IN_PROGRESS,
            'started_at' => now(),
        ]);

        $cleaningBatch->items()->update([
            'status' => CleaningItem::STATUS_WASHING,
            'started_at' => now(),
        ]);

        $cleaningBatch->items->each(function ($item) {
            $item->collection->update([
                'status' => Collection::STATUS_IN_CLEANING,
            ]);

            InventoryLog::create([
                'collection_id' => $item->collection_id,
                'action' => InventoryLog::ACTION_STATUS_CHANGE,
                'old_status' => Collection::STATUS_PENDING_CLEANING,
                'new_status' => Collection::STATUS_IN_CLEANING,
                'reason' => '开始清洗',
                'performed_by' => auth()->id(),
            ]);
        });

        return response()->json([
            'message' => 'Batch started successfully',
            'batch' => $cleaningBatch->fresh(),
        ]);
    }

    public function complete(CompleteCleaningBatchRequest $request, CleaningBatch $cleaningBatch)
    {
        if (! $cleaningBatch->canComplete()) {
            return response()->json([
                'message' => 'This batch cannot be completed',
            ], 400);
        }

        $completedAt = $request->completed_at ?? now();

        $cleaningBatch->update([
            'status' => CleaningBatch::STATUS_COMPLETED,
            'completed_at' => $completedAt,
            'notes' => $request->notes,
        ]);

        $cleaningBatch->items()
            ->where('status', '!=', CleaningItem::STATUS_DAMAGED)
            ->where('status', '!=', CleaningItem::STATUS_SCRAPPED)
            ->update([
                'status' => CleaningItem::STATUS_COMPLETED,
                'completed_at' => $completedAt,
            ]);

        $cleaningBatch->items->each(function ($item) use ($completedAt) {
            if ($item->status === CleaningItem::STATUS_COMPLETED) {
                $item->collection->update([
                    'status' => Collection::STATUS_CLEANED,
                ]);

                InventoryLog::create([
                    'collection_id' => $item->collection_id,
                    'action' => InventoryLog::ACTION_STATUS_CHANGE,
                    'old_status' => Collection::STATUS_IN_CLEANING,
                    'new_status' => Collection::STATUS_CLEANED,
                    'reason' => '清洗完成',
                    'performed_by' => auth()->id(),
                ]);
            }
        });

        $cleaningBatch->updateCounts();

        return response()->json([
            'message' => 'Batch completed successfully',
            'batch' => $cleaningBatch->fresh(),
        ]);
    }

    protected function addCollectionsToBatch(CleaningBatch $batch, array $collectionIds)
    {
        $added = 0;

        foreach ($collectionIds as $collectionId) {
            $collection = Collection::find($collectionId);

            if ($collection && $collection->canAddToBatch()) {
                $existing = CleaningItem::where('collection_id', $collectionId)->exists();

                if (! $existing) {
                    CleaningItem::create([
                        'batch_id' => $batch->id,
                        'collection_id' => $collectionId,
                        'status' => CleaningItem::STATUS_PENDING,
                    ]);

                    $added++;
                }
            }
        }

        return $added;
    }
}
