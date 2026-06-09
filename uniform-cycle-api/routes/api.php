<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CleaningBatchController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\ScrapRecordController;
use App\Http\Controllers\Api\SizeChangeController;
use App\Http\Controllers\Api\UniformSizeController;
use App\Http\Controllers\Api\UniformStyleController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
    ]);
});

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::get('/user', [AuthController::class, 'user'])->name('user');
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('dashboard')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard.index');
        Route::get('/inventory-summary', [DashboardController::class, 'inventorySummary'])->name('dashboard.inventory-summary');
        Route::get('/status-overview', [DashboardController::class, 'statusOverview'])->name('dashboard.status-overview');
    });

    Route::apiResource('uniform-styles', UniformStyleController::class)
        ->parameters(['uniform-styles' => 'uniformStyle']);

    Route::apiResource('uniform-sizes', UniformSizeController::class)
        ->parameters(['uniform-sizes' => 'uniformSize']);

    Route::apiResource('collections', CollectionController::class);
    Route::post('/collections/{collection}/inspect', [CollectionController::class, 'inspect'])
        ->name('collections.inspect');

    Route::apiResource('cleaning-batches', CleaningBatchController::class)
        ->parameters(['cleaning-batches' => 'cleaningBatch']);
    Route::post('/cleaning-batches/{cleaningBatch}/add-items', [CleaningBatchController::class, 'addItems'])
        ->name('cleaning-batches.add-items');
    Route::post('/cleaning-batches/{cleaningBatch}/start', [CleaningBatchController::class, 'start'])
        ->name('cleaning-batches.start');
    Route::post('/cleaning-batches/{cleaningBatch}/complete', [CleaningBatchController::class, 'complete'])
        ->name('cleaning-batches.complete');

    Route::apiResource('inventory', InventoryController::class);
    Route::post('/inventory/stock-in', [InventoryController::class, 'stockIn'])
        ->name('inventory.stock-in');
    Route::post('/inventory/allocate', [InventoryController::class, 'allocate'])
        ->name('inventory.allocate');
    Route::get('/inventory-summary', [InventoryController::class, 'summary'])
        ->name('inventory.summary');

    Route::apiResource('reservations', ReservationController::class);
    Route::post('/reservations/{reservation}/approve', [ReservationController::class, 'approve'])
        ->name('reservations.approve');
    Route::post('/reservations/{reservation}/reject', [ReservationController::class, 'reject'])
        ->name('reservations.reject');
    Route::post('/reservations/{reservation}/pickup', [ReservationController::class, 'pickup'])
        ->name('reservations.pickup');

    Route::apiResource('size-changes', SizeChangeController::class)
        ->parameters(['size-changes' => 'sizeChange']);

    Route::apiResource('scrap-records', ScrapRecordController::class)
        ->parameters(['scrap-records' => 'scrapRecord']);
});
